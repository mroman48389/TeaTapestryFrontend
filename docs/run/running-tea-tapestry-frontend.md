# How to Run Tea Tapestry Frontend. 

> This doc explains how to run Tea Tapestry Frontend in each mode. Assumes Tea Tapestry Backend is running.
> Assumes .env files are appropriately set. See env.example for what is expected. Vite will automatically
> pick the correct .env file when named appropriately. We have .env.development for local development,
> .env.preview for preview mode, and .env.production for production mode. .env.local is for per-machine
> overrides.

## 1. Local/Development Mode

> Run npm run dev or scripts\PowerShell\run.ps1 from the project root and click the Local url Vite provides.

## 2. Preview Mode

> This mode allows us to do a Lighthouse analysis in the browser and simulates Netlify's production 
> environment locally. Use this mode for performance testing, layout testing, and debugging production-only 
> issues. First, build using npm run build:preview. Then run via npm run preview.

## 3. Production Mode (Deployment)

> Make sure there are no linting errors, all tests pass, and the security audit passes by invoking the 
> fix.ps1, coverage.ps1, test.ps1, and security_audit.ps1 scripts. Run npm run build to output a /dist 
> folder. Commit and push. Netlify is set to auto deploy the main branch from the GitHub repo.