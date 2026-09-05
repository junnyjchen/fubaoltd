#!/bin/bash
# =============================================================================
# FuBao 一键安装脚本（宝塔 / 通用 Linux）
#
# 用法（root 或 sudo）:
#   bash deploy/install.sh                                    # 全默认
#   bash deploy/install.sh --domain www.fubao.ltd             # 指定域名
#   bash deploy/install.sh --dir /www/wwwroot/fubao --port 5000
#   REPO_URL=git@github.com:you/fubao.git bash deploy/install.sh   # env 覆盖
#
# 仓库已公开（public）时：无需任何认证，直接运行即可。
# 私有仓库认证（GitHub 已不支持账号密码，详见 git_auth_help 输出）:
#   方式 A：REPO_URL=git@github.com:junnyjchen/fubaoltd.git \
#           DEPLOY_KEY=/root/fubao_deploy_key bash deploy/install.sh
#   方式 B：GITHUB_TOKEN=github_pat_xxx bash deploy/install.sh
#           （token 会持久化到 deploy/fubao.env，后续 update.sh 免密拉取）
#
# 幂等：目录 / env / 证书已存在则保留；Nginx 配置每次重写（可安全重跑）。
#
# 流程：环境检查 → 克隆仓库 → 生成 env（随机 JWT_SECRET）→ 构建
#       → PM2 守护（单实例）→ Nginx 反代（www + apex 301）→ 健康检查
# =============================================================================
set -euo pipefail

# ----------------------------- 默认配置 ---------------------------------------
APP_DIR="/www/wwwroot/fubao.ltd"
REPO_URL="https://github.com/junnyjchen/fubaoltd.git"
BRANCH="main"
DOMAIN="www.fubao.ltd"
PORT="5000"
PM2_NAME="fubao"
ENV_FILE_REL="deploy/fubao.env"

# ----------------------------- 参数解析 ---------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --repo)   REPO_URL="${2:-}"; shift 2 ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    --dir)    APP_DIR="${2:-}"; shift 2 ;;
    --port)   PORT="${2:-}"; shift 2 ;;
    --name)   PM2_NAME="${2:-}"; shift 2 ;;
    --deploy-key) DEPLOY_KEY="${2:-}"; shift 2 ;;   # SSH 私钥路径（私有仓库免密）
    --token)  GITHUB_TOKEN="${2:-}"; shift 2 ;;     # GitHub PAT（私有仓库 HTTPS 免密）
    -h|--help)
      sed -n '3,12p' "$0"; exit 0 ;;
    *) echo "未知参数：$1（--help 查看用法）" >&2; exit 1 ;;
  esac
done
# 说明：env 文件是持久配置源——首次运行把 CLI 参数写入 env；
# 后续重跑时 env 文件中的值优先生效（改端口请直接编辑 env 文件）。
REPO_URL="${REPO_URL:-https://github.com/junnyjchen/fubaoltd.git}"
BRANCH="${BRANCH:-main}"

