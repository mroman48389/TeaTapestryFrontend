# PowerShell: .\scripts\coverage.ps1
# Generates and displays the Jest coverage report for the Tea Tapestry frontend.
# --verbose details which tests passed
# --coverageReporters=text details the files, lines, branches, and functions

Write-Host "Generating Jest coverage report..."

npx jest --coverage --verbose --coverageReporters=text

Write-Host "Coverage report generated."