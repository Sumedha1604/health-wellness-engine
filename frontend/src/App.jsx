import { useLocation } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import AppRoutes from "./routes";

export default function App() {
  const location = useLocation();

  const authRoutes = ["/login", "/register"];

  if (authRoutes.includes(location.pathname)) {
    return <AppRoutes />;
  }

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}