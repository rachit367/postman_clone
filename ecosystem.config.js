module.exports = {
  apps: [
    {
      name: "script-sidecar",
      cwd: "./script-sidecar",
      script: "server.js",
      env: {
        HOST: "127.0.0.1",
        PORT: "9111",
      },
    },
    {
      name: "backend",
      cwd: "./backend",
      script: ".venv/bin/uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
    },
    {
      name: "frontend",
      cwd: "./frontend",
      script: ".next/standalone/server.js",
      env: {
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
