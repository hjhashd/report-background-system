#!/bin/bash

echo "停止所有服务..."

# 停止所有配置文件中的服务
echo "停止开发环境服务..."
docker-compose -f docker-compose.yml --profile dev down

echo "停止生产环境服务..."
docker-compose -f docker-compose.yml --profile prod down

echo "所有服务已停止"