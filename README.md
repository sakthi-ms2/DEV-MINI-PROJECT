# NIRF University Rankings — Exploratory Data Analysis (EDA) Dashboard

A full-stack, responsive web application for exploring and analyzing Indian university rankings based on the National Institutional Ranking Framework (NIRF) dataset.

This project connects a modern **React + Vite + TypeScript** frontend to a **FastAPI + Pandas** Python backend, reproducing and extending the exploratory data analysis (EDA) originally developed in Python (`python.py`) with interactive charts, dynamic KPIs, search, filtering, and export capabilities.

---

## 1. Project Architecture

```
DEV PROJECT/
├── dataset/
│   └── nirf_university_rankings.csv    # Official NIRF dataset (100 Universities)
├── backend/
│   ├── main.py                         # FastAPI server with 15+ REST endpoints
│   ├── requirements.txt                # Python backend dependencies
│   ├── test_api.py                     # API automated validation test suite
│   └── services/
│       ├── __init__.py
│       └── analysis.py                 # Pure Pandas/NumPy EDA calculation engine
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                  # Vite config with API proxy
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx                     # Main dashboard container & routing
│       ├── main.tsx                    # React DOM entry point
│       ├── index.css                   # Tailwind styles and print rules
│       ├── types/
│       │   └── index.ts                # TypeScript interfaces
│       ├── services/
│       │   └── api.ts                  # Typed API client with automatic failover
│       ├── components/
│       │   ├── Navbar.tsx              # Top bar with health pill & actions
│       │   ├── Sidebar.tsx             # Collapsible navigation & CSV download
│       │   ├── UniversityModal.tsx     # Profile dialog for clicked university
│       │   ├── LoadingSkeleton.tsx     # Skeleton loaders
│       │   └── ErrorAlert.tsx          # Error alert with retry button
│       └── pages/
│           ├── OverviewPage.tsx        # 6 KPI cards & summary widgets
│           ├── ExplorerPage.tsx        # Searchable, filterable, sortable table
│           ├── VisualizationsPage.tsx  # All 8 interactive charts & deep-dive tabs
│           ├── InsightsPage.tsx        # Automated empirical findings & ties
│           ├── DataQualityPage.tsx     # Cleaning audit & missing values report
│           └── AboutPage.tsx           # Academic project documentation
├── python.py                           # Original Matplotlib / Seaborn script (preserved)
└── README.md
```

---

## 2. Technology Stack

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
* **Backend:** Python 3.10+, FastAPI, Pandas, NumPy, Uvicorn
* **Data Layer:** Direct CSV ingestion (`dataset/nirf_university_rankings.csv`) with in-memory caching and on-demand refresh

---

## 3. Setup and Execution (Windows PowerShell)

Run the backend and frontend in **two separate Windows PowerShell terminals**.

### Terminal 1 — Backend (FastAPI)

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd "C:\Users\admin\OneDrive\Desktop\DEV PROJECT"
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *Note: If PowerShell shows an Execution Policy error, run:*
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\.venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```

4. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn main:app --reload --reload-dir backend --host 127.0.0.1 --port 8000
   ```

   The backend will be live at:
   * API Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   * Interactive API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Terminal 2 — Frontend (React + Vite)

1. Open a second PowerShell terminal and navigate to the `frontend` directory:
   ```powershell
   cd "C:\Users\admin\OneDrive\Desktop\DEV PROJECT\frontend"
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

4. Open your browser and navigate to:
   * **[http://localhost:5173](http://localhost:5173)**

---

## 4. Key Dashboard Features

### Dynamic KPIs (Calculated from Dataset)
1. **Total Universities:** 100 accredited institutions
2. **Number of States:** 22 unique states and UTs
3. **Number of Cities:** 64 urban centres
4. **Average University Score:** 53.89
5. **Highest University Score:** 83.29 (Indian Institute of Science, Bengaluru)
6. **Best Rank:** Rank #1 (IISc Bengaluru)

### 8 Interactive Visualizations
* **Chart 1 — Universities per State:** Interactive vertical bar chart sorted by university count.
* **Chart 2 — Top 5 States + Others:** Donut/pie chart displaying top five states plus remaining grouped under "Others" with exact percentages.
* **Chart 3 — Rank Distribution:** True 15-bin histogram calculated via NumPy/Pandas.
* **Chart 4 — Score Distribution:** 15-bin score frequency histogram illustrating right-skew.
* **Chart 5 — Rank & Score Box Plots:** 5-number summary (Min, Q1, Median, Q3, Max, IQR, Fences, and statistical outliers).
* **Chart 6 — Rank-Score Correlation Heatmap:** Pearson correlation ($r = -0.94$) matrix with diverging palette and causality disclaimer.
* **Chart 7 — Rank vs Score Scatter Plot:** Scatter points representing each institution with interactive tooltips and detail modal triggers.
* **Chart 8 — University Score Trend by Rank:** Ordered decay curve sorted by ascending rank.

### University Explorer Table
* Search by name, Institute ID, city, or state.
* Filter dropdowns by State and City.
* Multi-column sorting (Rank, Score, Name, City, State).
* Pagination (10, 25, 50, or 100 per page).
* Highlighting for top-scoring university (#1 IISc Bengaluru).
* Modal inspection panel displaying comprehensive institution metrics and comparison to the national average.
* **Export Filtered Table:** Working CSV export of currently filtered and searched records.

### Data Quality & Audit
* Displays raw CSV row count vs. cleaned active row count.
* Duplicate row counter (0 duplicate rows).
* Missing value audit by column (before vs. after cleaning).
* Invalid Rank/Score check.
* **Reload & Recalculate:** Working POST endpoint that re-reads CSV from disk into memory.

### Working Exports
* **Cleaned Dataset CSV:** Direct download via `/api/export/csv` or sidebar button.
* **Filtered Table CSV:** Download filtered table rows client-side.
* **Insights Summary (.txt):** Download analytical findings report.
* **Print Report:** Print-friendly layout hiding navigation chrome.

---

## 5. Verification & Testing

To run the automated backend test suite verifying all 15 endpoints:
```powershell
python backend/test_api.py
```

To build and verify the frontend bundle:
```powershell
cd frontend
npm run build
```

---

## 6. Troubleshooting

1. **Port 8000 already in use:**
   ```powershell
   uvicorn main:app --reload --host 127.0.0.1 --port 8001
   ```
   *(Update proxy in `vite.config.ts` if port is changed).*

2. **CORS issues:**
   CORS is enabled by default in `backend/main.py` for `http://localhost:5173` and `http://127.0.0.1:5173`.

3. **Missing dataset:**
   Ensure `dataset/nirf_university_rankings.csv` exists. The service resolves relative paths automatically.
