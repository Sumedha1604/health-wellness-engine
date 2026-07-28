export default function StatCard({
  title,
  value,
  unit,
  icon,
  progress = 0,
  tone = "bg-wellness-mist",
  progressColor = "bg-wellness-teal",
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
        wellness-card
        p-6
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b8582]">
            {title}
          </p>

          <div className="flex items-end gap-2 mt-4">
            <h2 className="text-4xl font-bold tracking-tight text-wellness-slate">
              {formattedValue}
            </h2>

            <span className="mb-1 text-wellness-teal">
              {unit}
            </span>
          </div>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#edf3ef]">
        <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
      <p className="mt-2 text-xs font-medium text-[#6b8582]">{Math.round(progress)}% of daily goal</p>
    </div>
  );
}
