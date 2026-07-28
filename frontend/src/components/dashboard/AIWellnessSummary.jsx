import { Lightbulb, Sparkles, Target } from "lucide-react";


export default function AIWellnessSummary({ summary }) {

  if (!summary) {
    return (
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-card">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="mt-6 h-4 w-full rounded bg-gray-100" />
        <div className="mt-3 h-4 w-4/5 rounded bg-gray-100" />
      </div>
    );
  }


  const progress = summary.progress?.completion_percentage || 0;


  return (
    <div className="wellness-card p-6 sm:p-8">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="wellness-eyebrow">Your guided next step</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-wellness-slate">
            AI Wellness Summary
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Today&apos;s progress for your {summary.progress?.fitness_goal || "wellness"} goal.
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7eaec]">
          <Sparkles className="h-5 w-5 text-wellness-mauve" />
        </span>

      </div>


      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-bold tracking-tight text-wellness-slate">
            {progress}%
          </p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Daily progress
          </p>
        </div>

        <span className="rounded-full bg-[#f7eaec] px-3 py-1.5 text-sm font-semibold text-wellness-mauve">
          {summary.exercises_completed} workout{summary.exercises_completed === 1 ? "" : "s"}
        </span>
      </div>


      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#f7eaec]">
        <div
          className="h-full rounded-full bg-wellness-mauve transition-all duration-500"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>


      <div className="mt-6 rounded-2xl bg-[#f7eaec] p-4">
        <div className="flex gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-wellness-mauve" />
          <div>
            <p className="text-sm font-semibold text-wellness-slate">
              Today&apos;s insight
            </p>
            <p className="mt-1 text-sm leading-6 text-wellness-slate">
              {summary.insights}
            </p>
          </div>
        </div>
      </div>


      <div className="mt-4 flex gap-3 rounded-2xl border border-gray-100 p-4">
        <Target className="mt-0.5 h-5 w-5 shrink-0 text-wellness-aqua" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Suggested action
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {summary.suggested_action}
          </p>
        </div>
      </div>

    </div>
  );
}
