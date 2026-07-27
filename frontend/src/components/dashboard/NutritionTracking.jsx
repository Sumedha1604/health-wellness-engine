import { useEffect, useState } from "react";
import { Beef, Flame, Loader2, Wheat, Droplets } from "lucide-react";
import { getTodayNutrition } from "../../services/tracking.service";


export default function NutritionTracking() {

  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadNutrition();
  }, []);


  async function loadNutrition() {

    try {

      setLoading(true);

      const nutritionData = await getTodayNutrition();

      setNutritionLogs(nutritionData);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }


  const totals = nutritionLogs.reduce(
    (currentTotals, log) => {

      const quantity = Number(log.quantity) || 0;

      return {
        calories:
          currentTotals.calories +
          (Number(log.caloric_value) || 0) * quantity,
        protein:
          currentTotals.protein +
          (Number(log.protein) || 0) * quantity,
        carbs:
          currentTotals.carbs +
          (Number(log.carbohydrates) || 0) * quantity,
        fat:
          currentTotals.fat +
          (Number(log.fat) || 0) * quantity,
      };

    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );

  const stats = [
    {
      label: "Calories",
      value: Math.round(totals.calories),
      unit: "kcal",
      icon: Flame,
      color: "text-orange-500",
      background: "bg-orange-50",
    },
    {
      label: "Protein",
      value: Math.round(totals.protein * 10) / 10,
      unit: "g",
      icon: Beef,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      label: "Carbs",
      value: Math.round(totals.carbs * 10) / 10,
      unit: "g",
      icon: Wheat,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
    {
      label: "Fat",
      value: Math.round(totals.fat * 10) / 10,
      unit: "g",
      icon: Droplets,
      color: "text-red-500",
      background: "bg-red-50",
    },
  ];


  return (

    <div className="rounded-3xl bg-white p-8 shadow-card">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Nutrition Tracking
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Today&apos;s logged nutrition totals.
          </p>

        </div>


        <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
          {nutritionLogs.length} logged
        </span>

      </div>


      {loading ? (

        <div className="flex min-h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>


      ) : (

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 p-4"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.background}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </span>
                <p className="mt-4 text-sm text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {stat.value}
                  <span className="ml-1 text-sm font-medium text-gray-400">
                    {stat.unit}
                  </span>
                </p>
              </div>
            );
          })}

        </div>

      )}

    </div>

  );

}
