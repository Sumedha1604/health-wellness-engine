import { useEffect, useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
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

    <DashboardHeader user={dashboard.user} />

    <DashboardStats summary={summary} />

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