import { useEffect, useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
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
        const dashboardData = await getDashboard();
        const todayData = await getTodaySummary();

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

  if (!dashboard) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold">Unable to load dashboard</h2>
        <p className="mt-2 text-gray-600">
          You may not be logged in, or the server returned an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader user={dashboard.user} />

      <DashboardStats summary={summary} />

      <div className="grid grid-cols-2 gap-6">
        <WeeklyChart />
        <RecommendationCard summary={summary} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RecentMeals />
        <QuickAction />
      </div>
    </div>
  );
}