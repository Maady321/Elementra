import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_*) so server-side API handlers
  // can access OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, etc. during dev.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      apiDevPlugin(env),
    ],
  }
})

/**
 * Vite plugin that serves the /api/* serverless functions locally
 * during development, so `npm run dev` works without `vercel dev`.
 */
function apiDevPlugin(env) {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      // Inject env vars into process.env for the API handler modules
      Object.assign(process.env, env)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const route = req.url.split('?')[0] // strip query string

        try {
          // Use Vite's SSR module loader (supports HMR in dev)
          const mod = await server.ssrLoadModule(`.${route}.js`)

          // Parse JSON body for POST requests
          const body = await new Promise((resolve) => {
            if (req.method !== 'POST') return resolve(undefined)
            let raw = ''
            req.on('data', (chunk) => (raw += chunk))
            req.on('end', () => {
              try { resolve(JSON.parse(raw)) }
              catch { resolve({}) }
            })
          })

          // Vercel-compatible request/response wrappers
          const vercelReq = Object.assign(Object.create(req), { body, headers: req.headers, method: req.method })

          const vercelRes = {
            _code: 200,
            status(code) { this._code = code; return this },
            json(data) {
              res.writeHead(this._code, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            },
          }

          await mod.default(vercelReq, vercelRes)
        } catch (err) {
          console.error(`[API ${route}]`, err.message || err)
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Dev API error: ' + (err.message || 'Unknown') }))
          }
        }
      })
    },
  }
}
