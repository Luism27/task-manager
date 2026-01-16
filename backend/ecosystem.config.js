// ecosystem.config.js
module.exports = {
  apps : [{
    name: "task_manager_backend",
    script: "./gunicorn_start.sh", // Path to your start script
    interpreter: "/bin/bash", // Specify bash as the interpreter for the script
    watch: false, // Set to true for development, false for production
    autorestart: true,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: "production",
      DJANGO_SETTINGS_MODULE: "backend.settings", // Your settings module
    }
  }]
};
