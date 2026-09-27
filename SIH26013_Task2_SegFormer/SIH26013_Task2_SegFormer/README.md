# SIH26013 — Task 2
## Automated Building Segmentation

### Dataset
SpaceNet 2 — AOI_3_Paris

### Model
SegFormer-B2
Pretrained base:
nvidia/segformer-b2-finetuned-ade-512-512

Binary classes:
0 = background
1 = building

### Validation
Training images: 918
Validation images: 230
Split: random 80/20
Random seed: 42
Best epoch: 9

### Validation Metrics
IoU: 73.64%
Dice: 84.82%
Precision: 83.07%
Recall: 86.65%
F1: 84.82%

### Vector Output
Validation images processed: 230
GeoJSON files: 122
Predicted building polygons: 3,053
Invalid geometries: 0
Geometry type: Polygon
CRS: EPSG:4326
Derived field: area_m2

### Included Artifacts
- best_segformer_b2_building.pth
- segformer_b2_building_final/
- task2_validation_metrics.json
- task2_final_summary.json
- validation_geojson/

### Important Note
The training/validation dataset used here is SpaceNet 2 AOI_3_Paris.
These validation results therefore describe performance on the Paris validation subset and
should not be presented as direct validation results on Indian imagery.
