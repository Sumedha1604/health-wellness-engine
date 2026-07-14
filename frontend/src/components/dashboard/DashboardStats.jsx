import {
    Flame,
    Beef,
    Wheat,
    Droplets,
  } from "lucide-react";
  
  import StatCard from "../charts/StatCard";
  
  export default function DashboardStats({ summary }) {
  
    const stats = [
      {
        title: "Calories",
        value: summary?.total_calories ?? 0,
        unit: "kcal",
        icon: <Flame size={20} />,
      },
      {
        title: "Protein",
        value: summary?.total_protein ?? 0,
        unit: "g",
        icon: <Beef size={20} />,
      },
      {
        title: "Carbs",
        value: summary?.total_carbohydrates ?? 0,
        unit: "g",
        icon: <Wheat size={20} />,
      },
      {
        title: "Fat",
        value: summary?.total_fat ?? 0,
        unit: "g",
        icon: <Droplets size={20} />,
      },
    ];
  
    return (
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            unit={stat.unit}
            icon={stat.icon}
          />
        ))}
      </div>
    );
  }