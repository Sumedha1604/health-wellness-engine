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
      recommendations.top_recommendation.food_name ||
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
      "Keep logging meals, water, and workouts to unlock more tailored guidance."
    );

  }


  return (

    <section className="wellness-card p-6 sm:p-8">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="wellness-eyebrow">Personalized guidance</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">
            Recommendation insights
          </h2>

          <p className="mt-1 text-sm text-[#6b8582]">
            Practical next steps based on your current wellness data.
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7eaec]">
          <HeartPulse className="h-5 w-5 text-wellness-mauve" />
        </span>
      </div>


      {
        recommendations?.nutrition_score !== undefined && (

          <div className="mt-5">

            <p className="text-sm font-medium text-[#6b8582]">
              Nutrition Score
            </p>

            <p className="mt-1 text-3xl font-bold text-wellness-teal">
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
                    border-b border-wellness-teal/10
                  "
                >

                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                        rounded-xl bg-wellness-mist
                    "
                  >

                    <Icon
                      className="h-5 w-5 text-wellness-teal"
                    />

                  </span>


                  <p className="text-sm leading-6 text-wellness-slate">
                    {item}
                  </p>


                </div>

              );

            }
          )
        }

      </div>

    </section>

  );

}
