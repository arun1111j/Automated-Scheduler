# GitHub Repository Setup & Deployment Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Scheduler App - GitHub & Vercel Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Authenticate with GitHub
Write-Host "Step 1: Authenticate with GitHub CLI" -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host "Run this command in a NEW terminal window:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  gh auth login" -ForegroundColor White
Write-Host ""
Write-Host "Then follow the prompts to authenticate." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter after you've authenticated"

# Step 2: Create GitHub Repository
Write-Host ""
Write-Host "Step 2: Create GitHub Repository" -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host "Creating repository 'scheduler-app'..." -ForegroundColor Yellow
Write-Host ""

try {
    # Create repository
    gh repo create scheduler-app --public --description "A comprehensive task management and scheduling application built with Next.js, TypeScript, and PostgreSQL" --source=. --remote=origin --push
    
    Write-Host "✓ Repository created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Get repository URL
    $username = gh api user --jq .login
    $repoUrl = "https://github.com/$username/scheduler-app"
    
    Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "✗ Error creating repository" -ForegroundColor Red
    Write-Host "This might mean the repository already exists or you need to authenticate first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try these commands manually:" -ForegroundColor Yellow
    Write-Host "  gh repo create scheduler-app --public --source=. --remote=origin" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 3: Deployment Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next: Deploy to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your code is now on GitHub! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Now let's deploy to Vercel:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://vercel.com" -ForegroundColor White
Write-Host "2. Click 'Sign Up' or 'Log In' with GitHub" -ForegroundColor White
Write-Host "3. Click 'Add New...' → 'Project'" -ForegroundColor White
Write-Host "4. Find and import 'scheduler-app'" -ForegroundColor White
Write-Host "5. Follow the setup in QUICKSTART.md" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Important: Set Environment Variables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "In Vercel, add these environment variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "  Generate with: " -ForegroundColor Gray -NoNewline
Write-Host "openssl rand -base64 32" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXTAUTH_URL" -ForegroundColor White
Write-Host "  Value: https://your-app-name.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "NEXT_PUBLIC_APP_URL" -ForegroundColor White
Write-Host "  Value: https://your-app-name.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "DATABASE_URL" -ForegroundColor White
Write-Host "  (Automatically added when you connect Vercel Postgres)" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Documentation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 QUICKSTART.md  - Quick deployment guide" -ForegroundColor White
Write-Host "📖 DEPLOYMENT.md  - Detailed deployment instructions" -ForegroundColor White
Write-Host "📖 README.md      - Full documentation" -ForegroundColor White
Write-Host ""

Write-Host "✨ Your Scheduler App is ready to deploy! ✨" -ForegroundColor Green
Write-Host ""
