import {
  CheckCircle2,
  Dumbbell,
  Salad,
  Flame,
  HeartPulse,
} from "lucide-react";

// Picks a display icon for a recommendation based on its content.
// Purely presentational — does not affect recommendation generation logic.
function getIconForRecommendation(text) {
  const lower = text.toLowerCase();
  if (lower.includes("protein")) return Dumbbell;
  if (lower.includes("whole grain") || lower.includes("fruit") || lower.includes("vegetable"))
    return Salad;
  if (lower.includes("calorie")) return Flame;
  if (lower.includes("fat")) return HeartPulse;
  if (lower.includes("great job")) return CheckCircle2;
  return CheckCircle2;
}

export default function RecommendationCard({ summary }) {
  const recommendations = [];
  const calories = summary?.total_calories || 0;
  const protein = summary?.total_protein || 0;
  const carbs = summary?.total_carbohydrates || 0;
  const fat = summary?.total_fat || 0;

  if (protein < 50) {
    recommendations.push(
      `Increase today's protein intake by ${Math.ceil(50 - protein)}g.`
    );
  }
  if (carbs < 130) {
    recommendations.push(
      "Consider adding more whole grains, fruits, or vegetables today."
    );
  }
  if (calories < 1500) {
    recommendations.push(
      "You're below today's calorie target. Consider another balanced meal."
    );
  } else if (calories > 2500) {
    recommendations.push(
      "You've exceeded today's calorie goal. A lighter next meal is recommended."
    );
  }
  if (fat > 80) {
    recommendations.push(
      "Your fat intake is quite high today. Choose lighter meals for the rest of the day."
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Great job! You're maintaining a balanced diet today."
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-card">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
        AI Health Insights
      </h2>
      <p className="mt-1.5 text-sm text-gray-500">
        Based on today's nutrition, here are today's key suggestions.
      </p>

      {/* Recommendations */}
      <div className="mt-6">
        {recommendations.map((recommendation, index) => {
          const Icon = getIconForRecommendation(recommendation);
          return (
            <div
              key={index}
              className="flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl
                         border-b border-gray-100 last:border-b-0
                         transition-colors duration-200 hover:bg-green-50/60"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                <Icon className="h-4.5 w-4.5 text-green-600" strokeWidth={2} />
              </span>
              <p className="text-sm leading-relaxed text-gray-700">
                {recommendation}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400">
        Updated using today's nutrition data
      </p>
    </div>
  );
}