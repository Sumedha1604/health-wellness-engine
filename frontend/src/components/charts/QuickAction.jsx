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
    <section className="wellness-card p-6 sm:p-8">
      <p className="wellness-eyebrow">Keep moving</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">Quick actions</h2>
      <p className="mt-1 text-sm text-[#6b8582]">Shortcuts for your daily wellness routine.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ title, description, icon: Icon, route }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(route)}
            className="
              flex flex-col items-start gap-3
              bg-white rounded-2xl p-5
              border border-wellness-teal/10
              text-left
              cursor-pointer
              transition-all duration-200
              hover:bg-wellness-mist hover:-translate-y-1 hover:shadow-card
            "
          >
            <span className="flex items-center justify-center rounded-xl bg-[#e1f8fd] p-3">
              <Icon className="h-5 w-5 text-wellness-aqua" strokeWidth={2} />
            </span>
            <div>
              <p className="font-semibold text-wellness-slate">{title}</p>
              <p className="mt-0.5 text-sm text-[#6b8582]">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
