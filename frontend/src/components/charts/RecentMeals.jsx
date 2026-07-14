export default function RecentMeals() {

    const meals = [
      "Oatmeal & Berries",
      "Grilled Chicken Salad",
      "Greek Yogurt",
      "Brown Rice Bowl",
    ];
  
    return (
      <div className="bg-white rounded-3xl shadow-card p-6">
  
        <h2 className="text-xl font-semibold mb-6">
          Recent Meals
        </h2>
  
        <div className="space-y-4">
  
          {meals.map((meal) => (
  
            <div
              key={meal}
              className="p-4 rounded-xl bg-gray-50 hover:bg-primary transition"
            >
              {meal}
            </div>
  
          ))}
  
        </div>
  
      </div>
    );
  }