export default function StatCard({
  title,
  value,
  unit,
  icon,
}) {
  const formattedValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value
        : Number(value.toFixed(1))
      : value;

  return (
    <div
      className="
        bg-white
        rounded-3xl
        p-6
        shadow-card
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <div className="flex items-end gap-2 mt-4">
            <h2 className="text-4xl font-bold">
              {formattedValue}
            </h2>

            <span className="text-gray-400 mb-1">
              {unit}
            </span>
          </div>
        </div>

        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-green-100
            flex
            items-center
            justify-center
            text-green-600
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}