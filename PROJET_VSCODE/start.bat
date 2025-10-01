@echo off
echo ========================================
echo   Atelier IA Generative - Demarrage
echo ========================================
echo.

echo Verification des prerequis...
echo.

REM Verifier si Docker est installe
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Docker Desktop
    pause
    exit /b 1
)

REM Verifier si Ollama est installe
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Ollama depuis https://ollama.com/download/windows
    pause
    exit /b 1
)

echo ✅ Docker et Ollama sont installes
echo.

echo Demarrage des services avec Docker Compose...
docker-compose up --build

pause