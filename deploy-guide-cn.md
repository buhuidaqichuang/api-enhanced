# 网易云音乐 API Enhanced — 国内云端部署指南（5人小圈子 / 免费）

目标：把本项目**免费**部署到国内可访问的云端，得到固定 HTTPS 地址，
让你的移动 App 直接对接，无需依赖随时会挂的公开实例。

## 免费方案结论（重要）

| 方案 | 是否免费 | 国内速度 | 开箱即用 |
|------|----------|----------|----------|
| **腾讯云 Serverless** | ✅ 真免费（每月10万次调用额度，5人用不完） | ✅ 快 | ✅ 是 |
| Cloudflare Workers | ✅ 免费 | ⚠️ 一般 | ❌ 需改造代码 |
| 轻量应用服务器 | ❌ 约30-60元/月 | ✅ 快 | ✅ 是 |
| Vercel / Railway | ✅ 免费 | ❌ 海外慢/被墙 | ✅ 是 |

**结论：国内 + 免费 + 开箱即用 = 腾讯云 Serverless（下文唯一方案）。**
唯一前置条件：腾讯云账号需实名认证（免费，用身份证）。

> 已内置 `scf_bootstrap`（已配好解灰环境变量），直接可用。

---

## 关键环境变量（务必设置）

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `ENABLE_GENERAL_UNBLOCK` | `true` | 全局解灰，VIP/灰色歌曲自动解锁（5人小圈子强烈建议开） |
| `ENABLE_FLAC` | `true` | 允许无损音质 |
| `CORS_ALLOW_ORIGIN` | `*` 或你的App域名 | 跨域允许，原生App可设 `*` |
| `ENABLE_RANDOM_CN_IP` | `false` | 国内服务器本身就在国内，无需随机IP |
| `NETEASE_COOKIE` | 可选 | 登录态cookie，仅当你要听"个人歌单/云盘"才需要 |

> 解灰（Unblock）功能依赖 `@neteasecloudmusicapienhanced/unblockmusic-utils`，
> 在部署环境中会自动运行，无需额外配置。

---

## 方案一（唯一免费方案）：腾讯云 Serverless

适合：不想花一分钱、国内低延迟、5人小流量。**完全免费**。

### 费用说明
- 免费额度：**每月 10 万次调用 + 40 万 GBs 资源使用量**，5人听歌远远用不完
- 前提：腾讯云账号需**实名认证**（免费，上传身份证）
- 没有服务器月费、没有域名费用（API 网关自带二级域名）

### 步骤
1. 注册并实名腾讯云：https://cloud.tencent.com （用微信扫码即可）
2. 打开 Serverless 控制台：https://console.cloud.tencent.com/scf
3. 左侧「函数服务」→ 「新建」→ 创建方式选「Web 函数」
4. 运行环境选 **Nodejs 18.15** 或更高
5. 提交方式选「代码托管」→ 授权关联你 **fork 的 GitHub 仓库**
   （或选「本地上传」→ 把项目打包成 zip 上传，需含 `app.js`、`module/`、`util/`、`scf_bootstrap` 等全部文件）
6. **启动文件**已自动识别 `scf_bootstrap`（已配好解灰等环境变量），无需改动
7. 在函数配置里确认环境变量已生效（或手动补 `ENABLE_GENERAL_UNBLOCK=true`）
8. 左侧「触发器管理」→ 创建「API 网关」触发器（前端类型：HTTP）
9. 创建后得到公网地址，形如：
   ```
   https://service-xxxxxxx-130xxxxxxx.apigw.tencentcs.com/release
   ```
10. App 里把这个地址作为 `API_BASE` 即可

### 注意
- 冷启动：函数闲置后首次请求可能慢 1~3 秒，属正常
- 如需减少冷启动，可在「函数配置」开启「固定公网出口」或配置最小实例（可能计费，按需）
- 解灰功能在云端运行时自动生效，无需额外配置

---

## 方案二（付费可选）：轻量应用服务器 + Docker

仅在「免费额度不够」或「想要最高稳定性/代理能力」时考虑，约 30~60 元/月。

```bash
docker pull moefurina/ncm-api:latest
docker compose up -d   # 用仓库内 docker-compose.yml，已开启解灰
```
详见 `docker-compose.yml`。访问 `http://服务器IP:3000/search?keywords=小半` 验证。

---

## 验证部署是否成功

部署后，浏览器或 App 请求以下地址，全部返回 JSON 即成功：

```
# 1. 搜索
GET {API_BASE}/search?keywords=小半&limit=5

# 2. 解灰播放 VIP 歌曲（取上面返回的 id）
GET {API_BASE}/song/url/match?id=421423806

# 3. 歌词
GET {API_BASE}/lyric?id=421423806
```

---

## App 对接要点（给移动端）

- `API_BASE` 设为你的云端地址（如 `https://xxx.apigw.tencentcs.com/release`）
- 建议 App 内支持「手动填备用地址」，万一实例挂了可切换
- 解灰接口返回 `data` 字段即播放 URL，直接交给播放器
- 兜底：返回非 200 / 空 URL 时提示"该歌曲暂不可播放"

---

## 合规提醒

解灰属于绕过版权保护的灰色地带。仅限个人/小圈子（≤5人）学习研究使用，
请勿公开商业化分发，避免法律风险。
