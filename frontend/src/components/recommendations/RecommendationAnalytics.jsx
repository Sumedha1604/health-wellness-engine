import {
  CheckCircle2,
  Eye,
  Heart,
  History,
  ThumbsDown,
} from "lucide-react";


const eventLabels = {
  view: "Viewed a recommendation",
  accept: "Accepted a recommendation",
  reject: "Skipped a recommendation",
  favourite: "Added a favourite",
};


export default function RecommendationAnalytics({ analytics }) {
  if (!analytics) {
    return null;
  }

  const metrics = [
    {
      label: "Recommendations viewed",
      value: analytics.total_recommendations_viewed,
      icon: Eye,
      color: "text-wellness-aqua bg-[#e1f8fd]",
    },
    {
      label: "Accepted",
      value: analytics.accepted_recommendations,
      icon: CheckCircle2,
      color: "text-wellness-teal bg-[#e6f4f2]",
    },
    {
      label: "Favourites",
      value: analytics.favourite_recommendations,
      icon: Heart,
      color: "text-wellness-mauve bg-[#f7eaec]",
    },
    {
      label: "Skipped",
      value: analytics.rejected_recommendations,
      icon: ThumbsDown,
      color: "text-amber-700 bg-wellness-cream",
    },
  ];

  return (
    <section className="wellness-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="wellness-eyebrow">Your activity</p>
          <h2 className="mt-1 text-2xl font-semibold text-wellness-slate">
            Recommendation analytics
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            A clear view of how you engage with your personalized suggestions.
          </p>
        </div>
        <History className="h-6 w-6 text-wellness-aqua" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-wellness-teal/10 bg-white p-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-bold text-wellness-slate">{value || 0}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-wellness-slate">Top exercise categories</h3>
          {analytics.most_recommended_exercise_categories?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {analytics.most_recommended_exercise_categories.map((item) => (
                <span
                  key={item.category}
                  className="rounded-full bg-wellness-mist px-3 py-1.5 text-sm font-medium text-wellness-teal"
                >
                  {item.category} · {item.recommendation_count}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Your category trends will appear as you interact with exercise recommendations.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-wellness-slate">Interaction history</h3>
          {analytics.interaction_history?.length ? (
            <ul className="mt-2 divide-y divide-wellness-teal/10">
              {analytics.interaction_history.slice(0, 4).map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-slate-600">
                    {eventLabels[event.event_type] || "Updated a recommendation"}
                  </span>
                  <span className="text-xs text-slate-400">
                    #{event.recommendation_id}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Your recent recommendation interactions will appear here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
