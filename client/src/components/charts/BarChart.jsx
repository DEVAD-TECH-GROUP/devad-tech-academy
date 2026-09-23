import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BarChart({ data = [], xKey = "name", bars = [], height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
        <XAxis dataKey={xKey} tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#16161F", border: "1px solid #2A2A3A", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#E8E8F0" }}
        />
        {bars.map(({ key, color = "#818CF8", name }) => (
          <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} name={name || key} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}