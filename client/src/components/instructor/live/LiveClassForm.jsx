import Input from "../../common/Input";

export default function LiveClassForm({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v });

  return (
    <div className="space-y-3">
      <Input
        label="Title *"
        value={form.title || ""}
        onChange={(e) => set("title", e.target.value)}
        placeholder="e.g. React Hooks Deep Dive"
        required
      />
      <Input
        label="Scheduled Date & Time *"
        type="datetime-local"
        value={form.scheduledAt || ""}
        onChange={(e) => set("scheduledAt", e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duration (min)"
          type="number"
          value={form.duration || 120}
          onChange={(e) => set("duration", Number(e.target.value))}
        />
        <Input
          label="Max Participants"
          type="number"
          value={form.maxParticipants || 100}
          onChange={(e) => set("maxParticipants", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
