@echo off
REM Script to start the FastAPI chat service

echo Installing dependencies...
pip install -r requirements.txt

echo Starting the chat service...
uvicorn main:app --reload --host 0.0.0.0 --port 8000