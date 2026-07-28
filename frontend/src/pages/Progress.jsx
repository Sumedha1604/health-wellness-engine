import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCircle2, Droplets, Flame, Trophy } from "lucide-react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import CircularProgress from "../components/charts/CircularProgress";
import ProgressBar from "../components/ui/ProgressBar";
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
  const [error, setError] = useState(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, historyData] = await Promise.all([
        getProgressOverview(),
        getProgressHistory(),
      ]);

      setOverview(overviewData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (requestError) {
      console.error("Unable to load progress data", requestError);
      setError("We couldn't load your progress data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) {
    return <LoadingState message="Loading your progress..." />;
  }

  if (error || !overview) {
    return <ErrorState
      title="Unable to load progress"
      message={error || "Please check your connection and try again."}
      onRetry={loadProgress}
    />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 rounded-wellness bg-wellness-slate p-6 text-white shadow-card sm:p-8 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Wellness analytics</p>
          <h1 className="mt-2 text-4xl font-bold">Your Progress</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Your seven-day view of hydration, nutrition, workouts, and wellness goals.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Weekly momentum</p>
          <p className="mt-1 text-2xl font-bold">{overview.workouts_this_week || 0} workouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Activity className="h-5 w-5 text-wellness-mauve" />} label="Total workouts" value={overview.total_workouts} detail="All completed workouts" tone="bg-[#f7eaec]" />
        <MetricCard icon={<Droplets className="h-5 w-5 text-wellness-aqua" />} label="Average water" value={`${overview.average_daily_water || 0} ml`} detail={`${overview.total_water || 0} ml logged overall`} tone="bg-[#e1f8fd]" />
        <MetricCard icon={<Flame className="h-5 w-5 text-wellness-slate" />} label="Calories logged" value={overview.calories_consumed} detail="From nutrition tracking" tone="bg-wellness-cream" />
        <MetricCard icon={<Trophy className="h-5 w-5 text-wellness-teal" />} label="Current streak" value={`${overview.current_streak || 0} days`} detail="Keep your wellness rhythm going" tone="bg-wellness-mist" />
        <MetricCard icon={<CheckCircle2 className="h-5 w-5 text-wellness-mauve" />} label="Completed goals" value={overview.goals_completed || 0} detail="Goals reached this week" tone="bg-[#f7eaec]" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChart title="7-Day Water Intake" subtitle="Daily hydration over the last seven days." data={history} dataKey="water_ml" color="#0FB1D2" unit="ml" />
        <LineChart title="Calorie Trend" subtitle="Calories logged over the last seven days." data={history} dataKey="calories" color="#A64253" unit="kcal" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChart title="Protein Trend" subtitle="Protein logged over the last seven days." data={history} dataKey="protein" color="#73ABA6" unit="g" />
        <BarChart title="Workout History" subtitle="Completed workouts over the last seven days." data={history} dataKey="workouts" color="#A64253" unit="workouts" />
      </div>

      <section className="wellness-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <CircularProgress value={overview.goal_progress_percentage || 0} label="today" color="#73ABA6" />
            <div>
              <p className="wellness-eyebrow">Goal completion</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">Today&apos;s wellness rhythm</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6b8582]">
                Complete your hydration target and a workout to build a stronger daily routine.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[250px]">
            <div className="rounded-2xl bg-wellness-mist p-4">
              <p className="text-2xl font-bold text-wellness-slate">{overview.goals_completed || 0}</p>
              <p className="mt-1 text-xs font-semibold text-[#6b8582]">Goals reached</p>
            </div>
            <div className="rounded-2xl bg-[#f7eaec] p-4">
              <p className="text-2xl font-bold text-wellness-slate">{overview.current_streak || 0}</p>
              <p className="mt-1 text-xs font-semibold text-[#6b8582]">Day streak</p>
            </div>
          </div>
        </div>
        <ProgressBar value={overview.goal_progress_percentage || 0} color="bg-wellness-teal" className="mt-7" label="Today&apos;s goal completion" />
      </section>
    </div>
  );

}
