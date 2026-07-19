import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import FoodSearch from "./FoodSearch";

import {
  createMealPlan,
  updateMealPlan,
} from "../../services/mealPlan.service";

function getDefaultForm() {
  return {
    food_id: "",
    meal_type: "Breakfast",
    quantity: 1,
    meal_date: new Date().toISOString().split("T")[0],
  };
}

function formatDateForInput(date) {
  if (!date) {
    return new Date().toISOString().split("T")[0];
  }

  return new Date(date).toISOString().split("T")[0];
}

export default function MealModal({
  open,
  onClose,
  meal,
}) {
  const isEditing = Boolean(meal);

  const [form, setForm] = useState(getDefaultForm());
  const [selectedFood, setSelectedFood] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditing) {
      setForm({
        food_id: meal.food_id,
        meal_type: meal.meal_type,
        quantity: meal.quantity,
        meal_date: formatDateForInput(meal.meal_date),
      });

      setSelectedFood({
        food_id: meal.food_id,
        food_name: meal.food_name,
        caloric_value: meal.caloric_value,
      });
    } else {
      setForm(getDefaultForm());
      setSelectedFood(null);
    }
  }, [open, meal, isEditing]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSave() {
    if (!form.food_id) {
      toast.error("Please select a food.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await updateMealPlan(
          meal.meal_plan_id,
          form
        );

        toast.success("Meal updated successfully!");
      } else {
        await createMealPlan(form);

        toast.success("Meal added successfully!");
      }

      setForm(getDefaultForm());
      setSelectedFood(null);

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          (isEditing
            ? "Failed to update meal."
            : "Failed to add meal.")
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6">
          {isEditing ? "Edit Meal" : "Add Meal"}
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Food
            </label>

            <FoodSearch
              value={selectedFood}
              onSelect={(food) => {
                setSelectedFood(food);

                setForm((prev) => ({
                  ...prev,
                  food_id: food.food_id,
                }));
              }}
            />

            {selectedFood && (
              <p className="text-sm text-green-600 mt-2">
                Selected: <strong>{selectedFood.food_name}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Meal Type
            </label>

            <select
              name="meal_type"
              value={form.meal_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Quantity
            </label>

            <Input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Meal Date
            </label>

            <Input
              type="date"
              name="meal_date"
              value={form.meal_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
              ? "Update Meal"
              : "Save Meal"}
          </Button>
        </div>
      </div>
    </div>
  );
}