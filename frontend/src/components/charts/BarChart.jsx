import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import ChartContainer from "../ui/ChartContainer";

export default function BarChart({
  title,
  subtitle,
  data,
  dataKey,
  color = "#A64253",
  unit = "",
}) {

  return (
    <ChartContainer title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
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
            contentStyle={{ borderRadius: "14px", border: "1px solid #E1ECEA", boxShadow: "0 12px 28px rgba(57,86,86,.12)" }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

}
