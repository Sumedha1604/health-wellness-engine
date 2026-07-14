import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import FoodSearch from "./FoodSearch";

import { createMealPlan } from "../../services/mealPlan.service";

export default function AddMealModal({
  open,
  onClose,
}) {

  const [form, setForm] =useState({
    food_id: "",
    meal_type: "Breakfast",
    quantity: 1,
    meal_date: new Date().toISOString().split("T")[0],
  });

  const [selectedFood, setSelectedFood] = useState(null);

  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }

  async function handleSave() {

    if (!form.food_id) {

      toast.error("Please select a food.");

      return;

    }

    try {

      await createMealPlan(form);

      toast.success("Meal added successfully!");

      setForm({
        food_id: "",
        meal_type: "Breakfast",
        quantity: 1,
        meal_date: new Date().toISOString().split("T")[0],
      });

      setSelectedFood(null);

      onClose();

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to add meal."
      );

    }

  }

  if (!open) {

    return null;

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

        <h2 className="text-3xl font-bold mb-6">
          Add Meal
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

                Selected:

                {" "}

                <strong>

                  {selectedFood.food_name}

                </strong>

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

              <option value="Breakfast">
                Breakfast
              </option>

              <option value="Lunch">
                Lunch
              </option>

              <option value="Dinner">
                Dinner
              </option>

              <option value="Snack">
                Snack
              </option>

            </select>

          </div>

          <div>

            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Quantity
            </label>

            <Input
              type="number"
              name="quantity"
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
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
          >
            Save Meal
          </Button>

        </div>

      </div>

    </div>

  );

}