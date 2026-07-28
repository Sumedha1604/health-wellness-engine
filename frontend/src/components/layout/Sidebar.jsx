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
  Leaf,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
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
        fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-white/10 bg-wellness-slate text-white shadow-2xl transition-all duration-300
        md:sticky md:top-0 md:z-0 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-24" : "md:w-72"}
        w-72
        `}
      >
      <div className="flex items-center justify-between p-5">
        <div className={`flex items-center gap-3 ${collapsed ? "md:justify-center" : ""}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-wellness-aqua text-white shadow-glow">
            <Leaf size={22} />
          </span>
          <div className={collapsed ? "md:hidden" : ""}>
            <h1 className="text-xl font-bold tracking-tight">Nourish</h1>
            <p className="text-xs font-medium text-white/55">Wellness Engine</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 md:hidden"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 md:flex"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 px-3 pt-3">
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
                rounded-2xl
                transition-all
                duration-300
                ${
                  isActive
                    ? "bg-wellness-aqua text-white font-semibold shadow-glow"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
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

      <div className={`m-3 rounded-2xl border border-white/10 bg-white/[.07] p-3 ${collapsed ? "md:p-2" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wellness-teal/30 text-white">
            {user?.first_name ? user.first_name.charAt(0) : <UserRound size={18} />}
          </span>
          <div className={collapsed ? "md:hidden" : "min-w-0"}>
            <p className="truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
            <p className="truncate text-xs text-white/55">Your wellness space</p>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
