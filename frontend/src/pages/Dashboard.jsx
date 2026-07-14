import { useEffect, useState } from "react";

import StatCard from "../components/charts/StatCard";
import WeeklyChart from "../components/charts/WeeklyChart";
import RecentMeals from "../components/charts/RecentMeals";
import RecommendationCard from "../components/charts/RecommendationCard";
import QuickAction from "../components/charts/QuickAction";

import {
  getDashboard,
  getTodaySummary,
} from "../services/dashboard.service";

export default function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadDashboard() {

      try {

        const dashboardData =
          await getDashboard();

        const todayData =
          await getTodaySummary();

        setDashboard(dashboardData);

        setSummary(todayData);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    loadDashboard();

  }, []);

  if (loading) {

    return <h2>Loading Dashboard...</h2>;

  }

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">

          Good Morning, {dashboard.user.first_name}

        </h1>

        <p className="text-muted mt-2">

          Welcome back to your wellness dashboard.

        </p>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <StatCard
          title="Calories"
          value={summary.total_calories}
          unit="kcal"
        />

        <StatCard
          title="Protein"
          value={summary.total_protein}
          unit="g"
        />

        <StatCard
          title="Carbs"
          value={summary.total_carbohydrates}
          unit="g"
        />

        <StatCard
          title="Fat"
          value={summary.total_fat}
          unit="g"
        />

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