import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

class AnalysisService:
    def __init__(self, dataset_path: Optional[str] = None):
        self.dataset_path = dataset_path or self._resolve_dataset_path()
        self.raw_df: Optional[pd.DataFrame] = None
        self.cleaned_df: Optional[pd.DataFrame] = None
        self.quality_stats: Dict[str, Any] = {}
        self.load_error: Optional[str] = None
        self.reload_data()

    def _resolve_dataset_path(self) -> str:
        """Finds the dataset path reliably across multiple execution directories."""
        candidate_paths = [
            Path(__file__).resolve().parent.parent.parent / "dataset" / "nirf_university_rankings.csv",
            Path(__file__).resolve().parent.parent / "dataset" / "nirf_university_rankings.csv",
            Path("dataset/nirf_university_rankings.csv").resolve(),
            Path("../dataset/nirf_university_rankings.csv").resolve(),
            Path(r"C:\Users\admin\OneDrive\Desktop\DEV PROJECT\dataset\nirf_university_rankings.csv")
        ]
        for p in candidate_paths:
            if p.exists() and p.is_file():
                return str(p)
        # Default to relative path from root
        return str(candidate_paths[0])

    def reload_data(self) -> Dict[str, Any]:
        """Loads and cleans the dataset following the original EDA logic."""
        self.load_error = None
        if not os.path.exists(self.dataset_path):
            self.load_error = f"Dataset file not found at: {self.dataset_path}"
            return {"status": "error", "message": self.load_error}

        try:
            # Step 1: Load raw data
            df_raw = pd.read_csv(self.dataset_path)
            self.raw_df = df_raw.copy()
            original_row_count = len(df_raw)
            original_col_count = len(df_raw.columns)

            # Missing values before cleaning
            missing_before = {col: int(cnt) for col, cnt in df_raw.isnull().sum().items()}

            # Duplicate count
            duplicates_removed = int(df_raw.duplicated().sum())

            # Step 3: Data Cleaning (matches python.py faithfully)
            df = df_raw.copy()

            # Remove extra spaces from column names and text values
            df.columns = df.columns.str.strip()

            for col in df.select_dtypes(include="object").columns:
                df[col] = df[col].astype(str).str.strip()

            # Remove duplicate rows
            df = df.drop_duplicates().copy()

            # Convert Rank and Score to numeric values
            rank_numeric = pd.to_numeric(df["Rank"], errors="coerce")
            score_numeric = pd.to_numeric(df["Score"], errors="coerce")

            invalid_rank_count = int(rank_numeric.isna().sum())
            invalid_score_count = int(score_numeric.isna().sum())
            invalid_rank_or_score = int((rank_numeric.isna() | score_numeric.isna()).sum())

            df["Rank"] = rank_numeric
            df["Score"] = score_numeric

            # Remove rows without valid Rank or Score
            df = df.dropna(subset=["Rank", "Score"]).copy()

            # Fill missing text values for grouping and display
            for col in ["Name", "City", "State"]:
                if col in df.columns:
                    # Note: earlier .astype(str) may have converted NaN to 'nan' if any existed
                    df[col] = df[col].replace(["nan", "None", ""], np.nan).fillna("Unknown")

            # Clean institute name for presentation (remove trailing 'More Details | |')
            if "Name" in df.columns:
                df["CleanName"] = df["Name"].apply(self._clean_university_name)
            else:
                df["CleanName"] = "Unknown"

            # Missing values after cleaning
            missing_after = {col: int(cnt) for col, cnt in df.isnull().sum().items()}

            # Sort by rank ascending
            df = df.sort_values("Rank").reset_index(drop=True)
            self.cleaned_df = df

            cleaned_row_count = len(df)

            self.quality_stats = {
                "dataset_path": self.dataset_path,
                "file_exists": True,
                "original_rows": original_row_count,
                "original_cols": original_col_count,
                "cleaned_rows": cleaned_row_count,
                "cleaned_cols": len(df.columns),
                "duplicates_removed": duplicates_removed,
                "invalid_rank_count": invalid_rank_count,
                "invalid_score_count": invalid_score_count,
                "invalid_rows_removed": invalid_rank_or_score,
                "missing_values_before": missing_before,
                "missing_values_after": missing_after,
                "columns": list(df.columns),
                "status": "ready"
            }
            return {"status": "success", "message": "Dataset loaded and cleaned successfully"}

        except Exception as e:
            self.load_error = str(e)
            return {"status": "error", "message": str(e)}

    @staticmethod
    def _clean_university_name(name: str) -> str:
        """Removes trailing 'More Details | |' artifact commonly found in NIRF scrape."""
        clean = str(name).strip()
        for suffix in ["More Details | |", "More Details ||", "More Details |", "More Details"]:
            if clean.endswith(suffix):
                clean = clean[:-len(suffix)].strip()
        return clean.strip(" ,|")

    def _ensure_ready(self):
        if self.load_error or self.cleaned_df is None or self.cleaned_df.empty:
            raise ValueError(self.load_error or "Cleaned dataset is empty or not loaded.")

    def get_health(self) -> Dict[str, Any]:
        """Returns system status, dataset availability, and row count."""
        return {
            "status": "ok" if (self.cleaned_df is not None and not self.cleaned_df.empty) else "degraded",
            "dataset_loaded": self.cleaned_df is not None and not self.cleaned_df.empty,
            "dataset_path": self.dataset_path,
            "row_count": len(self.cleaned_df) if self.cleaned_df is not None else 0,
            "error": self.load_error
        }

    def get_quality_report(self) -> Dict[str, Any]:
        """Provides transparency on data cleaning steps and data health."""
        return self.quality_stats

    def get_overview_kpis(self) -> Dict[str, Any]:
        """Computes top KPI cards dynamically."""
        self._ensure_ready()
        df = self.cleaned_df

        total_universities = len(df)
        num_states = int(df["State"].nunique())
        num_cities = int(df["City"].nunique())
        avg_score = round(float(df["Score"].mean()), 2)
        highest_score = round(float(df["Score"].max()), 2)
        lowest_score = round(float(df["Score"].min()), 2)
        best_rank = int(df["Rank"].min())
        worst_rank = int(df["Rank"].max())

        best_score_idx = df["Score"].idxmax()
        top_by_score = {
            "name": df.loc[best_score_idx, "CleanName"],
            "raw_name": df.loc[best_score_idx, "Name"],
            "score": highest_score,
            "rank": int(df.loc[best_score_idx, "Rank"]),
            "state": df.loc[best_score_idx, "State"],
            "city": df.loc[best_score_idx, "City"]
        }

        return {
            "total_universities": total_universities,
            "num_states": num_states,
            "num_cities": num_cities,
            "avg_score": avg_score,
            "highest_score": highest_score,
            "lowest_score": lowest_score,
            "best_rank": best_rank,
            "worst_rank": worst_rank,
            "top_university": top_by_score
        }

    def get_state_counts(self) -> List[Dict[str, Any]]:
        """Chart 1: Universities per State (sorted descending)."""
        self._ensure_ready()
        df = self.cleaned_df
        state_counts = df["State"].value_counts()
        total = len(df) if len(df) > 0 else 1

        result = []
        for state, count in state_counts.items():
            result.append({
                "state": state,
                "count": int(count),
                "percentage": round((count / total) * 100, 2)
            })
        return result

    def get_top_states_pie(self) -> List[Dict[str, Any]]:
        """Chart 2: Top 5 States + Others pie chart."""
        self._ensure_ready()
        df = self.cleaned_df
        state_counts = df["State"].value_counts()
        total = len(df) if len(df) > 0 else 1

        top_5 = state_counts.head(5)
        others_count = int(state_counts.iloc[5:].sum())

        result = []
        for state, count in top_5.items():
            result.append({
                "name": state,
                "count": int(count),
                "percentage": round((count / total) * 100, 2)
            })

        if others_count > 0:
            result.append({
                "name": "Others",
                "count": others_count,
                "percentage": round((others_count / total) * 100, 2)
            })
        return result

    def get_rank_distribution(self, bins_count: int = 15) -> Dict[str, Any]:
        """Chart 3: Rank distribution histogram with calculated bins."""
        self._ensure_ready()
        df = self.cleaned_df
        ranks = df["Rank"].values

        counts, bin_edges = np.histogram(ranks, bins=bins_count)
        bins_data = []
        for i in range(len(counts)):
            start = round(float(bin_edges[i]), 1)
            end = round(float(bin_edges[i+1]), 1)
            bins_data.append({
                "bin_start": start,
                "bin_end": end,
                "bin_label": f"{int(start) if start.is_integer() else start}-{int(end) if end.is_integer() else end}",
                "frequency": int(counts[i]),
                "percentage": round((counts[i] / len(ranks)) * 100, 2) if len(ranks) > 0 else 0
            })

        return {
            "bins": bins_data,
            "min_rank": int(df["Rank"].min()),
            "max_rank": int(df["Rank"].max()),
            "bins_count": bins_count
        }

    def get_score_distribution(self, bins_count: int = 15) -> Dict[str, Any]:
        """Chart 4: Score distribution histogram with calculated bins."""
        self._ensure_ready()
        df = self.cleaned_df
        scores = df["Score"].values

        counts, bin_edges = np.histogram(scores, bins=bins_count)
        bins_data = []
        for i in range(len(counts)):
            start = round(float(bin_edges[i]), 2)
            end = round(float(bin_edges[i+1]), 2)
            bins_data.append({
                "bin_start": start,
                "bin_end": end,
                "bin_label": f"{start:.1f} - {end:.1f}",
                "frequency": int(counts[i]),
                "percentage": round((counts[i] / len(scores)) * 100, 2) if len(scores) > 0 else 0
            })

        return {
            "bins": bins_data,
            "min_score": round(float(df["Score"].min()), 2),
            "max_score": round(float(df["Score"].max()), 2),
            "bins_count": bins_count
        }

    def get_boxplots(self) -> Dict[str, Any]:
        """Chart 5: Summary statistics and 5-number summary for Rank and Score."""
        self._ensure_ready()
        df = self.cleaned_df

        def _calc_stats(series: pd.Series) -> Dict[str, Any]:
            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            min_val = float(series.min())
            max_val = float(series.max())
            lower_fence = round(max(min_val, q1 - 1.5 * iqr), 2)
            upper_fence = round(min(max_val, q3 + 1.5 * iqr), 2)
            mean_val = float(series.mean())
            std_val = float(series.std())

            outliers = series[(series < lower_fence) | (series > upper_fence)].tolist()

            return {
                "min": round(min_val, 2),
                "q1": round(q1, 2),
                "median": round(median, 2),
                "q3": round(q3, 2),
                "max": round(max_val, 2),
                "iqr": round(iqr, 2),
                "lower_fence": lower_fence,
                "upper_fence": upper_fence,
                "mean": round(mean_val, 2),
                "std": round(std_val, 2),
                "outliers": [round(x, 2) for x in outliers]
            }

        return {
            "rank": _calc_stats(df["Rank"]),
            "score": _calc_stats(df["Score"])
        }

    def get_correlation(self) -> Dict[str, Any]:
        """Chart 6: Correlation matrix for Rank and Score."""
        self._ensure_ready()
        df = self.cleaned_df
        corr_matrix = df[["Rank", "Score"]].corr()

        r_value = round(float(corr_matrix.loc["Rank", "Score"]), 2)
        r_exact = float(corr_matrix.loc["Rank", "Score"])

        interpretation = (
            f"There is a strong negative linear correlation (r = {r_value}) between Rank and Score. "
            "Because Rank #1 represents the premier ranking, institutions with lower numerical rank values "
            "consistently obtain higher NIRF composite scores. As rank numbers increase (approaching 100), "
            "the corresponding university scores decrease systematically."
        )

        return {
            "matrix": {
                "Rank": {"Rank": 1.0, "Score": r_value},
                "Score": {"Rank": r_value, "Score": 1.0}
            },
            "exact_correlation": round(r_exact, 4),
            "rounded_correlation": r_value,
            "interpretation": interpretation
        }

    def get_rank_score_scatter(self) -> List[Dict[str, Any]]:
        """Chart 7: Rank vs Score scatter plot points."""
        self._ensure_ready()
        df = self.cleaned_df
        records = []
        for _, row in df.iterrows():
            records.append({
                "institute_id": str(row.get("Institute ID", "")),
                "name": str(row.get("CleanName", row.get("Name", ""))),
                "raw_name": str(row.get("Name", "")),
                "rank": int(row["Rank"]),
                "score": round(float(row["Score"]), 2),
                "state": str(row.get("State", "")),
                "city": str(row.get("City", ""))
            })
        return records

    def get_score_trend(self) -> List[Dict[str, Any]]:
        """Chart 8: University Score Trend ordered by ascending rank."""
        self._ensure_ready()
        df = self.cleaned_df.sort_values("Rank")
        records = []
        for _, row in df.iterrows():
            records.append({
                "rank": int(row["Rank"]),
                "score": round(float(row["Score"]), 2),
                "name": str(row.get("CleanName", row.get("Name", ""))),
                "raw_name": str(row.get("Name", "")),
                "state": str(row.get("State", "")),
                "city": str(row.get("City", ""))
            })
        return records

    def get_insights(self) -> Dict[str, Any]:
        """Step 6: Comprehensive data-driven insights handling ties gracefully."""
        self._ensure_ready()
        df = self.cleaned_df

        state_counts = df["State"].value_counts()
        city_counts = df["City"].value_counts()

        # Handle ties in state
        max_state_count = int(state_counts.max())
        top_states = state_counts[state_counts == max_state_count].index.tolist()

        # Handle ties in city
        max_city_count = int(city_counts.max())
        top_cities = city_counts[city_counts == max_city_count].index.tolist()

        avg_score = round(float(df["Score"].mean()), 2)
        highest_score = round(float(df["Score"].max()), 2)

        # University with highest score (handle ties)
        top_score_df = df[df["Score"] == highest_score]
        top_universities_score = [
            {
                "name": r["CleanName"],
                "raw_name": r["Name"],
                "rank": int(r["Rank"]),
                "score": highest_score,
                "city": r["City"],
                "state": r["State"]
            }
            for _, r in top_score_df.iterrows()
        ]

        best_rank = int(df["Rank"].min())
        best_rank_df = df[df["Rank"] == best_rank]
        best_rank_universities = [
            {
                "name": r["CleanName"],
                "raw_name": r["Name"],
                "rank": best_rank,
                "score": round(float(r["Score"]), 2),
                "city": r["City"],
                "state": r["State"]
            }
            for _, r in best_rank_df.iterrows()
        ]

        corr_info = self.get_correlation()

        return {
            "top_states": {
                "states": top_states,
                "count": max_state_count,
                "is_tied": len(top_states) > 1,
                "explanation": (
                    f"{' & '.join(top_states)} has the highest concentration of top universities "
                    f"with {max_state_count} institutions in the rankings."
                )
            },
            "top_cities": {
                "cities": top_cities,
                "count": max_city_count,
                "is_tied": len(top_cities) > 1,
                "explanation": (
                    f"{' & '.join(top_cities)} leads among metropolitan clusters with "
                    f"{max_city_count} ranked universities."
                )
            },
            "score_metrics": {
                "average_score": avg_score,
                "highest_score": highest_score,
                "top_institutions": top_universities_score,
                "explanation": (
                    f"The average university score is {avg_score}. The highest score achieved is {highest_score} "
                    f"by {top_universities_score[0]['name']}."
                )
            },
            "rank_metrics": {
                "best_rank": best_rank,
                "institutions": best_rank_universities,
                "explanation": (
                    f"The best numerical rank is Rank {best_rank}, held by "
                    f"{best_rank_universities[0]['name']} ({best_rank_universities[0]['city']}, {best_rank_universities[0]['state']})."
                )
            },
            "correlation": {
                "coefficient": corr_info["rounded_correlation"],
                "explanation": corr_info["interpretation"]
            }
        }

    def get_universities(
        self,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        sort_by: str = "rank",
        sort_order: str = "asc"
    ) -> Dict[str, Any]:
        """Provides filtered, sorted, paginated records with distinct filter options."""
        self._ensure_ready()
        df = self.cleaned_df.copy()

        # Filtering: Search across multiple text fields
        if search:
            q = search.strip().lower()
            mask = (
                df["Name"].str.lower().str.contains(q, na=False) |
                df["CleanName"].str.lower().str.contains(q, na=False) |
                df["City"].str.lower().str.contains(q, na=False) |
                df["State"].str.lower().str.contains(q, na=False)
            )
            if "Institute ID" in df.columns:
                mask = mask | df["Institute ID"].str.lower().str.contains(q, na=False)
            df = df[mask]

        if state and state.strip() and state.lower() != "all":
            df = df[df["State"].str.lower() == state.strip().lower()]

        if city and city.strip() and city.lower() != "all":
            df = df[df["City"].str.lower() == city.strip().lower()]

        total_records = len(df)

        # Sorting
        sort_col_map = {
            "rank": "Rank",
            "score": "Score",
            "name": "CleanName",
            "city": "City",
            "state": "State",
            "institute_id": "Institute ID"
        }
        col_to_sort = sort_col_map.get(sort_by.lower(), "Rank")
        ascending = (sort_order.lower() == "asc")
        if col_to_sort in df.columns:
            df = df.sort_values(by=col_to_sort, ascending=ascending)

        # Pagination
        if page_size <= 0:
            page_size = 10
        total_pages = max(1, int(np.ceil(total_records / page_size))) if total_records > 0 else 1
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_df = df.iloc[start_idx:end_idx]

        records = []
        highest_score = float(self.cleaned_df["Score"].max()) if not self.cleaned_df.empty else 0.0

        for _, row in paged_df.iterrows():
            score_val = round(float(row["Score"]), 2)
            records.append({
                "institute_id": str(row.get("Institute ID", "N/A")),
                "name": str(row.get("CleanName", row.get("Name", ""))),
                "raw_name": str(row.get("Name", "")),
                "city": str(row.get("City", "Unknown")),
                "state": str(row.get("State", "Unknown")),
                "score": score_val,
                "rank": int(row["Rank"]),
                "is_highest_scorer": (score_val == highest_score)
            })

        # Distinct dropdown lists from full cleaned dataset
        all_states = sorted(self.cleaned_df["State"].unique().tolist())
        all_cities = sorted(self.cleaned_df["City"].unique().tolist())

        return {
            "items": records,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total_records,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "filters": {
                "states": all_states,
                "cities": all_cities
            }
        }

    def get_cleaned_csv_content(self) -> str:
        """Returns CSV string of cleaned dataset for direct download."""
        self._ensure_ready()
        export_df = self.cleaned_df[["Institute ID", "Name", "City", "State", "Score", "Rank"]].copy()
        return export_df.to_csv(index=False)
