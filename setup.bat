@echo off
echo 🚀 Team Task Manager Setup Script
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

REM Backend setup
echo 📦 Setting up backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your database configuration
)

REM Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend

REM Install dependencies
echo Installing Node.js dependencies...
npm install

echo ✅ Setup completed!
echo.
echo 📋 Next steps:
echo 1. Configure backend\.env with your database URL
echo 2. Start PostgreSQL database
echo 3. Run database migrations: cd backend && venv\Scripts\activate && alembic upgrade head
echo 4. Start backend: cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
echo 5. Start frontend: cd frontend && npm start
echo.
echo 🌐 Application will be available at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs

pause
