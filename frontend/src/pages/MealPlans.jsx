import { useEffect, useState } from "react";
import { Plus, UtensilsCrossed, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import MealModal from "../components/mealPlans/MealModal";
import MealCard from "../components/mealPlans/MealCard";
import { getMealPlans } from "../services/mealPlan.service";
import { getFavorites } from "../services/favorite.service";

export default function MealPlans() {
  const [meals, setMeals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  async function loadMeals() {
    try {
      setLoading(true);
      const [mealsData, favoritesData] = await Promise.all([
        getMealPlans(),
        getFavorites(),
      ]);
      setMeals(mealsData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeals();
  }, []);

  function handleAddMeal() {
    setSelectedMeal(null);
    setOpenModal(true);
  }

  function handleEditMeal(meal) {
    setSelectedMeal(meal);
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
    setSelectedMeal(null);
    loadMeals();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 bg-white rounded-3xl shadow-card px-12 py-10">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" strokeWidth={2} />
          <p className="text-base font-semibold text-gray-800">
            Loading meals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Meal Plans
          </h1>
          <p className="text-gray-500 mt-2">
            Create, manage, and organize your healthy meals.
          </p>
        </div>
        <Button
          onClick={handleAddMeal}
          className="
            bg-gradient-to-r from-green-500 to-emerald-500
            hover:from-green-600 hover:to-emerald-600
            text-white
            rounded-xl
            px-6 py-3
            shadow-md
            transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-lg
          "
        >
          <div className="flex items-center justify-center gap-2 font-semibold">
            <Plus size={18} />
            Add Meal
          </div>
        </Button>
      </div>

      {/* Meals Section */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            My Meals
          </h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {meals.length} {meals.length === 1 ? "Meal" : "Meals"}
          </span>
        </div>

        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <UtensilsCrossed className="h-8 w-8 text-green-500" strokeWidth={1.5} />
            </span>
            <p className="mt-5 text-lg font-semibold text-gray-900">
              No meals yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Start building your personalized meal plan by adding your first meal.
            </p>
            <Button
              onClick={handleAddMeal}
              className="
                mt-6
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-600 hover:to-emerald-600
                text-white
                rounded-xl
                px-6 py-3
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              "
            >
              <div className="flex items-center justify-center gap-2 font-semibold">
                <Plus size={18} />
                Add Meal
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <MealCard
                key={meal.meal_plan_id}
                meal={meal}
                isFavorite={favorites.some(
                  (favorite) =>
                    favorite.meal_plan_id === meal.meal_plan_id
                )}
                onRefresh={loadMeals}
                onEdit={handleEditMeal}
              />
            ))}
          </div>
        )}
      </div>

      <MealModal
        open={openModal}
        meal={selectedMeal}
        onClose={handleCloseModal}
      />
    </div>
  );
}