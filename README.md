![](/public/logoNovaFy.png)

[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

# novaFi

Decentralized DeFi trading, staking and prediction platform. Includes real-time cryptocurrency data, token swap, NFTs and a blog backed by a SQLite database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (local file, no installation required) |
| Crypto data | CoinGecko API (real-time, no API key needed) |
| Wallets | Web3-React v8 (MetaMask, WalletConnect, Coinbase) |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

---

## Prerequisites

- **Node.js v20** or higher → [nodejs.org](https://nodejs.org)
- **npm** (bundled with Node.js)
- **Git** → [git-scm.com](https://git-scm.com)

No database installation required. SQLite is included as an npm dependency and the data file is created automatically the first time you run the project.

---

## Installation

```bash
# 1. Clone the repository
git clone git@github.com:Anderwqi10/imgblockchain.git
cd novaFi

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Create the environment file
cp backend/.env.example backend/.env
```

That's it. The database is created automatically the first time you run the project.

---

## Running the project

```bash
npm start
```

Open **http://localhost:2588** in your browser.

The backend starts on http://localhost:1357 and the SQLite database (`backend/database.sqlite`) is initialized automatically with sample data.

---

## Stopping the project

```bash
# Ctrl+C in the terminal where it's running

# Or manually free the ports:
kill $(lsof -t -i:2588)   # frontend
kill $(lsof -t -i:1357)   # backend
```

---

## Available commands

```bash
npm start          # Frontend + Backend together
npm run client     # Frontend only (port 2588)
npm run server     # Backend only (port 1357)
```

---

## Frontend views

| Route | View |
|---|---|
| `/swap` | Token swap with real-time BNB chart |
| `/overview` | Global market + top 10 coins with sparklines |
| `/coins` | BTC/ETH/XMR/LTC details + favorites |
| `/nft` | NFT gallery |
| `/blog` | Blog with database posts + login/register |
| `/prediction` | Prediction dashboard |

---

## API endpoints

All under `/api/pg/...`

### Auth
```
POST /api/pg/auth/register    { email, password, username }
POST /api/pg/auth/login       { email, password }
GET  /api/pg/auth/me          [requires token]
```

### Transactions
```
GET  /api/pg/transactions     [requires token]
POST /api/pg/transactions     { type, coin_id, coin_symbol, amount_usd, amount_coin }
```

### Favorites
```
GET    /api/pg/favorites           [requires token]
POST   /api/pg/favorites           { coin_id, coin_name, coin_symbol }
DELETE /api/pg/favorites/:coinId   [requires token]
```

### Blog
```
GET /api/pg/blog        ?limit=10&offset=0&category=DeFi
GET /api/pg/blog/:id
```

---

## Project structure

```
novaFi/
├── src/
│   ├── views/        # Swap, Overview, Coins, NFT, Blog
│   ├── components/   # Header, Footer, Router, ConnectWallet
│   ├── hooks/        # useLiveData, useAuth, useContract
│   └── services/     # coingecko.service.ts, pg.api.service.ts
├── backend/
│   ├── app.js           # Server entry point
│   ├── database.sqlite  # Data file (auto-created)
│   ├── db/              # SQLite connection + schema + init
│   ├── controllers/     # auth, transactions, favorites, blog
│   ├── middleware/      # JWT auth
│   └── routes/          # pg.routes.js + legacy routes
└── public/
```

---

## Security notes

- `backend/.env` is in `.gitignore` — never pushed to the repository
- `backend/database.sqlite` is in `.gitignore` — data stays local
- Passwords are hashed with bcrypt (12 rounds)
- JWT expires in 7 days
- Protected routes require `Authorization: Bearer <token>`
