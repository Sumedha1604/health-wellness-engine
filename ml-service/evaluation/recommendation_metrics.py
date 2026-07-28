"""Reusable offline metrics for the hybrid recommendation service."""


def _item_identifier(item):
    """Return a comparable identifier from an item id or recommendation object."""
    if isinstance(item, dict):
        for key in ("exercise_id", "food_id", "item_id", "id"):
            if key in item:
                return item[key]
        return None

    return item


def _normalise_items(items):
    """Normalise metric inputs while accepting ids and recommendation objects."""
    normalised_items = []

    for item in items or []:
        identifier = _item_identifier(item)
        if identifier is not None:
            normalised_items.append(str(identifier))

    return normalised_items


def _top_k_items(recommended_items, k):
    """Return valid recommendation ids from the first K entries."""
    if not isinstance(k, int) or k <= 0:
        return []

    return _normalise_items(list(recommended_items or [])[:k])


def precision_at_k(recommended_items, actual_items, k):
    """Return the fraction of the first K recommendations that are relevant."""
    top_k = _top_k_items(recommended_items, k)

    if not top_k:
        return 0.0

    relevant = set(_normalise_items(actual_items))
    return len(set(top_k) & relevant) / len(top_k)


def recall_at_k(recommended_items, actual_items, k):
    """Return the fraction of relevant items present in the first K results."""
    relevant = set(_normalise_items(actual_items))

    if not relevant:
        return 0.0

    return len(set(_top_k_items(recommended_items, k)) & relevant) / len(relevant)


def f1_at_k(recommended_items, actual_items, k):
    """Return the harmonic mean of precision and recall at K."""
    precision = precision_at_k(recommended_items, actual_items, k)
    recall = recall_at_k(recommended_items, actual_items, k)

    if precision + recall == 0:
        return 0.0

    return 2 * precision * recall / (precision + recall)


def diversity_score(recommendations):
    """Measure body-part and equipment variety on a 0-to-1 scale."""
    if not recommendations:
        return 0.0

    body_parts = {
        item.get("body_part")
        for item in recommendations
        if item.get("body_part")
    }
    equipment = {
        item.get("equipment")
        for item in recommendations
        if item.get("equipment")
    }
    count = len(recommendations)

    body_part_variety = len(body_parts) / count
    equipment_variety = len(equipment) / count

    return round((body_part_variety + equipment_variety) / 2, 3)


def user_satisfaction_score(feedback_scores):
    """Convert like/dislike feedback (-1 to 1) into a 0-to-1 satisfaction score."""
    if isinstance(feedback_scores, dict):
        feedback_scores = feedback_scores.values()

    scores = list(feedback_scores or [])

    if not scores:
        return 0.5

    average_score = sum(scores) / len(scores)
    return round(max(0, min(1, (average_score + 1) / 2)), 3)


def evaluate_recommendations(
    recommended_ids,
    relevant_ids,
    recommendations,
    feedback_scores,
    k=5
):
    """Return all standard recommendation metrics in one report."""
    return {
        "precision_at_k": precision_at_k(
            recommended_ids,
            relevant_ids,
            k
        ),
        "recall_at_k": recall_at_k(
            recommended_ids,
            relevant_ids,
            k
        ),
        "f1_at_k": f1_at_k(
            recommended_ids,
            relevant_ids,
            k
        ),
        "diversity_score": diversity_score(recommendations),
        "user_satisfaction_score": user_satisfaction_score(
            feedback_scores
        )
    }
