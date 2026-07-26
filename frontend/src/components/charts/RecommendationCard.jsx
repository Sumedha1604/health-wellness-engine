import {
  CheckCircle2,
  Dumbbell,
  Salad,
  Flame,
  HeartPulse,
} from "lucide-react";


function getIconForRecommendation(text) {

  const lower = String(text).toLowerCase();

  if (lower.includes("protein")) {
    return Dumbbell;
  }

  if (
    lower.includes("food") ||
    lower.includes("meal") ||
    lower.includes("vegetable")
  ) {
    return Salad;
  }

  if (lower.includes("calorie")) {
    return Flame;
  }

  if (lower.includes("fat")) {
    return HeartPulse;
  }

  return CheckCircle2;
}


export default function RecommendationCard({
  summary,
  recommendations,
}) {

  const items = [];


  if (recommendations?.ai_tip) {

    items.push(
      recommendations.ai_tip
    );

  }


  if (recommendations?.top_recommendation) {

    items.push(
      recommendations.top_recommendation
    );

  }


  if (
    recommendations?.ml_recommendations &&
    Array.isArray(recommendations.ml_recommendations)
  ) {

    recommendations.ml_recommendations.forEach(
      (item) => {

        items.push(
          `${item.item_type} recommendation: ${item.item_id} - ${item.reason}`
        );

      }
    );

  }


  if (items.length === 0) {

    items.push(
      "Great job! You're maintaining a balanced routine."
    );

  }


  return (

    <div className="bg-white rounded-3xl p-8 shadow-card">

      <h2 className="text-2xl font-semibold text-gray-900">
        AI Health Insights
      </h2>


      <p className="mt-2 text-sm text-gray-500">
        Personalized recommendations based on your health data.
      </p>


      {
        recommendations?.nutrition_score !== undefined && (

          <div className="mt-5">

            <p className="text-sm text-gray-500">
              Nutrition Score
            </p>

            <p className="text-3xl font-bold text-green-600">
              {recommendations.nutrition_score}/100
            </p>

          </div>

        )
      }


      <div className="mt-6">

        {
          items.map(
            (item, index) => {

              const Icon =
                getIconForRecommendation(item);


              return (

                <div
                  key={index}
                  className="
                    flex items-center gap-4
                    py-4 px-2
                    border-b border-gray-100
                  "
                >

                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-full bg-green-50
                    "
                  >

                    <Icon
                      className="h-5 w-5 text-green-600"
                    />

                  </span>


                  <p className="text-sm text-gray-700">
                    {item}
                  </p>


                </div>

              );

            }
          )
        }

      </div>


      <p className="mt-6 text-xs text-gray-400">
        Powered by recommendation engine
      </p>


    </div>

  );

}