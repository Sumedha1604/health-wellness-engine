import { Sparkles } from "lucide-react";


export default function NutritionScoreCard({ score }) {

    let message = "Excellent nutrition balance today.";
    let stars = "★★★★★";
  
    if (score < 80) {
      message = "Good progress. There's still room for improvement.";
      stars = "★★★★☆";
    }
  
    if (score < 60) {
      message = "Focus on improving today's nutrition.";
      stars = "★★★☆☆";
    }
  
    return (
      <div
        className="
          wellness-card
          p-6 sm:p-8
        "
      >
        <div className="flex items-center justify-between">
  
          <div>
  
            <p className="wellness-eyebrow">
              Nutrition Score
            </p>
  
            <h2 className="text-5xl font-bold mt-3 text-wellness-slate">
              {score}
              <span className="text-2xl text-gray-400">
                /100
              </span>
            </h2>
  
            <p className="text-wellness-aqua font-semibold mt-4">
              {stars}
            </p>
  
            <p className="text-[#6b8582] mt-2">
              {message}
            </p>
  
          </div>
  
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f7eaec]">
            <Sparkles className="h-7 w-7 text-wellness-mauve" />
          </span>
  
        </div>
      </div>
    );
  }
