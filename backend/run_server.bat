@echo off
waitress-serve --host=0.0.0.0 --port=5000 app:app
pause
replace
gunicorn app:app --bind 0.0.0.0:$PORT
