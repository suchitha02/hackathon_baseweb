#!/bin/bash

echo "========================================"
echo "  IdeaSpark Development Environment"
echo "========================================"
echo ""

echo "Starting Backend Server..."
cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend Server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Servers Running!"
echo "========================================"
echo "  Backend:  http://localhost:5000/api"
echo "  Frontend: http://localhost:8080"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
