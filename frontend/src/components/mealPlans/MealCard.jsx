import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { deleteMealPlan } from "../../services/mealPlan.service";

export default function MealCard({
  meal,
  onRefresh,
  onEdit,
}) {

  function formatDate(date) {

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  }

  function formatQuantity(quantity) {

    return Number(quantity) === 1
      ? "1 serving"
      : `${quantity} servings`;

  }

  function formatCalories(calories) {

    return `${Math.round(calories)} kcal`;

  }

  async function handleDelete() {

    const confirmed = window.confirm(
      `Delete "${meal.food_name}"?`
    );

    if (!confirmed) {

      return;

    }

    try {

      await deleteMealPlan(
        meal.meal_plan_id
      );

      toast.success(
        "Meal deleted successfully!"
      );

      onRefresh();

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to delete meal."
      );

    }

  }

  return (

    <div
      className="
        border
        rounded-2xl
        p-6
        hover:shadow-md
        transition-all
      "
    >

      <div className="flex justify-between items-start">

        <div>

          <h3 className="text-xl font-semibold">

            {meal.food_name}

          </h3>

          <div className="flex gap-3 mt-2">

            <span
              className="
                px-3
                py-1
                rounded-full
                bg-green-100
                text-green-700
                text-sm
              "
            >

              {meal.meal_type}

            </span>

            <span className="text-gray-500">

              {formatQuantity(
                meal.quantity
              )}

            </span>

          </div>

        </div>

        <div className="text-right">

          <p className="font-bold text-lg">

            {formatCalories(
              meal.caloric_value
            )}

          </p>

          <p className="text-gray-500 text-sm">

            {formatDate(
              meal.meal_date
            )}

          </p>

        </div>

      </div>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => onEdit(meal)}
          className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-blue-50
            hover:bg-blue-100
          "
        >

          <Pencil size={16} />

          Edit

        </button>

        <button
          onClick={handleDelete}
          className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-red-50
            hover:bg-red-100
            text-red-600
          "
        >

          <Trash2 size={16} />

          Delete

        </button>

      </div>

    </div>

  );

}