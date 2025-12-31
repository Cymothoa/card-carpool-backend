# 部署指南

本文档介绍如何将小卡拼车系统部署到免费平台，使其可以通过公网访问。

## 部署方案

### 方案一：Vercel（前端）+ Railway（后端）⭐ 推荐

**优点：**
- 完全免费（有免费额度）
- 部署简单，自动化程度高
- 支持自动部署（GitHub集成）
- 性能好，速度快

### 方案二：Vercel（前端）+ Render（后端）

**优点：**
- 完全免费（有免费额度）
- 部署简单
- Render支持SQLite数据库

---

## 详细部署步骤

### 第一步：部署后端（Railway）

1. **注册Railway账号**
   - 访问 https://railway.app
   - 使用GitHub账号登录（推荐）

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置项目**
   - Railway会自动检测到Node.js项目
   - 在项目设置中配置以下环境变量：
     ```
     PORT=8000
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend-domain.vercel.app
     ```
   - 注意：将 `CORS_ORIGIN` 替换为你实际的前端域名

4. **设置启动命令**
   - 在Railway项目设置中，设置：
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

5. **获取后端URL**
   - Railway会为你的项目分配一个URL，例如：`https://your-backend.up.railway.app`
   - 记下这个URL，稍后配置前端时需要

### 第二步：部署前端（Vercel）

1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的GitHub仓库
   - 选择 `card-carpool/frontend` 目录作为根目录

3. **配置项目**
   - Framework Preset: 选择 "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **设置环境变量**
   - 在项目设置中添加环境变量：
     ```
     VITE_API_BASE_URL=https://your-backend.up.railway.app/api
     ```
   - 注意：将URL替换为你实际的后端URL

5. **部署**
   - 点击 "Deploy"
   - Vercel会自动构建并部署你的前端应用
   - 部署完成后会获得一个URL，例如：`https://your-app.vercel.app`

6. **更新后端CORS配置**
   - 回到Railway，更新环境变量：
     ```
     CORS_ORIGIN=https://your-app.vercel.app
     ```
   - 重启后端服务

### 第三步：验证部署

1. 访问前端URL，检查是否能正常加载
2. 尝试创建卡组，检查是否能正常连接后端
3. 检查浏览器控制台，确认没有CORS错误

---

## 方案二：使用Render部署后端

如果Railway不可用，可以使用Render：

1. **注册Render账号**
   - 访问 https://render.com
   - 使用GitHub账号登录

2. **创建Web Service**
   - 点击 "New" -> "Web Service"
   - 连接你的GitHub仓库
   - 选择 `card-carpool/backend` 目录

3. **配置服务**
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - 添加环境变量（同上）

4. **获取URL**
   - Render会分配一个URL，例如：`https://your-backend.onrender.com`

---

## 本地开发环境变量配置

### 后端环境变量（`.env`）

在 `card-carpool/backend/` 目录下创建 `.env` 文件：

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DB_PATH=./data/carpool.db
```

### 前端环境变量（`.env`）

在 `card-carpool/frontend/` 目录下创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 注意事项

1. **数据库持久化**
   - Railway和Render都支持持久化存储
   - SQLite数据库文件会保存在容器的文件系统中
   - 如果容器重启，数据会保留（在免费额度内）

2. **免费额度限制**
   - Railway：每月$5免费额度，适合小型项目
   - Render：免费服务在15分钟无活动后会休眠，首次请求会较慢
   - Vercel：完全免费，适合前端部署

3. **CORS配置**
   - 确保后端的 `CORS_ORIGIN` 环境变量包含前端域名
   - 支持多个域名时，可以用逗号分隔

4. **HTTPS**
   - Vercel和Railway都自动提供HTTPS证书
   - 无需额外配置

---

## 故障排查

### 前端无法连接后端

1. 检查 `VITE_API_BASE_URL` 环境变量是否正确
2. 检查后端CORS配置是否包含前端域名
3. 检查浏览器控制台的错误信息

### 后端启动失败

1. 检查环境变量是否正确配置
2. 检查数据库迁移是否成功执行
3. 查看Railway/Render的日志输出

### 数据库问题

1. 如果数据丢失，可以重新运行迁移：
   ```bash
   npm run db:migrate
   npm run db:init-user
   ```

---

## 快速部署脚本

如果你想快速部署，可以使用以下步骤：

1. **准备代码**
   ```bash
   # 确保代码已提交到GitHub
   git add .
   git commit -m "准备部署"
   git push
   ```

2. **部署后端（Railway）**
   - 登录Railway，导入项目
   - 配置环境变量
   - 等待部署完成

3. **部署前端（Vercel）**
   - 登录Vercel，导入项目
   - 设置根目录为 `frontend`
   - 配置环境变量（使用后端URL）
   - 等待部署完成

4. **更新CORS**
   - 在Railway中更新 `CORS_ORIGIN` 为前端URL

完成！现在你的应用已经可以通过公网访问了。
