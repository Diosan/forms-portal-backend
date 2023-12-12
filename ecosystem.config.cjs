module.exports = {
    apps : [
        {
          name: "JSSWF",
          script: "app.js",
          watch: true,
          env: {
            "PORT": 3000,
            "NODE_ENV": "local"
          },
          env_development: {
              "PORT": 3000,
              "NODE_ENV": "development"
            },
          env_staging: {
              "PORT": 3000,
              "NODE_ENV": "staging",
          },
          env_production: {
              "PORT": 3000,
              "NODE_ENV": "production",
          }
        }
    ],
    deploy: {
      production: {
        user : "judadm",
        host : "10.0.1.97",
        // key: "/home/judadm/.ssh/hill.pub",
        repo : "git@bitbucket.org:dion_santana/forms-portal-backend.git",
        ref  : "origin/master",
        path : "/var/www/html/forms-portal-backend",
        // "pre-deploy": "git reset --hard",
        'pre-deploy': 'cd /var/www/html/forms-portal-backend && git pull origin master',
        // "post-deploy" : "npm install && sudo nginx -s reload && pm2 startOrRestart ecosystem.config.js --env production && pm2 save"
        // "post-deploy": "cd /var/www/html/jsswf-server/current && pm2 startOrRestart ecosystem.config.js --env production && pm2 save",
        // "post-deploy": "git reset --hard && git pull origin master && cd /var/www/html/jsswf-server/current && pm2 startOrRestart ecosystem.config.js --env production && pm2 save"
        "post-deploy": "pm2 reload ecosystem.config.js --env production && pm2 save"
      },
      staging: { 
        user : "root",
        host : "66.55.65.163",
        repo : "git@bitbucket.org:dion_santana/forms-portal-backend.git",
        ref  : "origin/master",
        path : "/var/www/html/jsswf-server",
        // "post-deploy" : "echo Hh6832943!@ |  sudo -S nginx -s reload && pm2 startOrRestart ecosystem.config.js --env staging && pm2 save"
        // "post-deploy": "cd /var/www/html/vrfy-server/current && npm install && nginx -s reload && npm rebuild && pm2 startOrRestart ecosystem.config.js --env staging && pm2 save"
        "post-deploy": "git reset --hard && git pull origin master && cd /var/www/html/jss && pm2 startOrRestart ecosystem.config.js --env staging && pm2 save"
      },
      development: {
        
      }
    }
  }