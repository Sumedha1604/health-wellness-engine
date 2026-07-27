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
  Bot,
  ChartNoAxesCombined,
  CalendarCheck2,
  X,
} from "lucide-react";
const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Meal Plans", path: "/meal-plans", icon: UtensilsCrossed },
  { name: "Exercises", path: "/exercises", icon: Dumbbell },
  { name: "Recommendations", path: "/recommendations", icon: Sparkles },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
  { name: "Progress", path: "/progress", icon: ChartNoAxesCombined },
  { name: "Workout Plans", path: "/workout-plans", icon: CalendarCheck2 },
  { name: "Favorites", path: "/favorites", icon: Heart },
];
export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-gray-900/30 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300
        md:sticky md:top-0 md:z-0 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-24" : "md:w-72"}
        w-72
        `}
      >
      <div className="flex items-center justify-between p-6">
        <div className={collapsed ? "md:hidden" : ""}>
          <h1 className="text-2xl font-bold">
            Nourish
          </h1>
          <p className="text-sm text-muted">
            Wellness Engine
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 md:hidden"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-gray-100 md:flex"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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
              onClick={onClose}
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
    </>
  );
}
