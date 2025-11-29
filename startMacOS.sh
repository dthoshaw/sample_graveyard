#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
(uvicorn main:app --reload --host 0.0.0.0 --port 8000 &)
(cd react && npm run dev &)
xdg-open http://localhost:3000 || open http://localhost:3000