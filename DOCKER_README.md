# Docker 部署指南

本项目提供了完整的Docker部署方案，支持开发环境和生产环境。

## 文件说明

- `Dockerfile`: 生产环境Docker文件
- `Dockerfile.dev`: 开发环境Docker文件
- `docker-compose.yml`: Docker Compose配置文件，定义了各种服务
- `start-dev.sh`: 开发环境启动脚本
- `start-prod.sh`: 生产环境启动脚本
- `stop-all.sh`: 停止所有服务脚本

## 快速开始

### 开发环境

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### 生产环境

```bash
chmod +x start-prod.sh
./start-prod.sh
```

### 停止所有服务

```bash
chmod +x stop-all.sh
./stop-all.sh
```

## 手动使用Docker Compose

### 启动开发环境
```bash
docker-compose --profile dev up --build -d
```

### 启动生产环境
```bash
docker-compose --profile prod up --build -d
```

### 查看日志
```bash
# 开发环境日志
docker-compose --profile dev logs -f

# 生产环境日志
docker-compose --profile prod logs -f
```

## 服务端口

- 前端应用: 3003 (主机端口)
  - 开发环境: 容器内8000端口映射到主机3003端口
  - 生产环境: 容器内8000端口映射到主机3003端口

## 注意事项

1. 确保Docker已安装并正在运行
2. 项目将在3003端口上运行
3. 开发环境支持热重载
4. 生产环境使用serve静态服务器提供静态文件服务
5. 项目使用yarn作为包管理器
6. 开发和生产环境中，容器内都运行在8000端口，通过3003端口映射到主机

## 环境变量

- 开发环境:
  - NODE_ENV=development
  - VUE_APP_PREVIEW=true
  - VUE_APP_API_BASE_URL=http://localhost:8080/stage-api

- 生产环境:
  - NODE_ENV=production
  - VUE_APP_PREVIEW=false
  - VUE_APP_API_BASE_URL=/stage-api