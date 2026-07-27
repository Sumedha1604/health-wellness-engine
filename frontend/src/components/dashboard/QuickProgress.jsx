import { useEffect, useState } from "react";
import { Activity, Droplets, Target } from "lucide-react";
import { getProgressOverview } from "../../services/progress.service";

export default function QuickProgress() {

  const [overview, setOverview] = useState(null);

  useEffect(() => {

    async function loadQuickProgress() {
      try {
        const data = await getProgressOverview();
        setOverview(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadQuickProgress();

  }, []);

  if (!overview) {
    return (
      <div className="animate-pulse rounded-3xl bg-white p-7 shadow-card">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="mt-6 h-20 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-7 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            Quick Progress
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your wellness snapshot this week.
          </p>
        </div>
        <Target className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-purple-50 p-4">
          <Activity className="h-4 w-4 text-purple-600" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.workouts_this_week}
          </p>
          <p className="text-xs font-medium text-gray-500">This week</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-4">
          <Droplets className="h-4 w-4 text-blue-600" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.average_daily_water}
          </p>
          <p className="text-xs font-medium text-gray-500">Avg. water ml</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <Target className="h-4 w-4 text-emerald-600" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.goal_progress_percentage}%
          </p>
          <p className="text-xs font-medium text-gray-500">Today&apos;s goal</p>
        </div>
      </div>
    </div>
  );

}
