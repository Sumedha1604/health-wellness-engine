import { useEffect, useState } from "react";
import { Droplets, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  addWater,
  getTodayWater,
} from "../../services/tracking.service";
import CircularProgress from "../charts/CircularProgress";
import ProgressBar from "../ui/ProgressBar";


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

    <div className="wellness-card overflow-hidden p-6 sm:p-8">

      <div className="-mx-6 -mt-6 mb-6 flex items-start justify-between bg-wellness-slate px-6 py-5 text-white sm:-mx-8 sm:-mt-8 sm:px-8">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Hydration ritual</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Water Intake
          </h2>

          <p className="mt-1 text-sm text-white/75">
            Stay hydrated throughout the day.
          </p>

        </div>


        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Droplets className="h-5 w-5 text-white" />
        </span>

      </div>


      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">

        <CircularProgress value={percentage} />

        <p className="text-4xl font-bold tracking-tight text-wellness-slate">
          {consumed}
            <span className="ml-1 text-lg font-medium text-wellness-teal">
            ml
          </span>
        </p>

        <p className="text-sm font-semibold text-[#6b8582]">
          Goal: {goal} ml
        </p>

      </div>


      <ProgressBar value={percentage} className="mt-6" />


      <p className="mt-2 text-sm font-semibold text-wellness-aqua">
        {Math.max(0, goal - consumed)} ml to your daily goal
      </p>


      <div className="mt-6 grid grid-cols-2 gap-3">

        {[250, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAddWater(amount)}
            disabled={addingAmount !== null}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-wellness-mist px-4 py-3 text-sm font-semibold text-wellness-slate transition hover:bg-wellness-teal/25 disabled:cursor-not-allowed disabled:opacity-60"
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
