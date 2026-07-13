export default function StatCard({

    title,
    value,
    unit,
  
  }) {
  
    return (
  
      <div
        className="
        bg-white
        rounded-3xl
        p-6
        shadow-card
        hover:shadow-hover
        transition-all
        duration-300
        hover:-translate-y-1
        "
      >
  
        <p className="text-muted text-sm font-medium">
  
          {title}
  
        </p>
  
        <div className="mt-4 flex items-end gap-2">
  
          <h2 className="text-5xl font-bold">
  
            {value}
  
          </h2>
  
          <span className="text-muted text-lg mb-2">
  
            {unit}
  
          </span>
  
        </div>
  
      </div>
  
    );
  
  }