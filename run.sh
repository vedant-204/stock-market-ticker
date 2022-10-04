#!/usr/bin/env bash

cd backend/
python3 -m uvicorn main:app --reload &
cd ../frontend
ionic serve --port=3000 &

wait
echo "all done"
