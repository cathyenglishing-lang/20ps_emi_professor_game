# The 20Ps Framework EMI Game

這是可公開部署的 React/Vite 版 20Ps Framework EMI 教學遊戲。

建議部署架構：

- Vercel：部署前端遊戲網站。
- Railway：部署結果收集 API。
- Railway PostgreSQL：正式環境儲存作答結果。

本機測試時不需要先架資料庫。API 如果沒有讀到 `DATABASE_URL`，會把結果寫到 `server/data/results.json`。

## 本機測試

先安裝套件：

```bash
npm install
```

建立前端環境變數：

```bash
copy .env.example .env.local
```

建立後端環境變數：

```bash
copy server\.env.example server\.env
```

開兩個終端機：

```bash
npm run dev:api
```

```bash
npm run dev
```

預設網址：

- 前端遊戲：`http://localhost:5173`
- 後端健康檢查：`http://localhost:8787/health`
- Results 頁面：首頁右上角 `Results`

本機開發時如果 `RESULTS_ADMIN_TOKEN` 留空或沒有設定，Results API 會允許讀取；部署到 Railway 時請務必設定 `RESULTS_ADMIN_TOKEN`。

## Railway 後端部署

1. 在 Railway 建立新 project。
2. 加入 GitHub repo 作為 Node service。
3. 加入 PostgreSQL service。
4. 在 Node service 設定環境變數：
   - `DATABASE_URL`：引用 Railway PostgreSQL 提供的 `DATABASE_URL`。
   - `RESULTS_ADMIN_TOKEN`：你自己設定的一組管理密碼。
   - `ALLOWED_ORIGIN`：你的 Vercel 網址，例如 `https://your-site.vercel.app`。
   - `PGSSLMODE`：通常可不填；如果你的資料庫連線要求 SSL，設為 `require`。
5. Railway start command 設為：

```bash
npm run start:api
```

API 啟動時會自動建立 `game_results` 資料表。

## Vercel 前端部署

1. 在 Vercel 匯入同一個 GitHub repo。
2. 使用 Vite 預設設定：
   - Build command: `npm run build`
   - Output directory: `dist`
3. 在 Vercel 環境變數設定：
   - `VITE_RESULTS_API_URL`：Railway API 的公開網址，例如 `https://your-api.up.railway.app`

Vite 前端能讀取的環境變數必須用 `VITE_` 開頭。
