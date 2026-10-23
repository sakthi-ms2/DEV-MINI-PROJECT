import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Step 1: Load the dataset
data = pd.read_csv("C:/Users/admin/OneDrive/Desktop/DEV PROJECT/dataset/nirf_university_rankings.csv")

# Step 2: Data Overview
print("----- Dataset Overview -----")
data.info()

print("\n----- First 5 Rows -----")
print(data.head())

print("\n----- Shape of Dataset -----")
print(data.shape)

print("\n----- Descriptive Statistics -----")
print(data.describe())

# Step 3: Data Cleaning

# Remove extra spaces from column names and text values
data.columns = data.columns.str.strip()

for col in data.select_dtypes(include="object").columns:
    data[col] = data[col].str.strip()

print("\n----- Missing Values Before Cleaning -----")
print(data.isnull().sum())

print("\n----- Duplicate Rows -----")
print(data.duplicated().sum())

# Remove duplicate rows
data = data.drop_duplicates().copy()

# Convert Rank and Score to numeric values
data["Rank"] = pd.to_numeric(data["Rank"], errors="coerce")
data["Score"] = pd.to_numeric(data["Score"], errors="coerce")

# Remove rows without valid Rank or Score
data = data.dropna(subset=["Rank", "Score"]).copy()

# Fill missing text values for grouping and display
for col in ["Name", "City", "State"]:
    data[col] = data[col].fillna("Unknown")

print("\n----- Missing Values After Cleaning -----")
print(data.isnull().sum())

print("\n----- Cleaned Dataset Shape -----")
print(data.shape)

if data.empty:
    print("No valid data available for analysis.")
else:
    # Step 4: Data Exploration

    state_count = data["State"].value_counts()
    city_count = data["City"].value_counts()

    print("\n----- Universities per State -----")
    print(state_count)

    print("\n----- Universities per City -----")
    print(city_count)

    # Correlation
    correlation = data[["Rank", "Score"]].corr()

    print("\n----- Correlation Matrix -----")
    print(correlation)

    # Sort data by rank for trend plots
    data = data.sort_values("Rank")

    # Step 5: Visualization

    # 1. Bar Chart - Universities per State
    plt.figure(figsize=(12, 6))
    state_count.plot(kind="bar")
    plt.title("Number of Universities per State")
    plt.xlabel("State")
    plt.ylabel("Number of Universities")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.show()

    # 2. Pie Chart - Top 5 States + Others
    top_states = state_count.head(5).copy()
    others = state_count.iloc[5:].sum()

    if others > 0:
        top_states["Others"] = others

    plt.figure(figsize=(7, 7))
    top_states.plot(kind="pie", autopct="%1.1f%%")
    plt.title("Universities by State: Top 5 and Others")
    plt.ylabel("")
    plt.tight_layout()
    plt.show()

    # 3. Histogram - Rank Distribution
    plt.figure(figsize=(8, 5))
    plt.hist(data["Rank"], bins=15, edgecolor="black")
    plt.title("Rank Distribution")
    plt.xlabel("Rank")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.show()

    # 4. Histogram - Score Distribution
    plt.figure(figsize=(8, 5))
    plt.hist(data["Score"], bins=15, edgecolor="black")
    plt.title("Score Distribution")
    plt.xlabel("Score")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.show()

    # 5. Separate Box Plots
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))

    sns.boxplot(y=data["Rank"], ax=axes[0])
    axes[0].set_title("Rank Distribution")

    sns.boxplot(y=data["Score"], ax=axes[1])
    axes[1].set_title("Score Distribution")

    plt.tight_layout()
    plt.show()

    # 6. Correlation Heatmap
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        correlation,
        annot=True,
        cmap="coolwarm",
        fmt=".2f",
        linewidths=0.5,
        vmin=-1,
        vmax=1
    )
    plt.title("Rank and Score Correlation")
    plt.tight_layout()
    plt.show()

    # 7. Scatter Plot - Rank vs Score
    plt.figure(figsize=(8, 5))
    sns.scatterplot(data=data, x="Rank", y="Score")
    plt.title("Rank vs University Score")
    plt.xlabel("Rank")
    plt.ylabel("Score")
    plt.tight_layout()
    plt.show()

    # 8. Line Plot - Score by Rank
    plt.figure(figsize=(10, 5))
    plt.plot(data["Rank"], data["Score"], marker="o")
    plt.title("University Score Trend by Rank")
    plt.xlabel("Rank")
    plt.ylabel("Score")
    plt.tight_layout()
    plt.show()

    # Step 6: Insights
    print("\n----- Insights -----")

    print("State with most universities:", state_count.idxmax())
    print("Number of universities in top state:", state_count.max())

    print("City with most universities:", city_count.idxmax())
    print("Average University Score:", round(data["Score"].mean(), 2))
    print("Highest University Score:", data["Score"].max())

    best_index = data["Score"].idxmax()
    print("University with highest score:", data.loc[best_index, "Name"])

    print("Best Rank (lowest numerical rank):", data["Rank"].min())

    print("\nEDA Completed Successfully.")