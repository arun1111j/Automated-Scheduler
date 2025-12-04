# Scheduler App - Quick Setup Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Scheduler App - Deployment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "Please install it from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or create repository manually:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository named 'scheduler-app'" -ForegroundColor White
    Write-Host "3. Run these commands:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/scheduler-app.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Create GitHub repository
Write-Host "Creating GitHub repository..." -ForegroundColor Green
$repoName = "scheduler-app"
$repoDescription = "A comprehensive task management and scheduling application"

try {
    gh repo create $repoName --public --description $repoDescription --source=. --remote=origin --push
    Write-Host "✓ Repository created and code pushed!" -ForegroundColor Green
} catch {
    Write-Host "Error creating repository. It might already exist." -ForegroundColor Yellow
    Write-Host "Trying to add remote and push..." -ForegroundColor Yellow
    
    git remote add origin "https://github.com/$(gh api user --jq .login)/$repoName.git" 2>$null
    git branch -M main
    git push -u origin main
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign in with GitHub" -ForegroundColor White
Write-Host "3. Import your repository: scheduler-app" -ForegroundColor White
Write-Host "4. Add environment variables (see DEPLOYMENT.md)" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository URL: https://github.com/$(gh api user --jq .login)/$repoName" -ForegroundColor Green
Write-Host ""
