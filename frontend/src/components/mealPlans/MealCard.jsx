import { Pencil, Trash2, Flame, Beef, Wheat, Droplet, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { deleteMealPlan } from "../../services/mealPlan.service";

export default function MealCard({
  meal,
  isFavorite,
  onRefresh,
  onToggleFavorite,
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

  const nutritionChips = [
    { key: "protein", label: "Protein", value: meal.protein, icon: Beef, unit: "g" },
    { key: "carbs", label: "Carbs", value: meal.carbohydrates, icon: Wheat, unit: "g" },
    { key: "fat", label: "Fat", value: meal.fat, icon: Droplet, unit: "g" },
  ].filter((chip) => chip.value != null);

  return (
    <div
      className="
        bg-white
        border border-gray-100
        rounded-2xl
        p-6
        shadow-sm
        transition-all duration-200
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left column */}
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight truncate">
            {meal.food_name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span
              className="
                px-3 py-1
                rounded-full
                bg-green-100
                text-green-700
                text-sm font-medium
              "
            >
              {meal.meal_type}
            </span>
            <span className="text-sm text-gray-500">
              {formatQuantity(meal.quantity)}
            </span>
          </div>

          {meal.description && (
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-md">
              {meal.description}
            </p>
          )}

          {nutritionChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {nutritionChips.map(({ key, label, value, icon: Icon, unit }) => (
                <span
                  key={key}
                  className="
                    flex items-center gap-1.5
                    rounded-full
                    bg-gray-50
                    border border-gray-100
                    px-3 py-1
                    text-xs font-medium text-gray-600
                  "
                >
                  <Icon className="h-3.5 w-3.5 text-green-600" strokeWidth={2} />
                  {label} {Math.round(value)}{unit}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
            <Flame className="h-4 w-4" strokeWidth={2} />
            {formatCalories(meal.caloric_value * meal.quantity)}
          </span>
          <p className="text-sm text-gray-400">
            {formatDate(meal.meal_date)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onToggleFavorite}
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-green-50
            text-green-600
            font-medium text-sm
            transition-colors duration-200
            hover:bg-green-100
          "
        >
          <Heart
            size={16}
            className={isFavorite ? "fill-green-600" : ""}
          />
          {isFavorite ? "Favorited" : "Favorite"}
        </button>
        <button
          onClick={() => onEdit(meal)}
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-blue-50
            text-blue-600
            font-medium text-sm
            transition-colors duration-200
            hover:bg-blue-100
          "
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-red-50
            text-red-600
            font-medium text-sm
            transition-colors duration-200
            hover:bg-red-100
          "
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}