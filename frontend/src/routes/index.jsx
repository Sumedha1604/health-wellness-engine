import {
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import MealPlans from "../pages/MealPlans";
import Recommendations from "../pages/Recommendations";
import Favorites from "../pages/Favorites";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Exercises from "../pages/Exercises";
import AIAssistant from "../pages/AIAssistant";
import Progress from "../pages/Progress";
import WorkoutPlans from "../pages/WorkoutPlans";

export default function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meal-plans"
        element={
          <ProtectedRoute>
            <MealPlans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <AIAssistant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans"
        element={
          <ProtectedRoute>
            <WorkoutPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}
