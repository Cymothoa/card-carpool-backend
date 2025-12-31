# 部署检查清单

使用此清单确保部署过程顺利进行。

## 部署前准备

- [ ] 代码已提交到GitHub仓库
- [ ] 测试数据库已清空（已执行 `npm run db:reset`）
- [ ] 本地测试通过，前后端可以正常通信

## 后端部署（Railway）

- [ ] 注册Railway账号（https://railway.app）
- [ ] 创建新项目，连接GitHub仓库
- [ ] 选择 `card-carpool/backend` 目录
- [ ] 配置环境变量：
  - [ ] `PORT=8000`
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN=https://your-frontend.vercel.app`（先填临时值，部署前端后更新）
- [ ] 设置构建命令：`npm install && npm run build`
- [ ] 设置启动命令：`npm start`
- [ ] 等待部署完成
- [ ] 复制后端URL（例如：`https://xxx.up.railway.app`）

## 前端部署（Vercel）

- [ ] 注册Vercel账号（https://vercel.com）
- [ ] 导入GitHub仓库
- [ ] 设置根目录为 `card-carpool/frontend`
- [ ] 配置构建设置：
  - [ ] Framework Preset: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] 添加环境变量：
  - [ ] `VITE_API_BASE_URL=https://your-backend.up.railway.app/api`
- [ ] 部署完成
- [ ] 复制前端URL（例如：`https://xxx.vercel.app`）

## 配置更新

- [ ] 回到Railway，更新 `CORS_ORIGIN` 环境变量为前端Vercel URL
- [ ] 重启Railway服务（或等待自动重启）

## 验证部署

- [ ] 访问前端URL，页面正常加载
- [ ] 打开浏览器开发者工具，检查控制台无错误
- [ ] 尝试创建卡组，功能正常
- [ ] 检查网络请求，API调用成功
- [ ] 测试移动端访问（手机浏览器）

## 常见问题

### 前端无法连接后端
- [ ] 检查 `VITE_API_BASE_URL` 是否正确
- [ ] 检查后端CORS配置是否包含前端域名
- [ ] 检查后端服务是否正常运行

### 后端启动失败
- [ ] 检查Railway日志，查看错误信息
- [ ] 确认环境变量配置正确
- [ ] 确认数据库迁移已执行

### CORS错误
- [ ] 确认后端 `CORS_ORIGIN` 包含前端完整URL（包括https://）
- [ ] 确认前后端都使用HTTPS

## 部署完成

✅ 所有检查项完成后，你的应用已经成功部署！

**访问地址：**
- 前端：https://your-app.vercel.app
- 后端API：https://your-backend.up.railway.app/api

**提示：**
- 保存好前后端的URL，后续可能需要分享给用户
- 如果遇到问题，查看 [DEPLOY.md](./DEPLOY.md) 中的故障排查部分
