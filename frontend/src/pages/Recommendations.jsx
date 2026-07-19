import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ClipboardList } from "lucide-react";
import api from "../services/api";
import NutritionScoreCard from "../components/recommendations/NutritionScoreCard";
import TopRecommendationCard from "../components/recommendations/TopRecommendationCard";
import RecommendedFoods from "../components/recommendations/RecommendedFoods";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const response = await api.get("/recommendations");
      setRecommendations(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  if (!recommendations) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 bg-white rounded-3xl shadow-card px-12 py-10">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" strokeWidth={2} />
          <p className="text-base font-semibold text-gray-800">
            Loading recommendations...
          </p>
        </div>
      </div>
    );
  }

  const hasRecommendations =
    recommendations.top_recommendation ||
    recommendations.ai_tip ||
    (recommendations.recommended_foods && recommendations.recommended_foods.length > 0);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          AI Health Recommendations
        </h1>
        <p className="text-gray-500 mt-2">
          Personalized nutrition insights based on your preferences and meal history.
        </p>
      </div>

      {!hasRecommendations ? (
        <div className="bg-white rounded-3xl shadow-card p-8">
          <div className="flex flex-col items-center justify-center text-center py-16">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Sparkles className="h-8 w-8 text-green-500" strokeWidth={1.5} />
            </span>
            <p className="mt-5 text-lg font-semibold text-gray-900">
              No recommendations yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Recommendations will appear here once you set your preferences or start logging meals.
            </p>
            <button
              type="button"
              onClick={() => navigate("/preferences")}
              className="
                mt-6
                flex items-center gap-2
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-600 hover:to-emerald-600
                text-white
                font-semibold
                rounded-xl
                px-6 py-3
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              "
            >
              <ClipboardList size={18} />
              Update Preferences
            </button>
          </div>
        </div>
      ) : (
        <>
          <NutritionScoreCard
            score={recommendations.nutrition_score}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopRecommendationCard
              recommendation={recommendations.top_recommendation}
            />

            <div
              className="
                bg-white
                rounded-2xl
                shadow-sm
                border border-gray-100
                p-8
                transition-all duration-200
                hover:shadow-lg
                hover:-translate-y-0.5
              "
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Sparkles className="h-5 w-5 text-green-600" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  AI Tip
                </h2>
              </div>
              <p className="mt-6 text-gray-500 leading-relaxed">
                {recommendations.ai_tip}
              </p>
            </div>
          </div>

          <RecommendedFoods
            foods={recommendations.recommended_foods}
          />
        </>
      )}
    </div>
  );
}