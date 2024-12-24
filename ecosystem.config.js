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
    },
    {
      name: "chatwidget",
      script: "npm",
      args: "run dev",
      watch: false,
      cwd: "/root/FlowonAI/ChatWidget",
      env: {
        NODE_ENV: "development",
        PORT: 5173 
      }
    },
    {
      name: "demo",
      script: "npm",
      args: "run dev",
      watch: false,
      cwd: "/root/FlowonAI/Demo",
      env: {
        NODE_ENV: "development",
        PORT: 5175
      }      
    },
    {
      name: "textwidget",
      script: "npm",
      args: "run dev",
      watch: false,
      cwd: "/root/FlowonAI/TextWidget",
      env: {
        NODE_ENV: "development",
        PORT: 5180 
      }
    }


  ]
}