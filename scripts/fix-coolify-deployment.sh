#!/bin/bash

# Coolify Nixpacks 部署修复脚本
# 用于解决常见的部署问题

echo "🚀 开始修复 Coolify Nixpacks 部署问题..."

# 1. 检查必需文件
echo "📋 检查必需文件..."

if [ ! -f "nixpacks.toml" ]; then
    echo "❌ 缺少 nixpacks.toml 文件"
    echo "✅ 创建 nixpacks.toml 文件..."
    cat > nixpacks.toml << 'EOF'
[variables]
NIXPACKS_NODE_VERSION = "20"
NIXPACKS_PNPM_VERSION = "9"

[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["SKIP_ENV_VALIDATION=true pnpm run build"]

[start]
cmd = "pnpm start"
EOF
else
    echo "✅ nixpacks.toml 文件存在"
fi

# 2. 检查 package.json 构建脚本
echo "📋 检查 package.json 构建脚本..."

if ! grep -q '"build:docker"' package.json; then
    echo "⚠️  缺少 build:docker 脚本，添加中..."
    # 这里需要手动添加，因为 JSON 编辑比较复杂
    echo "请手动在 package.json 的 scripts 部分添加："
    echo '"build:docker": "SKIP_ENV_VALIDATION=true next build",'
else
    echo "✅ build:docker 脚本存在"
fi

# 3. 检查环境变量模板
echo "📋 检查环境变量模板..."

if [ ! -f ".env.example" ]; then
    echo "❌ 缺少 .env.example 文件"
else
    echo "✅ .env.example 文件存在"
fi

# 4. 清理缓存
echo "🧹 清理构建缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf dist

# 5. 验证依赖
echo "📦 验证依赖..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm 已安装"
    pnpm install --frozen-lockfile
else
    echo "❌ pnpm 未安装，请先安装 pnpm"
    exit 1
fi

# 6. 测试构建
echo "🔨 测试构建..."
SKIP_ENV_VALIDATION=true pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ 本地构建成功"
else
    echo "❌ 本地构建失败，请检查错误信息"
    exit 1
fi

echo ""
echo "🎉 修复完成！"
echo ""
echo "📝 接下来在 Coolify 中："
echo "1. 确保选择 'nixpacks' 作为构建包"
echo "2. 添加所有必需的环境变量"
echo "3. 重新部署项目"
echo ""
echo "🔗 详细部署指南: docs/COOLIFY_DEPLOYMENT.md"