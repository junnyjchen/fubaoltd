#!/bin/bash
# =============================================================================
# FuBao 一键更新脚本
#
# 用法（root 或 sudo，在任意目录均可）:
#   bash deploy/update.sh              # 拉取最新代码 → 构建 → 金丝雀预检 → 平滑重启
#   bash deploy/update.sh --force      # 代码无更新也强制重新构建
#   APP_DIR=/www/wwwroot/fubao.ltd bash deploy/update.sh
#
# 仓库公开（public）时无需认证直接运行；私有仓库的认证配置见脚本内说明。
#
# 安全设计：金丝雀预检 —— 新构建先在临时端口 5099 试启动并做健康检查，
# 通过后才 reload 线上进程；构建或预检失败时线上服务不受影响，仍运行旧版本。
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/fubao.ltd}"
PM2_NAME="${PM2_NAME:-fubao}"
ENV_FILE_REL="deploy/fubao.env"
CANARY_PORT="${CANARY_PORT:-5099}"
CANARY_NAME="${PM2_NAME}-canary"
FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

c_info()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
c_ok()    { printf '\033[1;32m[ OK ]\033[0m %s\n' "$*"; }
c_warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
c_err()   { printf '\033[1;31m[FAIL]\033[0m %s\n' "$*"; }
die()     { c_err "$*"; exit 1; }

cd "$APP_DIR" 2>/dev/null || die "目录不存在：$APP_DIR（用 APP_DIR=... 指定）"

cleanup_canary() {
  pm2 delete "$CANARY_NAME" >/dev/null 2>&1 || true
}
trap cleanup_canary EXIT

# ----------------------------- 0. Git 认证（免交互） ---------------------------
# 私有仓库 fetch/pull 需要认证（GitHub 已不支持账号密码）。
# 认证来源优先级：环境变量 > deploy/fubao.env 中的 GITHUB_TOKEN > 仓库内 deploy/deploy_key。
# GIT_TERMINAL_PROMPT=0 保证无人值守时认证缺失立刻失败，而不是卡住等输入。
DEPLOY_KEY="${DEPLOY_KEY:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
_ENV_EARLY="$APP_DIR/$ENV_FILE_REL"
if [[ -z "$GITHUB_TOKEN" && -f "$_ENV_EARLY" ]]; then
  GITHUB_TOKEN="$(grep -E '^GITHUB_TOKEN=' "$_ENV_EARLY" | tail -1 | cut -d= -f2-)"
  GITHUB_TOKEN="${GITHUB_TOKEN//\"/}"
  GITHUB_TOKEN="${GITHUB_TOKEN//\'/}"
fi
[[ -z "$DEPLOY_KEY" && -f "$APP_DIR/deploy/deploy_key" ]] && DEPLOY_KEY="$APP_DIR/deploy/deploy_key"

export GIT_TERMINAL_PROMPT=0
if [[ -n "$DEPLOY_KEY" ]]; then
  chmod 600 "$DEPLOY_KEY" 2>/dev/null || true
  export GIT_SSH_COMMAND="ssh -i '$DEPLOY_KEY' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  c_ok "Git 认证：SSH deploy key（$DEPLOY_KEY）"
fi

git_authed() {
  if [[ -n "$GITHUB_TOKEN" ]]; then
    git -c credential.helper= \
        -c "credential.helper=!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f" \
        "$@"
  else
    git "$@"
  fi
}

# ----------------------------- 1. 工作区检查 ----------------------------------
if [[ -n "$(git status --porcelain)" ]]; then
  c_warn "工作区有未提交改动，为避免冲突中止更新："
  git status --short | head -10
  die "请先 commit/stash，或确认后执行 git reset --hard 再运行"
fi

# ----------------------------- 2. 拉取代码 ------------------------------------
git_authed fetch --all --prune >/dev/null 2>&1 \
  || { c_err "git fetch 失败 —— 若仓库为私有，请配置认证（install.sh 传 --token/--deploy-key，"
             "或把 GITHUB_TOKEN 写入 deploy/fubao.env，或在 $APP_DIR/deploy/ 放 deploy_key 私钥）"; exit 1; }
