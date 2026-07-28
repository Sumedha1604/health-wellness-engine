import { Leaf, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ user }) {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="wellness-eyebrow">{today}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-wellness-slate sm:text-4xl">
            {greeting}, {user?.first_name || "there"}! 👋
          </h1>
          <p className="mt-1 text-base text-[#6b8582] sm:text-lg">
            Here&apos;s your wellness overview for today.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-wellness-teal/20 bg-white/80 px-4 py-2 text-sm font-semibold text-wellness-slate shadow-card">
          {today}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-wellness border border-[#cce8e5] bg-gradient-to-r from-[#edf9f8] via-[#e5f5f3] to-[#dff2ef] p-5 shadow-card sm:p-8">
        <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border-[22px] border-wellness-teal/15" />
        <div className="absolute -bottom-12 right-28 h-28 w-28 rounded-full border-[14px] border-wellness-aqua/10" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-wellness-slate text-white shadow-card">
              <Leaf className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-wellness-slate sm:text-2xl">Every healthy choice counts 🌿</h2>
              <p className="mt-2 max-w-xl leading-6 text-[#395656]/80">Stay consistent with your habits and keep moving toward your wellness goals.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/exercises")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-wellness-slate px-5 py-3.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-[#2e4747]">
            <Plus size={18} /> Log Your Progress
          </button>
        </div>
      </div>
    </div>
  );
}
