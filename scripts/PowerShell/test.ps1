# PowerShell: .\scripts\test.ps1
# @args lets us optionally run a targeted test. For example: 
#     .\scripts\test.ps1 -t "Integration: hovering an aroma arc"
#     .\scripts\test.ps1 AromaWheel.test.tsx
# Runs the Tea Tapestry frontend test suite.

Write-Host "Running Tea Tapestry frontend tests..."

npx jest @args

Write-Host "Frontend tests completed."
