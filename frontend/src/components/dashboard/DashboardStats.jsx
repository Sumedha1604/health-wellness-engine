import {
    Flame,
    Beef,
    Wheat,
    Droplets,
  } from "lucide-react";
  
  import StatCard from "../charts/StatCard";
  
  export default function DashboardStats({ summary, water, fitnessGoal }) {

    const calorieGoal = fitnessGoal === "Muscle Gain" ? 2800 :
      fitnessGoal === "Weight Loss" ? 1800 : 2200;
  
    const stats = [
      {
        title: "Calories",
        value: summary?.total_calories ?? 0,
      unit: "kcal",
      icon: <Flame size={20} />,
      progress: (summary?.total_calories ?? 0) / calorieGoal * 100,
      tone: "bg-[#e1f8fd] text-wellness-aqua",
      progressColor: "bg-wellness-aqua",
    },
    {
      title: "Water Intake",
      value: water?.consumed ?? 0,
      unit: "ml",
      icon: <Droplets size={20} />,
      progress: water?.percentage ?? 0,
      tone: "bg-[#e8f7fc] text-[#1686bd]",
      progressColor: "bg-[#1686bd]",
      },
      {
        title: "Protein",
        value: summary?.total_protein ?? 0,
        unit: "g",
        icon: <Beef size={20} />,
        progress: (summary?.total_protein ?? 0) / (fitnessGoal === "Muscle Gain" ? 120 : 80) * 100,
        tone: "bg-[#f7eaec] text-wellness-mauve",
        progressColor: "bg-wellness-mauve",
      },
      {
        title: "Carbs",
        value: summary?.total_carbohydrates ?? 0,
        unit: "g",
        icon: <Wheat size={20} />,
        progress: (summary?.total_carbohydrates ?? 0) / 250 * 100,
        tone: "bg-wellness-mist text-wellness-teal",
        progressColor: "bg-wellness-teal",
      },
      {
        title: "Fat",
        value: summary?.total_fat ?? 0,
        unit: "g",
        icon: <Droplets size={20} />,
        progress: (summary?.total_fat ?? 0) / 70 * 100,
        tone: "bg-wellness-cream text-wellness-slate",
        progressColor: "bg-wellness-teal",
      },
    ];
  
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            unit={stat.unit}
            icon={stat.icon}
            progress={stat.progress}
            tone={stat.tone}
            progressColor={stat.progressColor}
          />
        ))}
      </div>
    );
  }
