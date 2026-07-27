import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  ClipboardList,
} from "lucide-react";
import api from "../services/api";
import NutritionScoreCard from "../components/recommendations/NutritionScoreCard";
import TopRecommendationCard from "../components/recommendations/TopRecommendationCard";
import RecommendedFoods from "../components/recommendations/RecommendedFoods";
import RecommendedExercises from "../components/recommendations/RecommendedExercises";
import MealModal from "../components/mealPlans/MealModal";
import toast from "react-hot-toast";
import {
  getRecommendationFeedback,
  submitRecommendationFeedback,
} from "../services/recommendation.service";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const navigate = useNavigate();

  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [selectedMealFood, setSelectedMealFood] = useState(null);

  useEffect(() => {
    fetchRecommendations();
    loadFeedback();
  }, []);

  async function fetchRecommendations() {
    try {

      setLoading(true);
      setError(null);

      const response = await api.get("/recommendations");

      setRecommendations(response.data.data);

    } catch (error) {

      console.error(error);
      setError("Unable to load recommendations right now.");

    } finally {

      setLoading(false);

    }
  }

  function handleAddToMealPlan(food) {
    setSelectedMealFood(food);
    setMealModalOpen(true);
  }

  function handleCloseMealModal() {
    setMealModalOpen(false);
    setSelectedMealFood(null);
  }

  async function loadFeedback() {
    try {

      const feedbackData = await getRecommendationFeedback();

      setFeedback(
        feedbackData.reduce((currentFeedback, item) => {

          const feedbackId = `${item.recommendation_type}-${
            item.recommendation_id
          }`;

          if (!currentFeedback[feedbackId]) {
            currentFeedback[feedbackId] = item.feedback;
          }

          return currentFeedback;

        }, {})
      );

    } catch (error) {

      console.error(error);

    }
  }

  async function handleFeedback(
    recommendationType,
    recommendationId,
    response
  ) {
    try {

      await submitRecommendationFeedback({
        recommendation_type: recommendationType,
        recommendation_id: recommendationId,
        feedback: response,
      });

      const feedbackId = `${recommendationType}-${
        recommendationId
      }`;

      setFeedback((prev) => ({
        ...prev,
        [feedbackId]: response,
      }));

      toast.success(
        response === "like"
          ? "Thanks! We'll use this feedback to improve recommendations."
          : "Thanks! We'll show you better matches."
      );

    } catch (error) {

      console.error(error);
      toast.error("Unable to save feedback. Please try again.");

    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-80 max-w-full rounded-xl bg-gray-200" />
          <div className="mt-3 h-5 w-2/3 max-w-full rounded-lg bg-gray-100" />
        </div>
        <div className="h-56 rounded-3xl bg-white shadow-card" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-72 rounded-3xl bg-white shadow-card" />
          <div className="h-72 rounded-3xl bg-white shadow-card" />
        </div>
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white py-6 shadow-card">
          <Loader2 className="h-5 w-5 animate-spin text-green-600" strokeWidth={2} />
          <p className="text-sm font-semibold text-gray-700">
            Preparing your personalized recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white px-12 py-10 text-center shadow-card">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Sparkles className="h-8 w-8 text-red-400" strokeWidth={1.5} />
          </span>
          <p className="text-lg font-semibold text-gray-900">
            We couldn't load your recommendations
          </p>
          <p className="text-sm text-gray-500">
            Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={fetchRecommendations}
            className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasRecommendations =
    recommendations.top_recommendation ||
    recommendations.ai_tip ||
    (recommendations.recommended_foods && recommendations.recommended_foods.length > 0) ||
    (recommendations.recommended_exercises && recommendations.recommended_exercises.length > 0);

  return (
    <div className="space-y-8 transition-opacity duration-300">
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
              onAddToMealPlan={handleAddToMealPlan}
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
            onAddToMealPlan={handleAddToMealPlan}
            feedback={feedback}
            onFeedback={handleFeedback}
          />

          <RecommendedExercises
            exercises={recommendations.recommended_exercises}
            feedback={feedback}
            onFeedback={handleFeedback}
          />
        </>
      )}

      <MealModal
        open={mealModalOpen}
        onClose={handleCloseMealModal}
        meal={selectedMealFood}
      />
    </div>
  );
}
