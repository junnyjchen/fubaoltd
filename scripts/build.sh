#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
# 部署脚本（install.sh / update.sh）会先 source deploy/fubao.env 再调用本脚本，
# 其中 NODE_ENV=production 会让 pnpm 跳过所有 devDependencies —— 而 typescript /
# tsup / tailwindcss 全是构建期 devDeps，缺失时 next build 在转译 next.config.ts
# 第一步就失败（"Cannot find module 'typescript'"）。
# 因此安装步骤强制 development 模式保证全量依赖落盘；next build 的生产构建
# 语义不受影响（它内部固定按 production 处理）。
NODE_ENV=development pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

# 防线：devDependencies 仍缺失时立即给出可定位的错误，
# 而不是让 next build 抛出晦涩的转译栈（如 .npmrc 被外部设置 production=true）。
if ! node -e "require.resolve('typescript')" >/dev/null 2>&1; then
  echo "ERROR: typescript 不可用 —— devDependencies 未被安装。" >&2
  echo "       排查：项目或全局 ~/.npmrc 是否设置 production=true，或 NPM_CONFIG_PRODUCTION=true。" >&2
  exit 1
fi

echo "Building the Next.js project..."
pnpm next build

echo "Bundling server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
