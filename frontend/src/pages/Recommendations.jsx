import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ClipboardList,
} from "lucide-react";
import api from "../services/api";
import NutritionScoreCard from "../components/recommendations/NutritionScoreCard";
import TopRecommendationCard from "../components/recommendations/TopRecommendationCard";
import RecommendedFoods from "../components/recommendations/RecommendedFoods";
import RecommendedExercises from "../components/recommendations/RecommendedExercises";
import RecommendationAnalytics from "../components/recommendations/RecommendationAnalytics";
import MealModal from "../components/mealPlans/MealModal";
import toast from "react-hot-toast";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import {
  getRecommendationFeedback,
  getRecommendationAnalytics,
  submitRecommendationFeedback,
} from "../services/recommendation.service";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [selectedMealFood, setSelectedMealFood] = useState(null);

  useEffect(() => {
    fetchRecommendations();
    loadFeedback();
    loadAnalytics();
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

  async function loadAnalytics() {
    try {

      const analyticsData = await getRecommendationAnalytics();
      setAnalytics(analyticsData);

    } catch (error) {

      console.error("Unable to load recommendation analytics", error);

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

      loadAnalytics();

      if (response !== "viewed") {
        toast.success(
          response === "like"
            ? "Thanks! We'll use this feedback to improve recommendations."
            : "Thanks! We'll show you better matches."
        );
      }

    } catch (error) {

      console.error(error);
      toast.error("Unable to save feedback. Please try again.");

    }
  }

  if (loading) {
    return <LoadingState message="Preparing your personalized recommendations..." />;
  }

  if (error) {
    return <ErrorState
      title="We couldn't load your recommendations"
      message={error}
      onRetry={fetchRecommendations}
    />;
  }

  const hasRecommendations =
    recommendations.top_recommendation ||
    recommendations.ai_tip ||
    (recommendations.recommended_foods && recommendations.recommended_foods.length > 0) ||
    (recommendations.recommended_exercises && recommendations.recommended_exercises.length > 0);

  return (
    <div className="space-y-8 transition-opacity duration-300">
      {/* Hero Header */}
      <div className="rounded-wellness bg-wellness-slate p-6 text-white shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Guided by your habits</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          AI Health Recommendations
        </h1>
        <p className="mt-2 max-w-2xl text-white/75">
          Personalized nutrition insights based on your preferences and meal history.
        </p>
      </div>

      {!hasRecommendations ? (
        <div className="wellness-empty">
          <div className="flex flex-col items-center justify-center text-center py-16">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e1f8fd]">
              <Sparkles className="h-8 w-8 text-wellness-aqua" strokeWidth={1.5} />
            </span>
            <p className="mt-5 text-lg font-semibold text-wellness-slate">
              No recommendations yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#6b8582]">
              Recommendations will appear here once you set your preferences or start logging meals.
            </p>
            <button
              type="button"
              onClick={() => navigate("/preferences")}
              className="
                mt-6
                flex items-center gap-2
                bg-wellness-slate hover:bg-[#2e4747]
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

          <RecommendationAnalytics analytics={analytics} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopRecommendationCard
              recommendation={recommendations.top_recommendation}
              onAddToMealPlan={handleAddToMealPlan}
              feedback={feedback}
              onFeedback={handleFeedback}
            />

            <div
              className="
                wellness-card
                p-8
                transition-all duration-200
              "
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eaec]">
                  <Sparkles className="h-5 w-5 text-wellness-mauve" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-semibold text-wellness-slate tracking-tight">
                  AI Tip
                </h2>
              </div>
              <p className="mt-6 leading-relaxed text-[#526e6b]">
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
            onView={(exerciseId) =>
              handleFeedback("exercise", exerciseId, "viewed")
            }
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
