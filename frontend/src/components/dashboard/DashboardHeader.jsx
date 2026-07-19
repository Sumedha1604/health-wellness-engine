export default function DashboardHeader({ user }) {
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white shadow-lg">

      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5"></div>

      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

        <div>
          <p className="text-sm uppercase tracking-widest text-green-100">
            Wellness Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {greeting}, {user?.first_name}! 👋
          </h1>

          <p className="mt-3 max-w-xl text-green-100">
            Welcome back! Stay consistent with your healthy habits and
            keep moving toward your wellness goals.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
          <p className="text-sm text-green-100">
            Today
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {today}
          </h2>

          <p className="mt-2 text-sm text-green-100">
            Every healthy choice counts 💚
          </p>
        </div>

      </div>
    </div>
  );
}