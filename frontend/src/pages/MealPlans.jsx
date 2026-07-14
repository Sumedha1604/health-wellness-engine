import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Button from "../components/ui/Button";
import AddMealModal from "../components/mealPlans/AddMealModal";
import MealCard from "../components/mealPlans/MealCard";

import { getMealPlans } from "../services/mealPlan.service";

export default function MealPlans() {

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  async function loadMeals() {

    try {

      setLoading(true);

      const data = await getMealPlans();

      setMeals(data);

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
      <h2 className="text-2xl font-semibold">
        Loading meals...
      </h2>
    );

  }

  return (

    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Meal Plans
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your meals.
          </p>

        </div>

        <Button
          onClick={handleAddMeal}
        >

          <div className="flex items-center justify-center gap-2">

            <Plus size={18} />

            Add Meal

          </div>

        </Button>

      </div>

      <div className="bg-white rounded-3xl shadow-card p-8">

        <h2 className="text-2xl font-semibold mb-6">

          My Meals

        </h2>

        {meals.length === 0 ? (

          <div className="text-center py-12">

            <p className="text-gray-500">

              No meals found.

            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {meals.map((meal) => (

              <MealCard
                key={meal.meal_plan_id}
                meal={meal}
                onRefresh={loadMeals}
                onEdit={handleEditMeal}
              />

            ))}

          </div>

        )}

      </div>

      <AddMealModal
        open={openModal}
        meal={selectedMeal}
        onClose={handleCloseModal}
      />

    </div>

  );

}