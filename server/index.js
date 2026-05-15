import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

dotenv.config({ path: ".env" });
dotenv.config({ path: "server/.env" });

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const RESULTS_ADMIN_TOKEN = process.env.RESULTS_ADMIN_TOKEN;
const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT);
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const app = express();
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: shouldUseSsl(DATABASE_URL) ? { rejectUnauthorized: false } : false,
    })
  : null;

app.use(express.json({ limit: "256kb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
}));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    storage: pool ? "postgres" : "local-json",
  });
});

app.post("/api/results", async (req, res, next) => {
  try {
    const result = normalizeResult(req.body);
    const saved = pool ? await insertPostgres(result) : await insertLocal(result);
    res.status(201).json({ ok: true, id: saved.id });
  } catch (error) {
    next(error);
  }
});

app.get("/api/results/summary", requireAdmin, async (req, res, next) => {
  try {
    const limit = clamp(Number(req.query.limit || 100), 1, 500);
    const rows = pool ? await readRecentPostgres(limit) : await readRecentLocal(limit);
    res.json({
      ok: true,
      storage: pool ? "postgres" : "local-json",
      totals: buildTotals(rows),
      level_totals: buildLevelTotals(rows),
      recent: rows,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/results.csv", requireAdmin, async (req, res, next) => {
  try {
    const rows = pool ? await readRecentPostgres(5000) : await readRecentLocal(5000);
    res
      .status(200)
      .set({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="20ps-results-${new Date().toISOString().slice(0, 10)}.csv"`,
      })
      .send(rowsToCsv(rows));
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    ok: false,
    error: status === 500 ? "Internal server error." : error.message,
  });
});

await initStorage();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`20Ps results API listening on ${PORT} (${pool ? "postgres" : "local-json"})`);
});

async function initStorage() {
  if (!pool) return;
  await pool.query(`
    create table if not exists game_results (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      player_name text,
      mode text not null check (mode in ('puzzle', 'quiz')),
      score integer not null check (score >= 0),
      total integer not null check (total > 0),
      duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
      answers jsonb not null default '[]'::jsonb,
      level_breakdown jsonb not null default '{}'::jsonb,
      app_version text not null default '20ps-emi-professor-game@1',
      user_context jsonb not null default '{}'::jsonb,
      constraint score_cannot_exceed_total check (score <= total),
      constraint answers_must_be_array check (jsonb_typeof(answers) = 'array'),
      constraint level_breakdown_must_be_object check (jsonb_typeof(level_breakdown) = 'object')
    );
  `);
  await pool.query(`
    alter table game_results
    add column if not exists player_name text;
  `);
}

function shouldUseSsl(url) {
  if (process.env.PGSSLMODE === "disable") return false;
  return process.env.PGSSLMODE === "require" || /sslmode=require/i.test(url);
}

function normalizeResult(body) {
  const player_name = String(body.player_name || "").trim().slice(0, 120) || "Anonymous";
  const mode = String(body.mode || "");
  const score = Number(body.score);
  const total = Number(body.total);
  const duration_seconds = body.duration_seconds == null ? null : Number(body.duration_seconds);

  if (!["puzzle", "quiz"].includes(mode)) badRequest("mode must be puzzle or quiz.");
  if (!Number.isInteger(score) || score < 0) badRequest("score must be a non-negative integer.");
  if (!Number.isInteger(total) || total <= 0) badRequest("total must be a positive integer.");
  if (score > total) badRequest("score cannot exceed total.");
  if (duration_seconds !== null && (!Number.isInteger(duration_seconds) || duration_seconds < 0)) {
    badRequest("duration_seconds must be a non-negative integer.");
  }

  return {
    player_name,
    mode,
    score,
    total,
    duration_seconds,
    answers: Array.isArray(body.answers) ? body.answers.slice(0, 100) : [],
    level_breakdown: isPlainObject(body.level_breakdown) ? body.level_breakdown : {},
    app_version: String(body.app_version || "20ps-emi-professor-game@1").slice(0, 120),
    user_context: isPlainObject(body.user_context) ? body.user_context : {},
  };
}

async function insertPostgres(result) {
  const { rows } = await pool.query(
    `insert into game_results
      (player_name, mode, score, total, duration_seconds, answers, level_breakdown, app_version, user_context)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9::jsonb)
     returning id, created_at`,
    [
      result.player_name,
      result.mode,
      result.score,
      result.total,
      result.duration_seconds,
      JSON.stringify(result.answers),
      JSON.stringify(result.level_breakdown),
      result.app_version,
      JSON.stringify(result.user_context),
    ],
  );
  return rows[0];
}

async function readRecentPostgres(limit) {
  const { rows } = await pool.query(
    `select id, created_at, player_name, mode, score, total, duration_seconds, answers, level_breakdown
     from game_results
     order by created_at desc
     limit $1`,
    [limit],
  );
  return rows;
}

async function insertLocal(result) {
  const rows = await readAllLocal();
  const row = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...result,
  };
  rows.unshift(row);
  await fs.mkdir(path.join(__dirname, "data"), { recursive: true });
  await fs.writeFile(localDataPath(), JSON.stringify(rows, null, 2));
  return row;
}

async function readRecentLocal(limit) {
  const rows = await readAllLocal();
  return rows.slice(0, limit);
}

async function readAllLocal() {
  try {
    const text = await fs.readFile(localDataPath(), "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function localDataPath() {
  return path.join(__dirname, "data", "results.json");
}

function buildTotals(rows) {
  return ["puzzle", "quiz"].map(mode => {
    const modeRows = rows.filter(row => row.mode === mode);
    const attempts = modeRows.length;
    const averageScore = attempts
      ? modeRows.reduce((sum, row) => sum + Number(row.score), 0) / attempts
      : 0;
    const averageSeconds = attempts
      ? modeRows.reduce((sum, row) => sum + Number(row.duration_seconds || 0), 0) / attempts
      : 0;

    return {
      mode,
      attempts,
      average_score: round2(averageScore),
      average_seconds: round2(averageSeconds),
    };
  });
}

function buildLevelTotals(rows) {
  const levels = ["MEGA", "MACRO", "MESO", "MICRO", "MENANO"];
  return levels.reduce((summary, level) => {
    const stats = rows.reduce((acc, row) => {
      const value = row.level_breakdown?.[level];
      if (!value) return acc;
      acc.correct += Number(value.correct || 0);
      acc.total += Number(value.total || 0);
      return acc;
    }, { correct: 0, total: 0 });

    summary[level] = {
      ...stats,
      accuracy: stats.total ? round2((stats.correct / stats.total) * 100) : 0,
    };
    return summary;
  }, {});
}

function rowsToCsv(rows) {
  const headers = [
    "created_at",
    "player_name",
    "mode",
    "score",
    "total",
    "duration_seconds",
    "mega_correct",
    "mega_total",
    "macro_correct",
    "macro_total",
    "meso_correct",
    "meso_total",
    "micro_correct",
    "micro_total",
    "menano_correct",
    "menano_total",
    "answers_json",
  ];

  const lines = rows.map(row => {
    const levels = row.level_breakdown || {};
    return [
      formatCsvDate(row.created_at),
      row.player_name || "Anonymous",
      row.mode,
      row.score,
      row.total,
      row.duration_seconds,
      levels.MEGA?.correct,
      levels.MEGA?.total,
      levels.MACRO?.correct,
      levels.MACRO?.total,
      levels.MESO?.correct,
      levels.MESO?.total,
      levels.MICRO?.correct,
      levels.MICRO?.total,
      levels.MENANO?.correct,
      levels.MENANO?.total,
      JSON.stringify(row.answers || []),
    ].map(csvCell).join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function formatCsvDate(value) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

function requireAdmin(req, res, next) {
  if (!RESULTS_ADMIN_TOKEN && !isProduction) {
    next();
    return;
  }

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;

  if (RESULTS_ADMIN_TOKEN && token === RESULTS_ADMIN_TOKEN) {
    next();
    return;
  }

  res.status(401).json({ ok: false, error: "Admin token required." });
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
