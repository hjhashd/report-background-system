#!/bin/bash

echo "启动开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 停止并删除已存在的容器
echo "清理已存在的开发环境容器..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" --profile dev down

# 构建并启动开发环境
echo "构建并启动开发环境..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" --profile dev up --build -d

echo "开发环境已启动，访问地址: http://localhost:3004"
echo "注意: 容器内运行在8000端口，通过3004端口映射到主机"
echo "查看日志: docker-compose -f \"$SCRIPT_DIR/docker-compose.yml\" --profile dev logs -f"