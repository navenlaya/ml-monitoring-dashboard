# 🚀 Quick Start Guide

## Start the Project (Easiest Way)

Just run this command from the project root:

```bash
./start_project.sh
```

That's it! The script will:
- ✅ Check and install missing dependencies
- ✅ Train the ML model if needed
- ✅ Initialize the database
- ✅ Start the backend API
- ✅ Start the frontend React app
- ✅ Optionally start request simulation
- ✅ Show you all the URLs to access

## 🛑 Stop the Project

Press `Ctrl+C` in the terminal where you ran the startup script.

## 📊 Access Your Dashboard

Once running, you can access:
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Manual Startup (if needed)

If you prefer to start services manually:

### Backend
```bash
python3 -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🐳 Docker (Alternative)

If you prefer Docker:
```bash
docker compose up --build
```

## 📝 Troubleshooting

- **Port conflicts**: Make sure ports 8000 and 5173 are free
- **Dependencies**: The startup script will try to install missing packages
- **Logs**: Check `backend.log` and `frontend.log` for detailed error messages

## 🎯 Next Time

Just remember: **`./start_project.sh`** - that's all you need!
