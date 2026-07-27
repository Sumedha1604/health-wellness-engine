import { useEffect, useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import WaterIntake from "../components/dashboard/WaterIntake";
import ExerciseHistory from "../components/dashboard/ExerciseHistory";
import NutritionTracking from "../components/dashboard/NutritionTracking";
import AIWellnessSummary from "../components/dashboard/AIWellnessSummary";
import QuickProgress from "../components/dashboard/QuickProgress";
import WeeklyChart from "../components/charts/WeeklyChart";
import RecentMeals from "../components/charts/RecentMeals";
import RecommendationCard from "../components/charts/RecommendationCard";
import QuickAction from "../components/charts/QuickAction";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";

import {
  getDashboard,
  getTodaySummary,
  getWellnessSummary,
} from "../services/dashboard.service";

import {
  getRecommendations,
} from "../services/recommendation.service";


export default function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [summary, setSummary] = useState(null);

  const [recommendations, setRecommendations] = useState(null);

  const [wellnessSummary, setWellnessSummary] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadDashboard() {

      try {

        const dashboardData = await getDashboard();

        const todayData = await getTodaySummary();

        const recommendationData = await getRecommendations();

        const wellnessData = await getWellnessSummary();


        setDashboard(dashboardData);

        setSummary(todayData);

        setRecommendations(recommendationData);

        setWellnessSummary(wellnessData);


      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }


    loadDashboard();

  }, []);



  if (loading) {

    return <LoadingState message="Loading your dashboard..." />;

  }



  if (!dashboard) {

    return (

      <ErrorState
        title="Unable to load dashboard"
        message="Please check your connection and try again."
        onRetry={() => window.location.reload()}
      />

    );

  }



  return (

    <div className="space-y-8">

      <DashboardHeader user={dashboard.user} />


      <DashboardStats summary={summary} />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <WaterIntake />

        <ExerciseHistory />

      </div>


      <NutritionTracking />


      <AIWellnessSummary summary={wellnessSummary} />


      <QuickProgress />


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <WeeklyChart />

        <RecommendationCard
          summary={summary}
          recommendations={recommendations}
        />

      </div>


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <RecentMeals />

        <QuickAction />

      </div>


    </div>

  );

}
