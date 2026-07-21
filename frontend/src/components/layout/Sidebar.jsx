import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Heart,
} from "lucide-react";
const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Meal Plans", path: "/meal-plans", icon: UtensilsCrossed },
  { name: "Exercises", path: "/exercises", icon: Dumbbell },
  { name: "Recommendations", path: "/recommendations", icon: Sparkles },
  { name: "Favorites", path: "/favorites", icon: Heart },
];
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`
      h-screen
      bg-white
      border-r
      border-gray-100
      flex
      flex-col
      transition-all
      duration-300
      ${collapsed ? "w-24" : "w-72"}
      `}
    >
      <div className="flex items-center justify-between p-6">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold">
              Nourish
            </h1>
            <p className="text-sm text-muted">
              Wellness Engine
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
      <nav className="flex-1 px-4">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4
                px-4
                py-3
                mb-2
                rounded-xl
                transition-all
                duration-300
                ${
                  isActive
                    ? "bg-primary font-semibold shadow-card"
                    : "hover:bg-gray-100"
                }
                `
              }
            >
              <Icon size={20} />
              {!collapsed && (
                <span>{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}