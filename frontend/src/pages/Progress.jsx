import { useEffect, useState } from "react";
import { Activity, Droplets, Flame, Target, Trophy } from "lucide-react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import { getProgressHistory, getProgressOverview } from "../services/progress.service";

function MetricCard({ icon, label, value, detail, tone }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-hover">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        {icon}
      </span>
      <p className="mt-5 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-gray-700">{label}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default function Progress() {

  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadProgress() {
      try {
        const [overviewData, historyData] = await Promise.all([
          getProgressOverview(),
          getProgressHistory(),
        ]);
        setOverview(overviewData);
        setHistory(historyData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();

  }, []);

  if (loading) {
    return <div className="p-8 text-lg text-gray-500">Loading your progress...</div>;
  }

  if (!overview) {
    return <div className="p-8 text-lg text-gray-500">Unable to load progress right now.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 p-8 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-purple-100">Wellness analytics</p>
        <h1 className="mt-2 text-4xl font-bold">Your Progress</h1>
        <p className="mt-3 max-w-2xl text-purple-100">
          Track the habits that are moving your wellness forward.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5 text-purple-600" />} label="Total workouts" value={overview.total_workouts} detail="All completed workouts" tone="bg-purple-50" />
        <MetricCard icon={<Droplets className="h-5 w-5 text-blue-600" />} label="Average water" value={`${overview.average_daily_water} ml`} detail="Average on tracked days" tone="bg-blue-50" />
        <MetricCard icon={<Flame className="h-5 w-5 text-orange-600" />} label="Calories logged" value={overview.calories_consumed} detail="From nutrition tracking" tone="bg-orange-50" />
        <MetricCard icon={<Trophy className="h-5 w-5 text-emerald-600" />} label="Current streak" value={`${overview.current_streak} days`} detail={`${overview.goals_completed} goals completed this week`} tone="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BarChart title="Workout Progress" subtitle="Completed workouts over the last 7 days." data={history} dataKey="workouts" unit="workouts" />
        <LineChart title="Water Intake" subtitle="Daily hydration over the last 7 days." data={history} dataKey="water_ml" color="#3B82F6" unit="ml" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChart title="Nutrition Trends" subtitle="Calories logged over the last 7 days." data={history} dataKey="calories" color="#F97316" unit="kcal" />
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Goal Completion</h2>
              <p className="mt-1 text-sm text-gray-500">Today&apos;s hydration and movement progress.</p>
            </div>
            <Target className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="mt-10 text-5xl font-bold tracking-tight text-gray-900">
            {overview.goal_progress_percentage}%
          </p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-50">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${overview.goal_progress_percentage}%` }} />
          </div>
          <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            Keep logging water and workouts to build a consistent wellness streak.
          </p>
        </div>
      </div>
    </div>
  );

}
