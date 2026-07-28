import { useEffect, useState } from "react";
import { Activity, Droplets, Flame, Target, Trophy } from "lucide-react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import { getProgressHistory, getProgressOverview } from "../services/progress.service";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";

function MetricCard({ icon, label, value, detail, tone }) {
  return (
    <div className="wellness-card p-6">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        {icon}
      </span>
      <p className="mt-5 text-3xl font-bold tracking-tight text-wellness-slate">{value}</p>
      <p className="mt-1 text-sm font-semibold text-wellness-slate">{label}</p>
      <p className="mt-1 text-xs text-[#6b8582]">{detail}</p>
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
    return <LoadingState message="Loading your progress..." />;
  }

  if (!overview) {
    return <ErrorState
      title="Unable to load progress"
      message="Please check your connection and try again."
      onRetry={() => window.location.reload()}
    />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-wellness bg-wellness-slate p-6 text-white shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Wellness analytics</p>
        <h1 className="mt-2 text-4xl font-bold">Your Progress</h1>
        <p className="mt-3 max-w-2xl text-white/75">
          Track the habits that are moving your wellness forward.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5 text-wellness-mauve" />} label="Total workouts" value={overview.total_workouts} detail="All completed workouts" tone="bg-[#f7eaec]" />
        <MetricCard icon={<Droplets className="h-5 w-5 text-wellness-aqua" />} label="Average water" value={`${overview.average_daily_water} ml`} detail="Average on tracked days" tone="bg-[#e1f8fd]" />
        <MetricCard icon={<Flame className="h-5 w-5 text-wellness-slate" />} label="Calories logged" value={overview.calories_consumed} detail="From nutrition tracking" tone="bg-wellness-cream" />
        <MetricCard icon={<Trophy className="h-5 w-5 text-wellness-teal" />} label="Current streak" value={`${overview.current_streak} days`} detail={`${overview.goals_completed} goals completed this week`} tone="bg-wellness-mist" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BarChart title="Workout Progress" subtitle="Completed workouts over the last 7 days." data={history} dataKey="workouts" unit="workouts" />
        <LineChart title="Water Intake" subtitle="Daily hydration over the last 7 days." data={history} dataKey="water_ml" color="#0FB1D2" unit="ml" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChart title="Nutrition Trends" subtitle="Calories logged over the last 7 days." data={history} dataKey="calories" color="#A64253" unit="kcal" />
        <div className="wellness-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Goal Completion</h2>
              <p className="mt-1 text-sm text-gray-500">Today&apos;s hydration and movement progress.</p>
            </div>
            <Target className="h-6 w-6 text-wellness-aqua" />
          </div>
          <p className="mt-10 text-5xl font-bold tracking-tight text-wellness-slate">
            {overview.goal_progress_percentage}%
          </p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-wellness-mist">
            <div className="h-full rounded-full bg-wellness-aqua transition-all duration-500" style={{ width: `${overview.goal_progress_percentage}%` }} />
          </div>
          <p className="mt-6 rounded-2xl bg-wellness-mist p-4 text-sm leading-6 text-wellness-slate">
            Keep logging water and workouts to build a consistent wellness streak.
          </p>
        </div>
      </div>
    </div>
  );

}
