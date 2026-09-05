import express from "express";
import { spawn } from "node:child_process";

const app = express();
const port = Number(process.env.PORT || 10000);
const apiToken = process.env.WEB_API_TOKEN;

app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => {
  res.json({ service: "gemini-cli-render", status: "ok", usage: "POST /ask with Authorization: Bearer <WEB_API_TOKEN>" });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/ask", (req, res) => {
  if (!apiToken || req.get("authorization") !== `Bearer ${apiToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt || prompt.length > 12000) {
    return res.status(400).json({ error: "prompt is required and must be at most 12000 characters" });
  }

  const child = spawn("gemini", ["--prompt", prompt, "--output-format", "json"], {
    cwd: "/tmp",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

  const timer = setTimeout(() => child.kill("SIGTERM"), 120000);
  child.on("close", (code) => {
    clearTimeout(timer);
    let result;
    try { result = JSON.parse(stdout); } catch { result = { response: stdout.trim() }; }
    if (code !== 0) {
      return res.status(502).json({ error: "Gemini CLI failed", exitCode: code, details: result, stderr: stderr.slice(-4000) });
    }
    return res.json(result);
  });
});

app.listen(port, "0.0.0.0", () => console.log(`Gemini CLI service listening on ${port}`));
