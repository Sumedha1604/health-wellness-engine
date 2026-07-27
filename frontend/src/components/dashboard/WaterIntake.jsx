import { useEffect, useState } from "react";
import { Droplets, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  addWater,
  getTodayWater,
} from "../../services/tracking.service";


export default function WaterIntake() {

  const [water, setWater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingAmount, setAddingAmount] = useState(null);


  useEffect(() => {
    loadWater();
  }, []);


  async function loadWater() {

    try {

      setLoading(true);

      const waterData = await getTodayWater();

      setWater(waterData);

    } catch (error) {

      console.error(error);
      toast.error("Unable to load water intake.");

    } finally {

      setLoading(false);

    }

  }


  async function handleAddWater(amount) {

    try {

      setAddingAmount(amount);

      await addWater(amount);

      await loadWater();

      toast.success(`${amount} ml of water added!`);

    } catch (error) {

      console.error(error);
      toast.error("Unable to add water intake.");

    } finally {

      setAddingAmount(null);

    }

  }


  if (loading) {

    return (
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-card">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="mt-6 h-12 w-32 rounded bg-gray-100" />
        <div className="mt-6 h-3 rounded-full bg-gray-100" />
      </div>
    );

  }


  const consumed = water?.consumed || 0;
  const goal = water?.goal || 2500;
  const percentage = Math.min(
    100,
    water?.percentage || 0
  );


  return (

    <div className="rounded-3xl bg-white p-8 shadow-card">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Water Intake
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Stay hydrated throughout the day.
          </p>

        </div>


        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
          <Droplets className="h-5 w-5 text-blue-600" />
        </span>

      </div>


      <div className="mt-7 flex items-end justify-between gap-4">

        <p className="text-4xl font-bold tracking-tight text-gray-900">
          {consumed}
          <span className="ml-1 text-lg font-medium text-gray-400">
            ml
          </span>
        </p>

        <p className="text-sm font-medium text-gray-500">
          Goal: {goal} ml
        </p>

      </div>


      <div className="mt-5 h-3 overflow-hidden rounded-full bg-blue-50">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>


      <p className="mt-2 text-sm font-medium text-blue-600">
        {water?.percentage || 0}% of your daily goal
      </p>


      <div className="mt-6 grid grid-cols-2 gap-3">

        {[250, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAddWater(amount)}
            disabled={addingAmount !== null}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingAmount === amount ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={16}/>
            )}
            {amount} ml
          </button>
        ))}

      </div>

    </div>

  );

}
