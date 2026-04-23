module.exports = {
  apps: [
    {
      name: 'brief-support',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        NEXT_RUNTIME: 'nodejs'
      },
      env_production: {
        NODE_ENV: 'production',
        NEXT_RUNTIME: 'nodejs'
      },
      env_file: '.env.production'
    }
  ]
};