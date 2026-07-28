export default function CircularProgress({
  value = 0,
  label = "complete",
  size = "h-28 w-28",
  color = "#0FB1D2",
}) {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full p-2 ${size}`}
      style={{ background: `conic-gradient(${color} ${percentage}%, #EAF1F0 0)` }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <span className="text-2xl font-bold tracking-tight text-wellness-slate">{Math.round(percentage)}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-wellness-teal">{label}</span>
      </div>
    </div>
  );
}
