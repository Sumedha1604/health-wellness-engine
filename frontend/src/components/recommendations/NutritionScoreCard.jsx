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
          bg-white
          rounded-3xl
          shadow-card
          p-8
        "
      >
        <div className="flex items-center justify-between">
  
          <div>
  
            <p className="text-gray-500 font-medium">
              Nutrition Score
            </p>
  
            <h2 className="text-5xl font-bold mt-3">
              {score}
              <span className="text-2xl text-gray-400">
                /100
              </span>
            </h2>
  
            <p className="text-green-600 font-semibold mt-4">
              {stars}
            </p>
  
            <p className="text-gray-500 mt-2">
              {message}
            </p>
  
          </div>
  
          <div className="text-6xl">
            🤖
          </div>
  
        </div>
      </div>
    );
  }