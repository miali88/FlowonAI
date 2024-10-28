module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "run dev",
      watch: false,
      cwd: "/root/FlowonAI/frontend",  // Specify the absolute path to your frontend directory
      env: {
        NODE_ENV: "development",
        PORT: 3000
      }
    },
    {
      name: "backend",
      script: "/root/FlowonAI/backend/venv/bin/python",
      args: "run_fast.py",
      cwd: "/root/FlowonAI/backend",
      env: {
        PYTHONUNBUFFERED: "1"
      }
    }
  ]
}