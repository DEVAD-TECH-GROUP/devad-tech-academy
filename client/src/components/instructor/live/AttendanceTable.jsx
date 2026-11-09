import Avatar from "../../common/Avatar";
import Badge from "../../common/Badge";
import { formatTime } from "../../../utils/formatDate";

export default function AttendanceTable({ attendance = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Student", "Joined At", "Status"].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-semibold text-muted py-3 px-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-muted text-xs py-8">
                No attendance records
              </td>
            </tr>
          ) : (
            attendance.map((a) => (
              <tr key={a._id} className="border-b border-border/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar user={a.student} size="sm" />
                    <span className="text-xs text-text">
                      {a.student?.firstName} {a.student?.lastName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-muted">
                  {a.joinedAt ? formatTime(a.joinedAt) : "—"}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={a.attended ? "green" : "default"} size="xs">
                    {a.attended ? "Attended" : "Absent"}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
