import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  Dumbbell,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";
import BarChart from "../charts/BarChart";
import LineChart from "../charts/LineChart";


function GoalCompletionChart({ overview }) {
  const completion = Math.min(
    100,
    Math.max(0, Number(overview?.goal_progress_percentage) || 0)
  );
  const chartData = [
    { name: "Complete", value: completion },
    { name: "Remaining", value: 100 - completion },
  ];

  return (
    <section className="wellness-card min-h-[310px] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="wellness-eyebrow">Daily rhythm</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-wellness-slate">
            Goal completion
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            Hydration and movement progress for today.
          </p>
        </div>
        <CheckCircle2 className="h-6 w-6 text-wellness-teal" />
      </div>

      <div className="relative mx-auto mt-5 h-44 max-w-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={74}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="#73ABA6" />
              <Cell fill="#EAF1F0" />
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Math.round(value)}%`, name]}
              contentStyle={{
                borderRadius: "14px",
                border: "1px solid #E1ECEA",
                boxShadow: "0 12px 28px rgba(57,86,86,.12)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-wellness-slate">
            {completion}%
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-wellness-teal">
            complete
          </span>
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-wellness-mist p-3">
          <p className="text-xl font-bold text-wellness-slate">
            {overview?.goals_completed || 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[#6b8582]">Goals reached</p>
        </div>
        <div className="rounded-2xl bg-[#f7eaec] p-3">
          <p className="text-xl font-bold text-wellness-slate">
            {overview?.current_streak || 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[#6b8582]">Day streak</p>
        </div>
      </div>
    </section>
  );
}


function NutritionSummary({ summary, history }) {
  const latestHistory = history[history.length - 1] || {};
  const nutrition = [
    {
      label: "Calories",
      value: Math.round(Number(summary?.total_calories) || Number(latestHistory.calories) || 0),
      unit: "kcal",
      color: "bg-[#e1f8fd] text-wellness-aqua",
    },
    {
      label: "Protein",
      value: Math.round(Number(summary?.total_protein) || Number(latestHistory.protein) || 0),
      unit: "g",
      color: "bg-[#f7eaec] text-wellness-mauve",
    },
    {
      label: "Carbs",
      value: Math.round(Number(summary?.total_carbohydrates) || 0),
      unit: "g",
      color: "bg-wellness-mist text-wellness-teal",
    },
    {
      label: "Fat",
      value: Math.round(Number(summary?.total_fat) || 0),
      unit: "g",
      color: "bg-wellness-cream text-wellness-slate",
    },
  ];

  return (
    <section className="wellness-card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="wellness-eyebrow">Fuel overview</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-wellness-slate">
            Nutrition summary
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            Today&apos;s macro snapshot from your meal plan and nutrition logs.
          </p>
        </div>
        <TrendingUp className="h-6 w-6 text-wellness-mauve" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {nutrition.map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 ${item.color}`}>
            <p className="text-xs font-semibold opacity-70">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-wellness-slate">
              {item.value}
              <span className="ml-1 text-xs font-semibold opacity-70">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


function RecommendationInsights({ analytics }) {
  const insights = [
    {
      label: "Viewed",
      value: analytics?.total_recommendations_viewed || 0,
      icon: Eye,
      color: "text-wellness-aqua bg-[#e1f8fd]",
    },
    {
      label: "Accepted",
      value: analytics?.accepted_recommendations || 0,
      icon: CheckCircle2,
      color: "text-wellness-teal bg-wellness-mist",
    },
    {
      label: "Favourites",
      value: analytics?.favourite_recommendations || 0,
      icon: Heart,
      color: "text-wellness-mauve bg-[#f7eaec]",
    },
  ];

  return (
    <section className="wellness-card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="wellness-eyebrow">Personalization</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-wellness-slate">
            Recommendation insights
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            Your interactions help make future suggestions more relevant.
          </p>
        </div>
        <Heart className="h-6 w-6 text-wellness-mauve" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {insights.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-wellness-teal/10 p-3 text-center">
            <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xl font-bold text-wellness-slate">{value}</p>
            <p className="mt-1 text-xs font-medium text-[#6b8582]">{label}</p>
          </div>
        ))}
      </div>

      {analytics?.most_recommended_exercise_categories?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {analytics.most_recommended_exercise_categories.slice(0, 3).map((item) => (
            <span
              key={item.category}
              className="rounded-full bg-wellness-cream px-3 py-1.5 text-xs font-semibold text-wellness-slate"
            >
              {item.category} · {item.recommendation_count}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Interact with recommendations to see the exercise categories you explore most.
        </p>
      )}
    </section>
  );
}


export default function DashboardAnalytics({ overview, history, summary, analytics }) {
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="wellness-eyebrow">Your weekly view</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">
            Wellness analytics
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            Keep an eye on movement, hydration, nutrition, and your progress trends.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f7eaec] px-3 py-1.5 text-sm font-semibold text-wellness-mauve">
          <Dumbbell className="h-4 w-4" />
          {overview?.workouts_this_week || 0} workouts this week
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BarChart
          title="Weekly workout summary"
          subtitle="Completed workouts across the last seven days."
          data={safeHistory}
          dataKey="workouts"
          color="#A64253"
          unit="workouts"
        />
        <LineChart
          title="Water intake chart"
          subtitle="Your daily hydration trend over the last seven days."
          data={safeHistory}
          dataKey="water_ml"
          color="#0FB1D2"
          unit="ml"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <NutritionSummary summary={summary} history={safeHistory} />
        <GoalCompletionChart overview={overview} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LineChart
          title="Progress trends"
          subtitle="Calories logged across your most recent seven days."
          data={safeHistory}
          dataKey="calories"
          color="#73ABA6"
          unit="kcal"
        />
        <RecommendationInsights analytics={analytics} />
      </div>
    </section>
  );
}
