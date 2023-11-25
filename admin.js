  import AdminJS from 'adminjs'
  import AdminJSExpress from '@adminjs/express'
  import express from 'express'
  import Connect from 'connect-pg-simple'
  import session from 'express-session'
  
  const PORT = 3000
  
  const DEFAULT_ADMIN = {
    email: 'off_admin@link868.com',
    password: '12345678',
  }
  
  const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      return Promise.resolve(DEFAULT_ADMIN)
    }
    return null
  }
  
  const start = async () => {
    const app = express()
  
    const admin = new AdminJS({})
  
    const ConnectSession = Connect(session)
    const sessionStore = new ConnectSession({
      conObject: {
        connectionString: 'postgres://adminjs:@localhost:5432/adminjs',
        ssl: process.env.NODE_ENV === 'production',
      },
      tableName: 'session',
      createTableIfMissing: true,
    })
  
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
      admin,
      {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret',
      },
      null,
      {
        store: sessionStore,
        resave: true,
        saveUninitialized: true,
        secret: 'sessionsecret',
        cookie: {
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production',
        },
        name: 'adminjs',
      }
    )
    app.use(admin.options.rootPath, adminRouter)
  
    app.listen(PORT, () => {
      console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    })
  }
  
  start()