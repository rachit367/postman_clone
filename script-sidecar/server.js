const express = require("express");
const { runScript } = require("./sandbox");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT ? Number(process.env.PORT) : 9111;

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/exec", async (req, res) => {
  const { mode, code, context } = req.body || {};
  const result = await runScript(mode, code, context);
  res.json(result);
});

app.listen(PORT, HOST, () => {
  console.log(`Script sidecar listening on http://${HOST}:${PORT}`);
});
