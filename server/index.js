/**
 * Simple Express backend for Mines WebApp
 * Endpoints:
 *  - POST /api/register { telegramId }    -> creates user with default balance (1000) or returns existing
 *  - POST /api/update-balance { telegramId, change } -> adds change (pos or neg) to user balance
 *  - POST /api/game { telegramId, profit } -> records a game profit (can be negative)
 *  - GET  /api/stats/day   -> top profit per telegram_id for current day
 *  - GET  /api/stats/week  -> top profit per telegram_id for last 7 days
 *
 * DB: PostgreSQL connection via DATABASE_URL in .env
 */

import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/register", async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) return res.status(400).json({ error: "telegramId required" });
  try {
    const existing = await pool.query("SELECT * FROM users WHERE telegram_id=$1", [telegramId]);
    if (existing.rows.length) {
      return res.json(existing.rows[0]);
    }
    const inserted = await pool.query(
      "INSERT INTO users (telegram_id, balance) VALUES ($1, $2) RETURNING *",
      [telegramId, 1000]
    );
    res.json(inserted.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/update-balance", async (req, res) => {
  const { telegramId, change } = req.body;
  if (!telegramId || change === undefined) return res.status(400).json({ error: "telegramId + change required" });
  try {
    const updated = await pool.query(
      "UPDATE users SET balance = balance + $1 WHERE telegram_id = $2 RETURNING *",
      [change, telegramId]
    );
    if (!updated.rows.length) return res.status(404).json({ error: "user not found" });
    res.json(updated.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/game", async (req, res) => {
  const { telegramId, profit } = req.body;
  if (!telegramId || profit === undefined) return res.status(400).json({ error: "telegramId + profit required" });
  try {
    await pool.query("INSERT INTO games (telegram_id, profit) VALUES ($1, $2)", [telegramId, profit]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/stats/day", async (req, res) => {
  try {
    const q = `
      SELECT telegram_id, SUM(profit)::numeric(18,2) AS total
      FROM games
      WHERE created_at::date = CURRENT_DATE
      GROUP BY telegram_id
      ORDER BY total DESC
      LIMIT 50
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/stats/week", async (req, res) => {
  try {
    const q = `
      SELECT telegram_id, SUM(profit)::numeric(18,2) AS total
      FROM games
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY telegram_id
      ORDER BY total DESC
      LIMIT 50
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
