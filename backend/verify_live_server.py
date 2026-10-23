"""
Verifies that FastAPI runs as an actual live HTTP server on port 8000,
handles real HTTP requests, and returns valid responses for all dashboard endpoints.
"""

import sys
import time
import subprocess
import urllib.request
import json
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
PYTHON_EXE = sys.executable

def main():
    print(f"Starting live Uvicorn server using: {PYTHON_EXE}")
    cmd = [
        PYTHON_EXE,
        "-m",
        "uvicorn",
        "main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
    ]

    # Use subprocess without blocking pipes
    proc = subprocess.Popen(
        cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    try:
        # Wait up to 10 seconds for server startup
        healthy = False
        for i in range(20):
            time.sleep(0.5)
            try:
                with urllib.request.urlopen("https://dev-mini-project.onrender.com", timeout=1) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        if data.get("status") == "ok":
                            print(f"[SUCCESS] Server is live! Health response: {data}")
                            healthy = True
                            break
            except Exception:
                pass

        if not healthy:
            print("[ERROR] Server failed to start within timeout.")
            sys.exit(1)

        # Test all required endpoints over real HTTP
        test_urls = [
            "https://dev-mini-project.onrender.com",
            "/api/overview",
            "/api/charts/state-counts",
            "/api/charts/top-states",
            "/api/charts/rank-distribution",
            "/api/charts/score-distribution",
            "/api/charts/boxplots",
            "/api/charts/correlation",
            "/api/charts/rank-score",
            "/api/charts/score-trend",
            "/api/insights",
            "/api/quality",
            "/api/universities?page=1&page_size=5"
        ]

        print("\nVerifying live endpoints over HTTP (http://https://dev-mini-project.onrender.com):")
        for endpoint in test_urls:
            url = f"http://https://dev-mini-project.onrender.com{endpoint}"
            with urllib.request.urlopen(url, timeout=3) as resp:
                assert resp.status == 200, f"Failed on {url}: status {resp.status}"
                body = json.loads(resp.read().decode())
                assert body is not None
                print(f"  [PASS 200 OK] {endpoint}")

        print("\nAll live HTTP endpoint tests passed successfully!")

    finally:
        print("Shutting down test server...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        print("Server shutdown complete.")

if __name__ == "__main__":
    main()
