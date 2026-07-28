import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function LineChart({
  title,
  subtitle,
  data,
  dataKey,
  color = "#73ABA6",
  unit = "",
}) {

  return (
    <div className="h-[310px] rounded-3xl bg-white p-5 shadow-card sm:h-[340px] sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {subtitle}
      </p>

      <ResponsiveContainer width="100%" height="78%" className="mt-3">
        <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${dataKey}Fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E1ECEA" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B8582", fontSize: 12 }}
            tickFormatter={(value) => value.slice(5)}
          />
          <Tooltip
            formatter={(value) => [`${value} ${unit}`, title]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #E1ECEA" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            fill={`url(#${dataKey}Fill)`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

}
