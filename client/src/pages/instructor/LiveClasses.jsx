import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

// Initial DEVAD LiveKit prototype capacity (instructor + students).
const LIVEKIT_MAX_PARTICIPANTS = 2;
const REFRESH_MS = 20000;
const SOON_MS = 15 * 60 * 1000;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "scheduled", label: "Upcoming" },
  { key: "ended", label: "Ended" },
];

const unwrap = (response) =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];

const toList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

const emptyForm = {
  title: "",
  description: "",
  course: "",
  scheduledAt: "",
  duration: 120,
};

const toLocalInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const formatSpan = (ms) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const statusVariant = (status) =>
  ({ live: "green", scheduled: "blue", ended: "default" })[status] || "default";

function useNow(interval = 30000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return now;
}

/* ---------- Small components ---------- */

function StatCard({ label, value, icon, accent = "text-text" }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surfaceHigh border border-border flex items-center justify-center text-lg">
        {icon}
      </div>

      <div>
        <p className="text-[11px] text-muted">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${accent}`}>{value}</p>
      </div>
    </div>
  );
}

function LiveBanner({ liveClass, busy, onReturn, onEnd, now }) {
  const startedAt = liveClass.startedAt || liveClass.scheduledAt;
  const elapsed = startedAt ? formatSpan(now - new Date(startedAt)) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-green/30 bg-gradient-to-r from-green/15 via-green/5 to-transparent p-4 md:p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-60 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green" />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-widest text-green">
              YOUR CLASS IS LIVE
            </p>

            <p className="text-sm font-semibold text-text truncate">
              {liveClass.title}
            </p>

            <p className="text-xs text-muted">
              {liveClass.course?.title || "Course"}
              {elapsed ? ` · running for ${elapsed}` : ""}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onReturn(liveClass)}
            disabled={busy}
            className="bg-green text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Opening..." : "Return to classroom →"}
          </button>

          <button
            onClick={() => onEnd(liveClass)}
            disabled={busy}
            className="text-xs border border-red-500/30 text-red-500 px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            End class
          </button>
        </div>
      </div>
    </div>
  );
}

function ClassCard({
  liveClass,
  busy,
  now,
  onEdit,
  onStart,
  onRejoin,
  onEnd,
  onDelete,
  onAttendance,
  onDuplicate,
}) {
  const scheduled = liveClass.scheduledAt
    ? new Date(liveClass.scheduledAt).getTime()
    : null;

  const diff = scheduled ? scheduled - now : null;
  const isUpcoming = liveClass.status === "scheduled";
  const isLive = liveClass.status === "live";
  const startingSoon =
    isUpcoming && diff !== null && diff > 0 && diff <= SOON_MS;
  const pastDue = isUpcoming && diff !== null && diff < 0;

  let timeHint = null;
  if (isUpcoming && diff !== null) {
    if (pastDue) timeHint = { text: "Past due", tone: "text-amber-500" };
    else if (startingSoon)
      timeHint = {
        text: `Starting in ${formatSpan(diff)}`,
        tone: "text-orange",
      };
    else timeHint = { text: `In ${formatSpan(diff)}`, tone: "text-muted" };
  }

  const border = isLive
    ? "border-green/40"
    : startingSoon
      ? "border-orange/40"
      : "border-border";

  return (
    <div
      className={`bg-surface border ${border} rounded-2xl p-4 transition-colors hover:border-orange/30`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-sm font-semibold text-text">{liveClass.title}</p>

            <Badge variant={statusVariant(liveClass.status)}>
              {isLive ? "● live" : liveClass.status}
            </Badge>

            {timeHint && (
              <span className={`text-[11px] font-semibold ${timeHint.tone}`}>
                {timeHint.text}
              </span>
            )}
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
          </div>

          {liveClass.description && (
            <p className="text-xs text-muted mt-2 line-clamp-2">
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
          {isUpcoming && (
            <>
              <button
                onClick={() => onEdit(liveClass)}
                disabled={busy}
                className="text-xs border border-border text-text px-3 py-2 rounded-xl disabled:opacity-50"
              >
                Edit
              </button>

              <button
                onClick={() => onStart(liveClass)}
                disabled={busy}
                className="text-xs bg-green/10 text-green border border-green/20 px-3 py-2 rounded-xl font-semibold disabled:opacity-50"
              >
                {busy ? "Starting..." : "Start Class"}
              </button>

              <button
                onClick={() => onDelete(liveClass)}
                disabled={busy}
                className="text-xs border border-red-500/30 text-red-500 px-3 py-2 rounded-xl disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}

          {isLive && (
            <>
              <button
                onClick={() => onRejoin(liveClass)}
                disabled={busy}
                className="text-xs bg-green text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
              >
                {busy ? "Opening..." : "Rejoin classroom"}
              </button>

              <button
                onClick={() => onEnd(liveClass)}
                disabled={busy}
                className="text-xs bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-2 rounded-xl disabled:opacity-50"
              >
                {busy ? "Ending..." : "End Class"}
              </button>
            </>
          )}

          {liveClass.status === "ended" && (
            <button
              onClick={() => onDuplicate(liveClass)}
              disabled={busy}
              className="text-xs border border-border text-text px-3 py-2 rounded-xl disabled:opacity-50"
            >
              Duplicate
            </button>
          )}

          <button
            onClick={() => onAttendance(liveClass)}
            disabled={busy}
            className="text-xs border border-border text-text px-3 py-2 rounded-xl disabled:opacity-50"
          >
            Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function LiveClasses() {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useNow();

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [classResponse, courseResponse] = await Promise.all([
        getMyLiveClasses({ limit: 100 }),
        getMyCourses(),
      ]);

      setClasses(toList(unwrap(classResponse)));
      setCourses(toList(unwrap(courseResponse)));
    } catch (error) {
      console.error("Live classes loading error:", error);

      if (!silent) {
        toast.error(
          error?.response?.data?.message || "Failed to load live classes",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep statuses fresh while the instructor is away or on this page.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") loadData(true);
    };

    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadData]);

  // Message sent back from the classroom (e.g. after ending a class).
  useEffect(() => {
    const message = location.state?.message;
    if (!message) return;

    toast.success(message);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const setField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, course: courses[0]?._id || "" });
    setShowForm(true);
  };

  const openEdit = (liveClass) => {
    setEditing(liveClass);

    setForm({
      title: liveClass.title || "",
      description: liveClass.description || "",
      course: liveClass.course?._id || liveClass.course || "",
      scheduledAt: liveClass.scheduledAt
        ? toLocalInput(liveClass.scheduledAt)
        : "",
      duration: liveClass.duration || 120,
    });

    setShowForm(true);
  };

  const openDuplicate = (liveClass) => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    setEditing(null);

    setForm({
      title: liveClass.title || "",
      description: liveClass.description || "",
      course: liveClass.course?._id || liveClass.course || "",
      scheduledAt: toLocalInput(nextWeek),
      duration: liveClass.duration || 120,
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

      await loadData(true);
    } catch (error) {
      console.error("Save live class error:", error);

      toast.error(
        error?.response?.data?.message || "Could not save live class",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (liveClass) => {
    setBusyId(liveClass._id);

    try {
      const response = await startLiveClass(liveClass._id);
      const result = unwrap(response);

      const { serverUrl, roomName, token } = result || {};

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

  // Re-enter a class that is already live. No token in state, so the
  // classroom requests a fresh one itself.
  const handleRejoin = (liveClass) => {
    navigate(`/instructor/live-classes/${liveClass._id}/classroom`, {
      state: { liveClass },
    });
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
      await loadData(true);
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
      setAttendance(toList(data));
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

  const counts = useMemo(
    () => ({
      all: classes.length,
      live: classes.filter((c) => c.status === "live").length,
      scheduled: classes.filter((c) => c.status === "scheduled").length,
      ended: classes.filter((c) => c.status === "ended").length,
    }),
    [classes],
  );

  const liveClasses = useMemo(
    () => classes.filter((c) => c.status === "live"),
    [classes],
  );

  const visibleClasses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const time = (c) => new Date(c.scheduledAt || 0).getTime();
    const rank = { live: 0, scheduled: 1, ended: 2 };

    return classes
      .filter((c) => filter === "all" || c.status === filter)
      .filter(
        (c) =>
          !query ||
          c.title?.toLowerCase().includes(query) ||
          c.course?.title?.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const byStatus = (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
        if (byStatus !== 0) return byStatus;
        return a.status === "ended" ? time(b) - time(a) : time(a) - time(b);
      });
  }, [classes, filter, search]);

  const attendanceSummary = useMemo(() => {
    const attended = attendance.filter((a) =>
      ["attended", "present", "joined", "left"].includes(
        String(a.status || "").toLowerCase(),
      ),
    ).length;

    const minutes = attendance.reduce(
      (sum, item) => sum + (Number(item.duration) || 0),
      0,
    );

    return { total: attendance.length, attended, minutes };
  }, [attendance]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 fi">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="dsp text-xl font-bold text-text">Live Classes</h1>

          <p className="text-xs text-muted mt-1">
            Schedule classes, run your DEVAD classrooms and track attendance.
          </p>
        </div>

        <button
          onClick={openCreate}
          disabled={courses.length === 0}
          title={
            courses.length === 0
              ? "Create a course before scheduling a class"
              : undefined
          }
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50"
        >
          + Schedule Class
        </button>
      </div>

      {/* RETURN-TO-CLASS BANNERS */}
      {liveClasses.map((liveClass) => (
        <LiveBanner
          key={liveClass._id}
          liveClass={liveClass}
          now={now}
          busy={busyId === liveClass._id}
          onReturn={handleRejoin}
          onEnd={handleEnd}
        />
      ))}

      {/* STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total classes" value={counts.all} icon="📚" />
        <StatCard
          label="Upcoming"
          value={counts.scheduled}
          icon="📅"
          accent="text-orange"
        />
        <StatCard
          label="Live now"
          value={counts.live}
          icon="📡"
          accent="text-green"
        />
        <StatCard label="Ended" value={counts.ended} icon="✅" />
      </div>

      {/* TOOLBAR */}
      {classes.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`text-xs px-3.5 py-2 rounded-xl border font-semibold transition-colors ${
                    active
                      ? "bg-orange/10 border-orange/40 text-orange"
                      : "bg-surface border-border text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 opacity-70">{counts[item.key]}</span>
                </button>
              );
            })}
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or course..."
            className="w-full sm:w-64 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-orange/50"
          />
        </div>
      )}

      {/* CLASS LIST */}
      {classes.length === 0 ? (
        <EmptyState
          icon="📡"
          title="No live classes"
          message="Schedule your first live class."
          action={openCreate}
          actionLabel="Schedule Class"
        />
      ) : visibleClasses.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-text">No matching classes</p>

          <p className="text-xs text-muted mt-1">
            Try a different filter or search term.
          </p>

          <button
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
            className="mt-3 text-xs border border-border text-text px-3 py-2 rounded-xl"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleClasses.map((liveClass) => (
            <ClassCard
              key={liveClass._id}
              liveClass={liveClass}
              now={now}
              busy={busyId === liveClass._id}
              onEdit={openEdit}
              onStart={handleStart}
              onRejoin={handleRejoin}
              onEnd={handleEnd}
              onDelete={handleDelete}
              onAttendance={handleAttendance}
              onDuplicate={openDuplicate}
            />
          ))}
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
        <div className="space-y-4">
          {attendance.length === 0 ? (
            <p className="text-sm text-muted py-5 text-center">
              No attendance records were found for this class.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Registered", attendanceSummary.total],
                  ["Attended", attendanceSummary.attended],
                  ["Total minutes", attendanceSummary.minutes],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-surfaceHigh border border-border rounded-xl p-3 text-center"
                  >
                    <p className="text-[11px] text-muted">{label}</p>
                    <p className="text-lg font-bold text-text">{value}</p>
                  </div>
                ))}
              </div>

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
                    {attendance.map((item) => {
                      const status = String(
                        item.status || "registered",
                      ).toLowerCase();

                      const attended = [
                        "attended",
                        "present",
                        "joined",
                        "left",
                      ].includes(status);

                      return (
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
                            <Badge variant={attended ? "green" : "default"}>
                              {status}
                            </Badge>
                          </td>

                          <td className="py-3">{item.duration || 0} min</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
