# GramSeva 🌍

### Connecting the Land That Connects Us

GramSeva is an AI-powered geospatial platform for **multi-source urban land-record integration and harmonization**.

It combines cadastral data, satellite/drone imagery, municipal records, OpenStreetMap data, and other geospatial sources to identify matching entities, detect conflicts, track changes, and generate a confidence-aware unified land record.

## 🚀 Key Features

- Multi-source geospatial data ingestion
- CRS and schema normalization
- Building/feature extraction using **SegFormer-B2**
- Spatial entity matching using **Siamese ResNet-50**
- Attribute matching using **Sentence-BERT (SBERT)**
- Temporal change detection using **ChangeFormer**
- Spatial conflict and topology detection
- Confidence scoring with explainable evidence
- Human-in-the-loop review
- Natural-language GIS search
- Interactive 2D GIS with MapLibre
- Optional 3D visualization with CesiumJS
- Unified and auditable land records

## 🧠 Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS
- Deck.gl
- CesiumJS

**Backend**
- Python
- FastAPI
- Pydantic
- SQLAlchemy

**AI / ML**
- PyTorch
- SegFormer-B2
- Siamese ResNet-50
- ChangeFormer
- Sentence-BERT
- XGBoost (optional)

**GIS / Data**
- GeoPandas
- Shapely
- GDAL
- PROJ
- Rasterio
- PostgreSQL + PostGIS

**Deployment**
- Docker
- Docker Compose
- GitHub Actions

## 📊 Datasets

GramSeva is designed to work with:

- NAKSHA / DoLR public materials where available
- SpaceNet
- Bhuvan / NRSC
- OpenStreetMap
- Synthetic multi-source benchmark data

Private or unavailable ownership/revenue records are represented using clearly labelled synthetic data.

## 🔄 Workflow

```text
Data Sources
     ↓
Ingestion
     ↓
CRS & Schema Normalization
     ↓
Feature Extraction
     ↓
Entity Matching
     ↓
Change Detection
     ↓
Conflict Detection
     ↓
Confidence Scoring
     ↓
Human Review
     ↓
Unified Land Record
     ↓
2D / 3D GIS
```

## 🛠️ Getting Started

### Clone

```bash
git clone https://github.com/your-username/gramseva.git
cd gramseva
```

### Run with Docker

```bash
docker compose up --build
```

### Run Demo Data

```bash
python scripts/seed_demo.py
```

## 📁 Project Structure

```text
gramseva/
├── frontend/
├── backend/
├── ml/
├── data/
├── scripts/
├── evaluation/
├── docs/
├── docker-compose.yml
└── README.md
```

## 🎯 SIH Problem Statement

**SIH26013 — Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management**

GramSeva focuses on making fragmented land data **interoperable, explainable, conflict-aware, and easier to manage**.

## ⚠️ Note

GramSeva is a decision-support platform. Original source records are preserved, conflicts are not silently overwritten, and uncertain cases can be sent for human review.

## 👥 Team

Built for **Smart India Hackathon 2026**.
