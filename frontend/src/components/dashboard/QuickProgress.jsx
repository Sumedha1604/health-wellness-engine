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
    <div className="wellness-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="wellness-eyebrow">Momentum</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-wellness-slate">
            Wellness Streak
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your wellness snapshot this week.
          </p>
        </div>
        <span className="rounded-full bg-wellness-cream px-3 py-1.5 text-sm font-bold text-wellness-slate">{overview.current_streak} days 🔥</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#f7eaec] p-4">
          <Activity className="h-4 w-4 text-wellness-mauve" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.workouts_this_week}
          </p>
          <p className="text-xs font-medium text-gray-500">This week</p>
        </div>
        <div className="rounded-2xl bg-[#e1f8fd] p-4">
          <Droplets className="h-4 w-4 text-wellness-aqua" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.average_daily_water}
          </p>
          <p className="text-xs font-medium text-gray-500">Avg. water ml</p>
        </div>
        <div className="rounded-2xl bg-wellness-mist p-4">
          <Target className="h-4 w-4 text-wellness-teal" />
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {overview.goal_progress_percentage}%
          </p>
          <p className="text-xs font-medium text-gray-500">Today&apos;s goal</p>
        </div>
      </div>
    </div>
  );

}
