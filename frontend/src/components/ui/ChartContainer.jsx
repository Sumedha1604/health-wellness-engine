export default function ChartContainer({ title, subtitle, children, action }) {
  return (
    <section className="wellness-card h-[310px] p-5 sm:h-[340px] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-wellness-slate sm:text-xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-[#6b8582]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-3 h-[78%]">{children}</div>
    </section>
  );
}
