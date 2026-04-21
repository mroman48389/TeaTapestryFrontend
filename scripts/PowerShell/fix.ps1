# PowerShell: .\scripts\fix.ps1
# Runs ESLint on the Tea Tapestry frontend and automatically fixes fixable issues.

Write-Host "Running ESLint with auto-fix on Tea Tapestry frontend..."

# Run ESLint with the --fix flag
npx eslint src --ext .js,.jsx,.ts,.tsx --fix

Write-Host "ESLint auto-fix complete."
