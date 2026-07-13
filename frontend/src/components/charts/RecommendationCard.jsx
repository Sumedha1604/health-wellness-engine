export default function RecommendationCard() {

    return (
  
      <div
        className="
        bg-white
        rounded-3xl
        p-8
        shadow-card
        h-[320px]
        "
      >
  
        <h2 className="text-2xl font-semibold">
  
          Today's AI Recommendation
  
        </h2>
  
        <div className="mt-8 space-y-4">
  
          <p className="text-muted">
  
            Increase today's protein intake by 20g.
  
          </p>
  
          <p className="text-muted">
  
            Drink one more litre of water before dinner.
  
          </p>
  
          <p className="text-muted">
  
            A 30 minute walk will complete your activity goal.
  
          </p>
  
        </div>
  
      </div>
  
    );
  
  }