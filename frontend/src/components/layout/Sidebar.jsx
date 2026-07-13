import {
    LayoutDashboard,
    UtensilsCrossed,
    Sparkles,
    Heart,
    SlidersHorizontal,
    User,
  } from "lucide-react";
  
  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Meal Plans",
      icon: UtensilsCrossed,
    },
    {
      name: "Recommendations",
      icon: Sparkles,
    },
    {
      name: "Favorites",
      icon: Heart,
    },
    {
      name: "Preferences",
      icon: SlidersHorizontal,
    },
    {
      name: "Profile",
      icon: User,
    },
  ];
  
  export default function Sidebar() {
    return (
      <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col px-6 py-8">
  
        <div className="mb-12">
          <h1 className="text-2xl font-bold">
            Nourish
          </h1>
  
          <p className="text-sm text-muted mt-1">
            Wellness Engine
          </p>
        </div>
  
        <nav className="flex flex-col gap-2">
  
          {menu.map((item) => {
  
            const Icon = item.icon;
  
            return (
  
              <button
                key={item.name}
                className="
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3
                  transition-all
                  duration-300
                  hover:bg-primary
                "
              >
  
                <Icon size={20} />
  
                <span className="font-medium">
                  {item.name}
                </span>
  
              </button>
  
            );
  
          })}
  
        </nav>
  
      </aside>
    );
  }