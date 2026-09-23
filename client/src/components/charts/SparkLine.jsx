import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function SparkLine({ data = [], color = "#818CF8", height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}