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
      color: "text-wellness-aqua",
      background: "bg-[#e1f8fd]",
    },
    {
      label: "Protein",
      value: Math.round(totals.protein * 10) / 10,
      unit: "g",
      icon: Beef,
      color: "text-wellness-mauve",
      background: "bg-[#f7eaec]",
    },
    {
      label: "Carbs",
      value: Math.round(totals.carbs * 10) / 10,
      unit: "g",
      icon: Wheat,
      color: "text-wellness-teal",
      background: "bg-wellness-mist",
    },
    {
      label: "Fat",
      value: Math.round(totals.fat * 10) / 10,
      unit: "g",
      icon: Droplets,
      color: "text-wellness-slate",
      background: "bg-wellness-cream",
    },
  ];


  return (

    <div className="wellness-card p-6 sm:p-8">

      <div className="flex items-start justify-between">

        <div>

          <p className="wellness-eyebrow">Fuel check-in</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">
            Nutrition Tracking
          </h2>

          <p className="mt-1 text-sm text-[#6b8582]">
            Today&apos;s logged nutrition totals.
          </p>

        </div>


        <span className="rounded-full bg-wellness-mist px-3 py-1.5 text-sm font-semibold text-wellness-slate">
          {nutritionLogs.length} logged
        </span>

      </div>


      {loading ? (

        <div className="flex min-h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wellness-aqua" />
        </div>


      ) : (

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-wellness-teal/15 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.background}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </span>
                <p className="mt-4 text-sm text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-wellness-slate">
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
