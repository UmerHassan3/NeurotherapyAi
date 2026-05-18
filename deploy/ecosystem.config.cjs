// PM2 process manager config — run: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "neurotherapy-server",
      script: "./src/index.js",
      cwd: "/var/www/Server",
      interpreter: "node",
      interpreter_args: "--experimental-json-modules",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        // Copy values from your Server/.env — do NOT commit real secrets
        PORT: 5001,
        MONGODB_URL: "YOUR_MONGODB_ATLAS_URL",
        FRONTEND_URL: "http://YOUR_EC2_PUBLIC_IP",   // or https://yourdomain.com
        JWT_SECRET: "YOUR_JWT_SECRET",
        EMAIL_USER: "YOUR_EMAIL",
        EMAIL_PASS: "YOUR_EMAIL_APP_PASSWORD",
      },
    },
  ],
};
