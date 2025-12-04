# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed. Please install Python 3.8+ to run the Concierge AI service." -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "ai_service/venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv ai_service/venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\ai_service\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -r ai_service/requirements.txt

# Run the server
Write-Host "Starting Concierge AI Service on port 8000..." -ForegroundColor Green
python ai_service/main.py
