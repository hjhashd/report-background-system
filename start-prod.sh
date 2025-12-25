#!/bin/bash

echo "启动生产环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 停止并删除已存在的容器
echo "清理已存在的生产环境容器..."
docker-compose -f docker-compose.yml --profile prod down

# 构建并启动生产环境
echo "构建并启动生产环境..."
docker-compose -f docker-compose.yml --profile prod up --build -d

echo "生产环境已启动，访问地址: http://localhost:3004"
echo "注意: 容器内使用serve静态服务器运行在8000端口，通过3003端口映射到主机"
echo "查看日志: docker-compose -f docker-compose.yml --profile prod logs -f"