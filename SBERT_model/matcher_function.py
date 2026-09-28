def match_land_use(query, threshold=0.40):
    query = str(query).strip()
    query_lower = query.lower()
    query_normalized = normalize_text(query)

    # 1. EXACT MATCH
    exact_labels = raw_map.get(query_lower, set())

    if len(exact_labels) == 1:
        canonical = next(iter(exact_labels))
        return {
            "query": query,
            "canonical_label": canonical,
            "matched_variant": query,
            "similarity": 1.0,
            "status": "MATCH",
            "method": "EXACT"
        }

    if len(exact_labels) > 1:
        return {
            "query": query,
            "canonical_label": None,
            "matched_variant": query,
            "similarity": 1.0,
            "status": "HUMAN_REVIEW",
            "method": "EXACT_AMBIGUOUS",
            "candidate_labels": sorted(exact_labels)
        }

    # 2. NORMALIZED MATCH
    normalized_labels = normalized_map.get(query_normalized, set())

    if len(normalized_labels) == 1:
        canonical = next(iter(normalized_labels))
        return {
            "query": query,
            "canonical_label": canonical,
            "matched_variant": query_normalized,
            "similarity": 1.0,
            "status": "MATCH",
            "method": "NORMALIZED"
        }

    if len(normalized_labels) > 1:
        return {
            "query": query,
            "canonical_label": None,
            "matched_variant": query_normalized,
            "similarity": 1.0,
            "status": "HUMAN_REVIEW",
            "method": "NORMALIZED_AMBIGUOUS",
            "candidate_labels": sorted(normalized_labels)
        }

    # 3. SBERT SEMANTIC MATCH
    query_embedding = model.encode(
        [query],
        normalize_embeddings=True
    )[0]

    scores = np.dot(variant_embeddings, query_embedding)

    best_idx = np.argmax(scores)
    best_score = float(scores[best_idx])

    best_variant = df.iloc[best_idx]["variant"]
    best_canonical = df.iloc[best_idx]["canonical_label"]

    # 4. HUMAN REVIEW
    if best_score >= threshold:
        return {
            "query": query,
            "canonical_label": best_canonical,
            "matched_variant": best_variant,
            "similarity": best_score,
            "status": "MATCH",
            "method": "SBERT"
        }

    return {
        "query": query,
        "canonical_label": None,
        "matched_variant": best_variant,
        "similarity": best_score,
        "status": "HUMAN_REVIEW",
        "method": "SBERT"
    }
