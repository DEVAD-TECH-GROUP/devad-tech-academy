import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyLiveClasses,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  startLiveClass,
  endLiveClass,
  getLiveClassAttendance,
} from "../../services/instructor/liveClassService";
import { getMyCourses } from "../../services/instructor/courseService";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate, formatTime } from "../../utils/formatDate";
import { toast } from "react-hot-toast";

// Initial DEVAD LiveKit prototype capacity.
// This includes the instructor and students.
const LIVEKIT_MAX_PARTICIPANTS = 2;

const unwrap = (response) =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];

const emptyForm = {
  title: "",
  description: "",
  course: "",
  scheduledAt: "",
  duration: 120,
  maxParticipants: LIVEKIT_MAX_PARTICIPANTS,
  isRecorded: false,
};

export default function LiveClasses() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [classResponse, courseResponse] = await Promise.all([
        getMyLiveClasses({ limit: 100 }),
        getMyCourses(),
      ]);

      const classData = unwrap(classResponse);
      const courseData = unwrap(courseResponse);

      setClasses(
        Array.isArray(classData)
          ? classData
          : Array.isArray(classData?.results)
            ? classData.results
            : [],
      );

      setCourses(
        Array.isArray(courseData)
          ? courseData
          : Array.isArray(courseData?.results)
            ? courseData.results
            : [],
      );
    } catch (error) {
      console.error("Live classes loading error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load live classes",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
      course: courses[0]?._id || "",
    });

    setShowForm(true);
  };

  const openEdit = (liveClass) => {
    setEditing(liveClass);

    setForm({
      title: liveClass.title || "",
      description: liveClass.description || "",
      course: liveClass.course?._id || liveClass.course || "",
      scheduledAt: liveClass.scheduledAt
        ? new Date(liveClass.scheduledAt).toISOString().slice(0, 16)
        : "",
      duration: liveClass.duration || 120,
      maxParticipants: LIVEKIT_MAX_PARTICIPANTS,
      isRecorded: false,
    });

    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.course || !form.scheduledAt) {
      toast.error("Title, course and date are required");
      return;
    }

    const duration = Number(form.duration);

    if (!Number.isFinite(duration) || duration < 1) {
      toast.error("Duration must be at least one minute");
      return;
    }

    if (new Date(form.scheduledAt).getTime() <= Date.now()) {
      toast.error("Please select a future date and time");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        course: form.course,
        duration,
        maxParticipants: LIVEKIT_MAX_PARTICIPANTS,
        isRecorded: false,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      };

      if (editing) {
        await updateLiveClass(editing._id, payload);
        toast.success("Live class updated");
      } else {
        await createLiveClass(payload);
        toast.success("Live class scheduled");
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error("Save live class error:", error);

      toast.error(
        error?.response?.data?.message || "Could not save live class",
      );
    } finally {
      setSaving(false);
    }
  };

  // Start the class and enter the DEVAD LiveKit classroom.
  const handleStart = async (liveClass) => {
    setBusyId(liveClass._id);

    try {
      const response = await startLiveClass(liveClass._id);
      const result = unwrap(response);

      const serverUrl = result?.serverUrl;
      const roomName = result?.roomName;
      const token = result?.token;

      if (!serverUrl || !roomName || !token) {
        console.error("Unexpected LiveKit start response:", result);

        toast.error(
          "The server did not return all the LiveKit classroom credentials.",
        );

        return;
      }

      toast.success("Class started. Opening DEVAD Classroom...");

      navigate(`/instructor/live-classes/${liveClass._id}/classroom`, {
        state: {
          serverUrl,
          roomName,
          token,
          liveClass: result?.liveClass || liveClass,
        },
      });
    } catch (error) {
      console.error("Start LiveKit class error:", error);

      toast.error(
        error?.response?.data?.message || "Could not start live class",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleEnd = async (liveClass) => {
    if (
      !window.confirm(
        `End "${liveClass.title}" and disconnect everyone from the classroom?`,
      )
    ) {
      return;
    }

    setBusyId(liveClass._id);

    try {
      await endLiveClass(liveClass._id);

      toast.success("Live class ended");

      await loadData();
    } catch (error) {
      console.error("End live class error:", error);

      toast.error(error?.response?.data?.message || "Could not end the class");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (liveClass) => {
    if (!window.confirm(`Delete "${liveClass.title}"?`)) return;

    setBusyId(liveClass._id);

    try {
      await deleteLiveClass(liveClass._id);

      setClasses((current) =>
        current.filter((item) => item._id !== liveClass._id),
      );

      toast.success("Live class deleted");
    } catch (error) {
      console.error("Delete live class error:", error);

      toast.error(error?.response?.data?.message || "Could not delete class");
    } finally {
      setBusyId(null);
    }
  };

  const handleAttendance = async (liveClass) => {
    setBusyId(liveClass._id);

    try {
      const response = await getLiveClassAttendance(liveClass._id);
      const data = unwrap(response);

      setSelected(liveClass);
      setAttendance(Array.isArray(data) ? data : []);
      setShowAttendance(true);
    } catch (error) {
      console.error("Attendance loading error:", error);

      toast.error(
        error?.response?.data?.message || "Could not load attendance",
      );
    } finally {
      setBusyId(null);
    }
  };

  const statusVariant = (status) =>
    ({
      live: "green",
      scheduled: "blue",
      ended: "default",
    })[status] || "default";

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const liveCount = classes.filter((item) => item.status === "live").length;

  const upcomingCount = classes.filter(
    (item) => item.status === "scheduled",
  ).length;

  const endedCount = classes.filter((item) => item.status === "ended").length;

  return (
    <div className="space-y-5 fi">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="dsp text-xl font-bold text-text">Live Classes</h1>

          <p className="text-xs text-muted mt-1">
            Schedule classes, manage your DEVAD classrooms and monitor
            attendance.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl"
        >
          + Schedule Class
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Total classes", classes.length],
          ["Upcoming", upcomingCount],
          ["Live now", liveCount],
          ["Ended", endedCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-4"
          >
            <p className="text-xs text-muted">{label}</p>

            <p className="text-2xl font-bold text-text mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* CLASS LIST */}
      {classes.length === 0 ? (
        <EmptyState
          icon="📡"
          title="No live classes"
          message="Schedule your first live class."
          action={openCreate}
          actionLabel="Schedule Class"
        />
      ) : (
        <div className="space-y-3">
          {classes.map((liveClass) => {
            const isBusy = busyId === liveClass._id;

            return (
              <div
                key={liveClass._id}
                className="bg-surface border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-center flex-wrap">
                      <p className="text-sm font-semibold text-text">
                        {liveClass.title}
                      </p>

                      <Badge variant={statusVariant(liveClass.status)}>
                        {liveClass.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted mt-1">
                      {liveClass.course?.title || "Course"}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-muted mt-2">
                      {liveClass.scheduledAt && (
                        <span>
                          📅 {formatDate(liveClass.scheduledAt)} ·{" "}
                          {formatTime(liveClass.scheduledAt)}
                        </span>
                      )}

                      <span>⏱ {liveClass.duration} min</span>

                      <span>
                        👥{" "}
                        {liveClass.meetingRoom?.maxParticipants ||
                          liveClass.maxParticipants ||
                          LIVEKIT_MAX_PARTICIPANTS}{" "}
                        max
                      </span>

                      <span>🎥 Recording unavailable</span>
                    </div>

                    {liveClass.description && (
                      <p className="text-xs text-muted mt-2">
                        {liveClass.description}
                      </p>
                    )}

                    {liveClass.recording?.url && (
                      <a
                        href={liveClass.recording.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs text-orange underline mt-2"
                      >
                        View existing recording
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {liveClass.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => openEdit(liveClass)}
                          disabled={isBusy}
                          className="text-xs border border-border text-text px-3 py-2 rounded-xl disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleStart(liveClass)}
                          disabled={isBusy}
                          className="text-xs bg-green/10 text-green border border-green/20 px-3 py-2 rounded-xl disabled:opacity-50"
                        >
                          {isBusy ? "Starting..." : "Start Class"}
                        </button>

                        <button
                          onClick={() => handleDelete(liveClass)}
                          disabled={isBusy}
                          className="text-xs border border-red-500/30 text-red-500 px-3 py-2 rounded-xl disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {liveClass.status === "live" && (
                      <button
                        onClick={() => handleEnd(liveClass)}
                        disabled={isBusy}
                        className="text-xs bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-2 rounded-xl disabled:opacity-50"
                      >
                        {isBusy ? "Ending..." : "End Class"}
                      </button>
                    )}

                    <button
                      onClick={() => handleAttendance(liveClass)}
                      disabled={isBusy}
                      className="text-xs border border-border text-text px-3 py-2 rounded-xl disabled:opacity-50"
                    >
                      Attendance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => !saving && setShowForm(false)}
        title={editing ? "Edit Live Class" : "Schedule Live Class"}
        size="sm"
      >
        <div className="space-y-3">
          <Input
            label="Title *"
            value={form.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="e.g. React Hooks Deep Dive"
            required
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="What will students learn?"
          />

          <div>
            <label className="block text-xs text-muted mb-1">Course *</label>

            <select
              value={form.course}
              onChange={(event) => setField("course", event.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text"
              required
            >
              <option value="">Select course</option>

              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title || course.name || "Untitled course"}
                </option>
              ))}
            </select>

            {courses.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No courses were returned. Create or assign a course before
                scheduling a live class.
              </p>
            )}
          </div>

          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(event) => setField("scheduledAt", event.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              value={form.duration}
              onChange={(event) => setField("duration", event.target.value)}
              required
            />

            <div>
              <Input
                label="Maximum participants"
                type="number"
                value={LIVEKIT_MAX_PARTICIPANTS}
                disabled
                readOnly
              />

              <p className="text-[11px] text-muted mt-1">
                Initial prototype capacity.
              </p>
            </div>
          </div>

          {/* LIVEKIT CAPACITY NOTICE */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-orange/10 border border-orange/20">
            <span className="text-lg">👥</span>

            <div>
              <p className="text-xs font-semibold text-text">
                DEVAD classroom capacity: {LIVEKIT_MAX_PARTICIPANTS}
              </p>

              <p className="text-xs text-muted mt-1">
                This initial testing limit includes the instructor and students.
                We can increase it when we move beyond the prototype stage.
              </p>
            </div>
          </div>

          {/* RECORDING NOTICE */}
          <div className="p-3 rounded-xl bg-surfaceHigh border border-border">
            <div className="flex items-center gap-2">
              <span>🎥</span>

              <p className="text-xs font-semibold text-text">
                Class recording is not enabled yet
              </p>
            </div>

            <p className="text-xs text-muted mt-1">
              LiveKit recording requires a separate Egress configuration. Your
              live classroom can work without it.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || courses.length === 0}
              className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Schedule"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ATTENDANCE MODAL */}
      <Modal
        isOpen={showAttendance}
        onClose={() => setShowAttendance(false)}
        title={`Attendance${selected ? ` — ${selected.title}` : ""}`}
        size="lg"
      >
        <div className="space-y-3">
          {attendance.length === 0 ? (
            <p className="text-sm text-muted py-5 text-center">
              No attendance records were found for this class.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-border">
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-border/60 text-text"
                    >
                      <td className="py-3 pr-3">
                        {[item.student?.firstName, item.student?.lastName]
                          .filter(Boolean)
                          .join(" ") || "Student"}
                      </td>

                      <td className="py-3 pr-3">
                        {item.student?.email || "—"}
                      </td>

                      <td className="py-3 pr-3">
                        {item.status || "registered"}
                      </td>

                      <td className="py-3">{item.duration || 0} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
