import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PieChart({ data = [], height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
          paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || "#818CF8"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#16161F", border: "1px solid #2A2A3A", borderRadius: 12, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#6B6B8A" }} />
      </RePieChart>
    </ResponsiveContainer>
  );
}