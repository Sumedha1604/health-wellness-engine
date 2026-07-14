import StatCard from "../components/charts/StatCard";
import WeeklyChart from "../components/charts/WeeklyChart";
import RecentMeals from "../components/charts/RecentMeals";
import RecommendationCard from "../components/charts/RecommendationCard";
import QuickAction from "../components/charts/QuickAction";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Good Evening, Sumedha
        </h1>

        <p className="text-muted mt-2">
          Keep up the great work! Here's today's overview.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">

        <StatCard title="Calories" value="1820" unit="kcal" />
        <StatCard title="Protein" value="126" unit="g" />
        <StatCard title="Water" value="2.1" unit="L" />
        <StatCard title="Streak" value="18" unit="days" />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <WeeklyChart />

        <RecommendationCard />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <RecentMeals />

        <QuickAction />

      </div>

    </div>
  );
}