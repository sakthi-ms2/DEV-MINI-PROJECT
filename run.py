"""
NIRF University Rankings - Master Launcher Script (Python)
Starts both FastAPI backend and React frontend simultaneously with health-check waiting and browser launch.
"""

import os
import sys
import time
import subprocess
import webbrowser
import urllib.request
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
VENV_PYTHON = BASE_DIR / ".venv" / "Scripts" / "python.exe"

def get_python_exe() -> str:
    if VENV_PYTHON.exists():
        return str(VENV_PYTHON)
    return sys.executable

def check_backend_dependencies(python_exe: str):
    print("Checking backend dependencies...")
    try:
        subprocess.run(
            [python_exe, "-c", "import fastapi, uvicorn, pandas, numpy"],
            check=True,
            capture_output=True
        )
        print("[OK] Backend dependencies verified.")
    except subprocess.CalledProcessError:
        print("[INFO] Installing missing backend dependencies...")
        req_file = BACKEND_DIR / "requirements.txt"
        subprocess.run([python_exe, "-m", "pip", "install", "-r", str(req_file)], check=True)

def wait_for_backend(timeout_seconds: int = 15) -> bool:
    print("Waiting for backend to become ready on http://127.0.0.1:8000/api/health ...")
    start_time = time.time()
    while time.time() - start_time < timeout_seconds:
        try:
            req = urllib.request.Request("http://127.0.0.1:8000/api/health")
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    if data.get("status") == "ok":
                        print(f"[OK] Backend is healthy! (Loaded {data.get('row_count')} universities)")
                        return True
        except Exception:
            time.sleep(0.8)
    return False

def main():
    print("=" * 65)
    print("   NIRF University Rankings — EDA Dashboard Master Launcher")
    print("=" * 65)

    python_exe = get_python_exe()
    print(f"Using Python: {python_exe}")

    check_backend_dependencies(python_exe)

    # 1. Start Backend
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [
        python_exe,
        "-m",
        "uvicorn",
        "main:app",
        "--reload",
        "--reload-dir",
        str(BACKEND_DIR),
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR)
    )

    # 2. Start Frontend
    print("[2/2] Starting React + Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        shell=(sys.platform == "win32")
    )

    # 3. Wait for backend readiness
    is_ready = wait_for_backend(15)
    if not is_ready:
        print("[WARNING] Backend health check timed out. Checking if process is running...")

    # 4. Open Browser
    print("\nOpening dashboard in your web browser...")
    webbrowser.open("http://localhost:5173")

    print("\n" + "=" * 65)
    print("Dashboard is LIVE!")
    print("  • Frontend:   http://localhost:5173")
    print("  • Backend:    http://127.0.0.1:8000")
    print("  • API Docs:   http://127.0.0.1:8000/docs")
    print("=" * 65)
    print("\nPress Ctrl+C at any time to shut down both servers.\n")

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        try:
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
