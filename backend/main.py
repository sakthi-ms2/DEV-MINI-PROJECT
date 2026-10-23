import sys
import logging
import traceback
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("nirf_backend")

# Add backend directory and parent directory to sys.path
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
for p in [str(backend_dir), str(project_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from services.analysis import AnalysisService
except ImportError:
    from backend.services.analysis import AnalysisService

app = FastAPI(
    title="NIRF University Rankings - EDA Dashboard API",
    description="REST API backend serving Exploratory Data Analysis, dynamic KPIs, and interactive visualizations for NIRF University Rankings.",
    version="1.0.0"
)

# Enable CORS for local frontend development origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dev-mini-project.onrender.com",
    "http://https://dev-mini-project.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate the singleton AnalysisService
try:
    analysis_service = AnalysisService()
    logger.info(f"AnalysisService initialized. Health: {analysis_service.get_health()}")
except Exception as e:
    logger.error(f"Failed to initialize AnalysisService: {e}\n{traceback.format_exc()}")
    analysis_service = None  # type: ignore


@app.get("/")
def root():
    return {
        "message": "NIRF University Rankings EDA Dashboard API",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def health():
    """Returns backend and dataset health status."""
    if analysis_service is None:
        return JSONResponse(
            status_code=500,
            content={
                "status": "degraded",
                "dataset_loaded": False,
                "dataset_path": "",
                "row_count": 0,
                "error": "AnalysisService failed to initialize"
            }
        )
    return analysis_service.get_health()


@app.get("/api/overview")
def get_overview():
    """Returns dynamic KPI cards statistics."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_overview_kpis()
    except Exception as e:
        logger.error(f"Error in /api/overview: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/universities")
def get_universities(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=200, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query by name, state, city, ID"),
    state: Optional[str] = Query(None, description="Filter by state"),
    city: Optional[str] = Query(None, description="Filter by city"),
    sort_by: str = Query("rank", description="Field to sort by: rank, score, name, city, state"),
    sort_order: str = Query("asc", description="Sort order: asc or desc")
):
    """Returns paginated, searchable, filterable, and sortable university records."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_universities(
            page=page,
            page_size=page_size,
            search=search,
            state=state,
            city=city,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        logger.error(f"Error in /api/universities: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/state-counts")
def get_state_counts():
    """Chart 1: Universities per State."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_state_counts()
    except Exception as e:
        logger.error(f"Error in /api/charts/state-counts: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/top-states")
def get_top_states():
    """Chart 2: Top 5 States + Others."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_top_states_pie()
    except Exception as e:
        logger.error(f"Error in /api/charts/top-states: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/rank-distribution")
def get_rank_distribution(bins: int = Query(15, ge=5, le=50)):
    """Chart 3: Rank Distribution Histogram."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_rank_distribution(bins_count=bins)
    except Exception as e:
        logger.error(f"Error in /api/charts/rank-distribution: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/score-distribution")
def get_score_distribution(bins: int = Query(15, ge=5, le=50)):
    """Chart 4: Score Distribution Histogram."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_score_distribution(bins_count=bins)
    except Exception as e:
        logger.error(f"Error in /api/charts/score-distribution: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/boxplots")
def get_boxplots():
    """Chart 5: Rank and Score Box Plots and summary statistics."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_boxplots()
    except Exception as e:
        logger.error(f"Error in /api/charts/boxplots: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/correlation")
def get_correlation():
    """Chart 6: Rank and Score Correlation Heatmap."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_correlation()
    except Exception as e:
        logger.error(f"Error in /api/charts/correlation: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/rank-score")
def get_rank_score_scatter():
    """Chart 7: Rank vs Score Scatter Plot."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_rank_score_scatter()
    except Exception as e:
        logger.error(f"Error in /api/charts/rank-score: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charts/score-trend")
def get_score_trend():
    """Chart 8: University Score Trend by Rank."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_score_trend()
    except Exception as e:
        logger.error(f"Error in /api/charts/score-trend: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/insights")
def get_insights():
    """Calculated insights from the dataset."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_insights()
    except Exception as e:
        logger.error(f"Error in /api/insights: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quality")
def get_quality_report():
    """Data quality and cleaning audit report."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        return analysis_service.get_quality_report()
    except Exception as e:
        logger.error(f"Error in /api/quality: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/refresh")
def refresh_dataset():
    """Reloads the dataset from CSV and re-executes cleaning logic."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    result = analysis_service.reload_data()
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message"))
    return result


@app.get("/api/export/csv")
def export_csv():
    """Downloads cleaned university rankings dataset as CSV."""
    if analysis_service is None:
        raise HTTPException(status_code=503, detail="AnalysisService is not ready")
    try:
        csv_data = analysis_service.get_cleaned_csv_content()
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=nirf_cleaned_rankings.csv"}
        )
    except Exception as e:
        logger.error(f"Error in /api/export/csv: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Only reload within backend directory to avoid watching .venv or node_modules
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)]
    )
