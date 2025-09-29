@echo off
echo Starting development servers...

start "Backend" cmd /k "cd backend && npm run dev"
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo Press any key to continue...
pause