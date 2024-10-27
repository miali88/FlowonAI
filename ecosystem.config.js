module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'backend',
      script: './backend/run_fast.py',
      interpreter: 'python3',
      env: {
        PYTHONUNBUFFERED: 'true'
      }
    }
  ]
}