OLD_REV="$(git rev-parse HEAD)"
git_authed pull --ff-only >/dev/null 2>&1 \
  || die "git pull 失败（可能存在分叉），请手工处理后再试"
NEW_REV="$(git rev-parse HEAD)"

if [[ "$OLD_REV" == "$NEW_REV" && "$FORCE" -eq 0 ]]; then
  c_ok "已是最新版本（$(git log -1 --format='%h %s')），无需更新"
  exit 0
fi
c_info "更新：${OLD_REV:0:7} → ${NEW_REV:0:7}"
git log --oneline "$OLD_REV..$NEW_REV" | head -15 || true

# ----------------------------- 3. 载入环境变量 --------------------------------
ENV_FILE="$APP_DIR/$ENV_FILE_REL"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  c_ok "已载入 $ENV_FILE_REL"
else
  c_warn "未找到 $ENV_FILE_REL，将使用默认环境变量（JWT_SECRET 为弱默认值！）"
  c_warn "建议先运行 bash deploy/install.sh 生成 env 文件"
fi
PORT="${PORT:-5000}"
export NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL:-https://www.fubao.ltd}"
export COZE_PROJECT_DOMAIN_DEFAULT="${COZE_PROJECT_DOMAIN_DEFAULT:-https://www.fubao.ltd}"
export COZE_PROJECT_ENV=PROD
export NODE_ENV=production

# ----------------------------- 4. 构建（失败即止，不影响线上）------------------
c_info "构建新版本..."
if ! bash ./scripts/build.sh; then
  c_err "构建失败 —— 线上仍运行旧版本（${OLD_REV:0:7}），未做任何重启。"
  c_err "修复后重试，或回滚代码：git reset --hard $OLD_REV"
  exit 1
fi
[[ -f dist/server.js ]] || { c_err "产物缺失 dist/server.js，线上仍运行旧版本"; exit 1; }

# ----------------------------- 5. 金丝雀预检（临时端口试跑）--------------------
# 新构建先用 CANARY_PORT 启动并健康检查，通过才切换线上进程。
# 失败则删除金丝雀进程并退出，线上继续运行旧版本。
pm2 delete "$CANARY_NAME" >/dev/null 2>&1 || true
c_info "金丝雀预检：在 127.0.0.1:$CANARY_PORT 试启动新构建..."
PORT="$CANARY_PORT" pm2 start dist/server.js --name "$CANARY_NAME" >/dev/null

canary_ok() { curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:${CANARY_PORT}/" >/dev/null 2>&1; }
canary_up=0
for _ in $(seq 1 15); do
  if canary_ok; then canary_up=1; break; fi
  sleep 2
done
if [[ "$canary_up" -ne 1 ]]; then
  pm2 logs "$CANARY_NAME" --lines 30 --nostream || true
  pm2 delete "$CANARY_NAME" >/dev/null 2>&1 || true
  c_err "金丝雀预检失败 —— 新构建无法启动或健康检查不通过。"
  c_err "线上仍运行旧版本（${OLD_REV:0:7}），未做任何重启。"
  c_err "回滚代码：git reset --hard $OLD_REV"
  exit 1
fi
pm2 delete "$CANARY_NAME" >/dev/null 2>&1 || true
c_ok "金丝雀预检通过"

# ----------------------------- 6. 切换线上进程 --------------------------------
c_info "PM2 平滑重启：$PM2_NAME"
pm2 reload "$PM2_NAME" --update-env >/dev/null 2>&1 \
  || pm2 restart "$PM2_NAME" --update-env >/dev/null 2>&1 \
  || pm2 start dist/server.js --name "$PM2_NAME" >/dev/null
pm2 save >/dev/null

health_ok() { curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; }
up=0
for i in $(seq 1 15); do
  if health_ok; then up=1; break; fi
  sleep 2
done

if [[ "$up" -eq 1 ]]; then
  c_ok "更新完成并通过健康检查：$(git log -1 --format='%h %s')"
else
  c_err "切换后健康检查失败！查看日志：pm2 logs $PM2_NAME --lines 50 --nostream"
  echo
  c_warn "回滚到上一版本（${OLD_REV:0:7}）："
  c_warn "  cd $APP_DIR && git reset --hard $OLD_REV && bash deploy/update.sh --force"
  exit 1
fi
