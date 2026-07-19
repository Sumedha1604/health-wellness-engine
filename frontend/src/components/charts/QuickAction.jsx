import { useNavigate } from "react-router-dom";
import { ClipboardList, Sparkles, Heart, Settings } from "lucide-react";

const actions = [
  {
    title: "Meal Plans",
    description: "Browse and log your meals",
    icon: ClipboardList,
    route: "/meal-plans",
  },
  {
    title: "Recommendations",
    description: "View today's AI insights",
    icon: Sparkles,
    route: "/recommendations",
  },
  {
    title: "Favorites",
    description: "Your saved meals",
    icon: Heart,
    route: "/favorites",
  },
  {
    title: "Preferences",
    description: "Update your health profile",
    icon: Settings,
    route: "/preferences",
  },
];

export default function QuickAction() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
        Quick Actions
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Frequently used shortcuts
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ title, description, icon: Icon, route }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(route)}
            className="
              flex flex-col items-start gap-3
              bg-white rounded-2xl p-5
              border border-gray-100
              shadow-sm
              text-left
              cursor-pointer
              transition-all duration-200
              hover:bg-green-50 hover:-translate-y-1 hover:shadow-lg
            "
          >
            <span className="flex items-center justify-center rounded-xl bg-green-100 p-3">
              <Icon className="h-5 w-5 text-green-600" strokeWidth={2} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}