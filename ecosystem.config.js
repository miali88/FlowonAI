module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "run start",
      watch: false,
      cwd: "./frontend",  // Changed from "/frontend" to "./frontend"
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "backend",
      script: "./venv/bin/python",
      args: "run_fast.py",
      cwd: "./backend",
      env: {
        PYTHONUNBUFFERED: "1"
      }
    },
    // {
    //   name: "chatwidget",
    //   script: "npm",
    //   args: "run dev",
    //   watch: false,
    //   cwd: "./ChatWidget",
    //   env: {
    //     NODE_ENV: "development",
    //     PORT: 5173 
    //   }
    // },
    // {
    //   name: "demo",
    //   script: "npm",
    //   args: "run dev",
    //   watch: false,
    //   cwd: "./Demo",
    //   env: {
    //     NODE_ENV: "development",
    //     PORT: 5175
    //   }      
    // },
    // {
    //   name: "textwidget",
    //   script: "npm",
    //   args: "run dev",
    //   watch: false,
    //   cwd: "./TextWidget",
    //   env: {
    //     NODE_ENV: "development",
    //     PORT: 5180 
    //   }
    // },
    // {
    //   name: "iframe",
    //   script: "npm",
    //   args: "run dev",
    //   watch: false,
    //   cwd: "./iframe",
    //   env: {
    //     NODE_ENV: "development",
    //     PORT: 5185 
    //   }
    // },
  ]
}