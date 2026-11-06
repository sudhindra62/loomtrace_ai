module.exports = {
  apps: [
    {
      name: "loomtrace",
      script: "node_modules/.bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/loomtrace-error.log",
      out_file: "/var/log/pm2/loomtrace-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      ignore_watch: ["node_modules", ".next"],
      restart_delay: 4000,
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
