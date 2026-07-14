import {
    Routes,
    Route,
  } from "react-router-dom";
  
  import Dashboard from "../pages/Dashboard";
  import MealPlans from "../pages/MealPlans";
  import Recommendations from "../pages/Recommendations";
  import Favorites from "../pages/Favorites";
  import Preferences from "../pages/Preferences";
  import Profile from "../pages/Profile";
  import Login from "../pages/Login";
  import Register from "../pages/Register";
  import NotFound from "../pages/NotFound";
  
  export default function AppRoutes() {
    return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
  
        <Route path="/meal-plans" element={<MealPlans />} />
  
        <Route
          path="/recommendations"
          element={<Recommendations />}
        />
  
        <Route
          path="/favorites"
          element={<Favorites />}
        />
  
        <Route
          path="/preferences"
          element={<Preferences />}
        />
  
        <Route
          path="/profile"
          element={<Profile />}
        />
  
        <Route
          path="/login"
          element={<Login />}
        />
  
        <Route
          path="/register"
          element={<Register />}
        />
  
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    );
  }