#!/usr/bin/env bash

cd backend/
python3 -m uvicorn main:app --reload &
cd ../frontend
ionic serve --port=3000 --address=0.0.0.0 &

wait
echo "all done"
