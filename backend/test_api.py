import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

endpoints = [
    '/api/health',
    '/api/overview',
    '/api/universities?page=1&page_size=5',
    '/api/charts/state-counts',
    '/api/charts/top-states',
    '/api/charts/rank-distribution',
    '/api/charts/score-distribution',
    '/api/charts/boxplots',
    '/api/charts/correlation',
    '/api/charts/rank-score',
    '/api/charts/score-trend',
    '/api/insights',
    '/api/quality',
    '/api/export/csv'
]

print("Running API test suite...")
for ep in endpoints:
    res = client.get(ep)
    assert res.status_code == 200, f"Failed on {ep}: {res.status_code} - {res.text}"
    print(f"[OK] {ep}")

# Also test POST refresh
res_refresh = client.post('/api/refresh')
assert res_refresh.status_code == 200
print("[OK] POST /api/refresh")

print("\nALL FASTAPI ENDPOINTS VERIFIED AND PASSING!")
