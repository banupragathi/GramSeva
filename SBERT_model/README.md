# SIH26013 Task 1 - SBERT Land-Use Semantic Matcher

## Model
sentence-transformers/all-MiniLM-L6-v2

Embedding dimension: 384

## Vocabulary
272 land-use variants mapped to canonical labels.

## Matching hierarchy
1. Exact match
2. Normalized match
3. SBERT semantic similarity
4. Human review

Production threshold: 0.40

## Final production evaluation
Evaluation rows: 129
Coverage: 99.22%
Precision: 100.00%
Recall: 98.95%
F1: 99.47%
Human review: 1 case

## Important
This is a pretrained SBERT model with a project-specific vocabulary and
matching pipeline. The underlying SBERT model has NOT been fine-tuned.

## Included files
- all-MiniLM-L6-v2/              SBERT model
- land_use_vocabulary_final.csv  Project vocabulary
- matcher_function.py             Matcher implementation
- task1_final_production_evaluation.csv
- task1_final_summary.csv
- README.md
