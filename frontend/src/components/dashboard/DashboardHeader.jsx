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
      <div className="bg-white rounded-3xl shadow-card p-8 flex items-center justify-between">
  
        <div>
  
          <h1 className="text-4xl font-bold">
            {greeting}, {user?.first_name}
          </h1>
  
          <p className="text-gray-500 mt-2">
            Welcome back! Here's your wellness overview.
          </p>
  
        </div>
  
        <div className="text-right">
  
          <p className="text-gray-400 text-sm">
            Today
          </p>
  
          <h2 className="text-xl font-semibold">
            {today}
          </h2>
  
        </div>
  
      </div>
    );
  }