import { useEffect, useState } from "react";

import Input from "../ui/Input";

import { searchFoods } from "../../services/food.service";

export default function FoodSearch({
  value,
  onSelect,
}) {

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);

  useEffect(() => {

    if (value?.food_name) {

      setQuery(value.food_name);

    } else {

      setQuery("");

    }

  }, [value]);

  useEffect(() => {

    async function loadFoods() {

      if (!query.trim()) {

        setFoods([]);

        return;

      }

      try {

        const data = await searchFoods(query);

        setFoods(data);

      } catch (error) {

        console.error(error);

      }

    }

    const timeout = setTimeout(
      loadFoods,
      300
    );

    return () => clearTimeout(timeout);

  }, [query]);

  return (

    <div className="relative">

      <Input
        placeholder="Search food..."
        value={query}
        onChange={(e) => {

          setQuery(e.target.value);

        }}
      />

      {foods.length > 0 && (

        <div
          className="
            absolute
            w-full
            mt-2
            bg-white
            border
            rounded-xl
            shadow-lg
            max-h-60
            overflow-y-auto
            z-50
          "
        >

          {foods.map((food) => (

            <button
              key={food.food_id}
              type="button"
              onClick={() => {

                onSelect(food);

                setQuery(food.food_name);

                setFoods([]);

              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-green-50
              "
            >

              <p className="font-medium">

                {food.food_name}

              </p>

              <p className="text-sm text-gray-500">

                {food.caloric_value} kcal

              </p>

            </button>

          ))}

        </div>

      )}

    </div>

  );

}
