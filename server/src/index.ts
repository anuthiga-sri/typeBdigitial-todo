import express from "express";
import type { HealthResponse } from "@typebdigital/shared";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  const body: HealthResponse = { ok: true };
  res.json(body);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