# ----------------------------- Git 认证（免交互） ------------------------------
# 私有仓库 clone/pull 需要认证。GitHub 自 2021-08 起不再接受账号密码，
# 只认 Personal Access Token 或 SSH key。此处把认证显式注入，并禁止
# 交互式提示 —— 无人值守运行时认证缺失会立刻失败，而不是卡住等输入。
DEPLOY_KEY="${DEPLOY_KEY:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
export GIT_TERMINAL_PROMPT=0
if [[ "$REPO_URL" == git@* || "$REPO_URL" == ssh://* ]] && [[ -n "$DEPLOY_KEY" ]]; then
  [[ -f "$DEPLOY_KEY" ]] || die "DEPLOY_KEY 私钥文件不存在：$DEPLOY_KEY"
  chmod 600 "$DEPLOY_KEY" 2>/dev/null || true
  export GIT_SSH_COMMAND="ssh -i '$DEPLOY_KEY' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  c_ok "Git 认证：SSH deploy key（$DEPLOY_KEY）"
fi

git_authed() {
  if [[ -n "$GITHUB_TOKEN" ]]; then
    # token 经 credential helper 注入：不写入 .git/config，不留在 remote URL
    git -c credential.helper= \
        -c "credential.helper=!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f" \
        "$@"
  else
    git "$@"
  fi
}

git_auth_help() {
  c_err ""
  c_err "克隆/拉取失败。若仓库为私有，需要认证（GitHub 已不支持账号密码）："
  c_err ""
  c_err "方式 A（推荐，只读部署钥，一次配置永久免密）："
  c_err "  1) ssh-keygen -t ed25519 -C fubao-deploy -f /root/fubao_deploy_key -N ''"
  c_err "  2) cat /root/fubao_deploy_key.pub"
  c_err "  3) GitHub 仓库 → Settings → Deploy keys → Add deploy key（粘贴公钥，不勾 write）"
  c_err "  4) 重跑：REPO_URL=git@github.com:junnyjchen/fubaoltd.git"
  c_err "          DEPLOY_KEY=/root/fubao_deploy_key bash deploy/install.sh"
  c_err ""
  c_err "方式 B（Personal Access Token）："
  c_err "  1) GitHub → Settings → Developer settings → Personal access tokens →"
  c_err "     Fine-grained tokens → Generate（仓库选 fubaoltd，权限 Contents: Read-only）"
  c_err "  2) 重跑：GITHUB_TOKEN=github_pat_xxx bash deploy/install.sh"
}

# apex 域名 = 去掉 www. 前缀
APEX_DOMAIN="$DOMAIN"
[[ "$APEX_DOMAIN" == www.* ]] && APEX_DOMAIN="${APEX_DOMAIN#www.}"

# ----------------------------- 输出工具 ---------------------------------------
c_info()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
c_ok()    { printf '\033[1;32m[ OK ]\033[0m %s\n' "$*"; }
c_warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
c_err()   { printf '\033[1;31m[FAIL]\033[0m %s\n' "$*"; }
die()     { c_err "$*"; exit 1; }

echo "============================================================"
echo " FuBao 一键安装   域名 $DOMAIN   目录 $APP_DIR"
echo "============================================================"

# ----------------------------- 1. 权限与系统检查 ------------------------------
[[ $EUID -eq 0 ]] || die "请用 root 运行：sudo bash deploy/install.sh"

command -v git >/dev/null 2>&1 \
  || die "未安装 git：CentOS 执行 yum install -y git / Ubuntu 执行 apt install -y git"

# 小内存机器（<2G 且无 swap）提醒：next build 需要较多内存
total_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 9999999)
swap_kb=$(awk '/SwapTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
if [[ "$total_kb" -lt 1900000 && "$swap_kb" -lt 1000000 ]]; then
  c_warn "检测到内存 < 2G 且无 swap，next build 可能 OOM。建议先执行："
  c_warn "  dd if=/dev/zero of=/swapfile bs=1M count=2048 && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
fi

# ----------------------------- 2. Node / pnpm / pm2 --------------------------
if ! command -v node >/dev/null 2>&1; then
  c_err "未检测到 Node.js（要求 >= 20）。"
  c_err "宝塔面板：软件商店 → Node.js 版本管理器 → 安装 Node 22/24 并设为默认。"
  die  "安装后重新运行本脚本。"
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" -lt 20 ]]; then
  die "Node 版本过低（当前 $(node -v)，要求 >= 20）。请在宝塔 Node 版本管理器切换到 22/24。"
fi
c_ok "Node $(node -v)"

command -v pnpm >/dev/null 2>&1 || { c_info "安装 pnpm..."; npm install -g pnpm@9 >/dev/null; }
command -v pm2  >/dev/null 2>&1 || { c_info "安装 pm2...";  npm install -g pm2  >/dev/null; }
c_ok "pnpm $(pnpm -v) / pm2 $(pm2 -v)"

# ----------------------------- 3. 获取代码 ------------------------------------
if [[ -d "$APP_DIR/.git" ]]; then
  c_info "目录已存在，复用：$APP_DIR"
  git_authed -C "$APP_DIR" fetch --all --prune >/dev/null 2>&1 || true
  current_branch="$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)"
  if [[ "$current_branch" != "$BRANCH" ]]; then
    c_warn "当前分支 $current_branch != $BRANCH，不自动切换，按现状部署。"
  fi
else
  c_info "克隆仓库：$REPO_URL → $APP_DIR"
  mkdir -p "$(dirname "$APP_DIR")"
  if ! git_authed clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"; then
    rm -rf "$APP_DIR"
    git_auth_help
    die "认证失败或仓库不存在（REPO_URL=$REPO_URL）"
  fi
fi
cd "$APP_DIR"

# ----------------------------- 4. 环境变量文件 --------------------------------
ENV_FILE="$APP_DIR/$ENV_FILE_REL"
mkdir -p "$(dirname "$ENV_FILE")"
if [[ -f "$ENV_FILE" ]]; then
  c_ok "env 已存在，保留现有配置：$ENV_FILE_REL"
else
  c_info "生成 env：$ENV_FILE_REL（随机 JWT_SECRET）"
  if command -v openssl >/dev/null 2>&1; then
    jwt_secret="$(openssl rand -hex 32)"
  else
    jwt_secret="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  fi
  cat > "$ENV_FILE" <<EOF
# FuBao 生产环境变量（此文件不入 git，可手工补充下列可选项）
PORT=$PORT
NODE_ENV=production
COZE_PROJECT_ENV=PROD
NEXT_PUBLIC_BASE_URL=https://$DOMAIN
COZE_PROJECT_DOMAIN_DEFAULT=https://$DOMAIN
JWT_SECRET=$jwt_secret

# ---- 可选项（按需取消注释）----
# COZE_API_TOKEN=          # AI 助手/翻译（不填则 /api/ai/* 返回 503）
# COZE_BUCKET_NAME=        # 对象存储（不填则商品图片上传不可用，前台回退手绘纹样）
# COZE_BUCKET_ENDPOINT_URL=
# COZE_BUCKET_AK=
# COZE_BUCKET_SK=
# STRIPE_SECRET_KEY=       # Stripe 支付
EOF
  chmod 600 "$ENV_FILE"
  c_ok "JWT_SECRET 已随机生成（openssl rand -hex 32）"
fi

# 提供过 GITHUB_TOKEN 时持久化到 env（update.sh 拉取时复用，避免再次传入）
if [[ -n "$GITHUB_TOKEN" ]] && ! grep -qE '^GITHUB_TOKEN=' "$ENV_FILE"; then
  printf 'GITHUB_TOKEN=%s\n' "$GITHUB_TOKEN" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  c_ok "GITHUB_TOKEN 已写入 $ENV_FILE_REL（update.sh 拉取时自动复用）"
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
PORT="${PORT:-5000}"

# ----------------------------- 5. 构建 ----------------------------------------
c_info "构建（依赖安装 + next build + tsup 打包 dist/server.js）..."
bash ./scripts/build.sh
[[ -f dist/server.js ]] || die "构建产物缺失：dist/server.js"

# ----------------------------- 6. PM2 守护（单实例）---------------------------
# globalThis 内存态（订单/优惠券/评论等）要求单实例，禁止 cluster 多开
c_info "PM2 启动：$PM2_NAME (127.0.0.1:$PORT)"
pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true
pm2 start dist/server.js --name "$PM2_NAME" --time \
  --log-date-format "YYYY-MM-DD HH:mm:ss" >/dev/null
pm2 save >/dev/null
c_ok "PM2 已启动并保存（pm2 startup 可设置开机自启）"

# 健康检查（本地端口）
health_ok() { curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; }
up=0
for _ in $(seq 1 15); do
  if health_ok; then up=1; break; fi
  sleep 2
done
if [[ "$up" -ne 1 ]]; then
  pm2 logs "$PM2_NAME" --lines 30 --nostream || true
  die "服务启动后健康检查失败"
fi
c_ok "本地健康检查通过 (http://127.0.0.1:$PORT/)"

# ----------------------------- 7. Nginx 反向代理 ------------------------------
nginx_bin="$(command -v nginx || true)"
if [[ -z "$nginx_bin" ]]; then
  c_warn "未检测到 Nginx：请在宝塔软件商店安装 Nginx 后重跑本脚本，"
  c_warn "或手工将 $DOMAIN 反代到 127.0.0.1:$PORT"
else
  if [[ -d /www/server/panel/vhost/nginx ]]; then
    conf_dir=/www/server/panel/vhost/nginx       # 宝塔
    log_dir=/www/wwwlogs
  else
    conf_dir=/etc/nginx/conf.d                   # 通用 nginx
    log_dir=/var/log/nginx
  fi
  mkdir -p "$log_dir"
  conf="$conf_dir/${APEX_DOMAIN}.conf"

  # 证书存在（宝塔面板签发后重跑脚本可自动升级为 HTTPS 配置）
  cert_dir=/www/server/panel/vhost/cert/$DOMAIN
  ssl_block=""
  redirect_block=""
  if [[ -f "$cert_dir/fullchain.pem" && -f "$cert_dir/privkey.pem" ]]; then
    c_ok "检测到已签发证书，生成 HTTPS 配置"
    ssl_block="    listen 443 ssl http2;
    ssl_certificate     $cert_dir/fullchain.pem;
    ssl_certificate_key $cert_dir/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;"
    redirect_block="    if (\$scheme = http) { return 301 https://\$host\$request_uri; }"
  else
    c_warn "尚未检测到 SSL 证书，当前仅生成 HTTP 配置"
    c_warn "宝塔面板 → 网站 → $DOMAIN → SSL → Let's Encrypt 一键签发后，重跑本脚本即自动启用 HTTPS"
  fi

  c_info "写入 Nginx 配置：$conf"
  cat > "$conf" <<EOF
# FuBao reverse proxy — generated by deploy/install.sh ($DOMAIN)
server {
    listen 80;
    server_name $APEX_DOMAIN;
    return 301 \$scheme://$DOMAIN\$request_uri;
}

server {
    listen 80;
$ssl_block
    server_name $DOMAIN;
$redirect_block

    client_max_body_size 10m;

    # API：关闭缓冲，支持 AI 聊天 SSE 流式输出与图片上传
    location /api/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }

    # 页面与静态资源
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    access_log $log_dir/${APEX_DOMAIN}.log;
    error_log  $log_dir/${APEX_DOMAIN}.error.log;
}
EOF

  nginx -t >/dev/null 2>&1 || { nginx -t || true; die "nginx 配置校验失败，请检查上方输出"; }
  nginx -s reload >/dev/null 2>&1 || systemctl reload nginx >/dev/null 2>&1 || true
  c_ok "Nginx 已重载（$DOMAIN → 127.0.0.1:$PORT）"
fi

# ----------------------------- 8. 完成 ----------------------------------------
echo
c_ok "================ 安装完成 ================"
echo "  站点目录 : $APP_DIR"
echo "  访问地址 : http://$DOMAIN"
if [[ -n "$ssl_block" ]]; then
  echo "             （HTTPS 已启用）"
fi
echo "  进程管理 : pm2 logs $PM2_NAME | pm2 restart $PM2_NAME"
echo "  更新部署 : bash $APP_DIR/deploy/update.sh"
echo
echo "  后续建议："
echo "   1) DNS 解析：A 记录 $APEX_DOMAIN 与 $DOMAIN → 本机公网 IP"
if [[ -z "$ssl_block" ]]; then
  echo "   2) 宝塔面板为 $DOMAIN 签发 SSL 证书后重跑 install.sh，自动启用 HTTPS"
fi
echo "   3) 可编辑 $ENV_FILE_REL 补充 COZE_API_TOKEN / 对象存储等密钥，"
echo "      然后执行 bash deploy/update.sh --force 生效"
