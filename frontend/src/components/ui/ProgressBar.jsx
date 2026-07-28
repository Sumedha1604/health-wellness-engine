export default function ProgressBar({
  value = 0,
  color = "bg-wellness-aqua",
  className = "",
  label,
}) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#6b8582]">
          <span>{label}</span>
          <span>{Math.round(safeValue)}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-[#edf3ef]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
