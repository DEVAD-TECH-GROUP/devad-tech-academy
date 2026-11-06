import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  updateCourse,
  getAvailableCourseThumbnails,
} from "../../../services/instructor/courseService";

import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { Check, Image as ImageIcon } from "lucide-react";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [thumbnails, setThumbnails] = useState([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);

  // ============================================================
  // LOAD COURSE AND AVAILABLE THUMBNAILS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        const response = await getCourse(id);
        if (!mounted) return;

        const c = response.data?.data;

        setForm({
          title: c.title || "",
          description: c.description || "",
          shortDescription: c.shortDescription || "",
          level: c.level || "beginner",
          language: c.language || "English",
          price: c.price ?? 0,
          thumbnail: c.thumbnail?._id || c.thumbnail || null,
        });
      } catch (error) {
        if (!mounted) return;

        toast.error(error.response?.data?.message || "Course not found");
      }
    };

    const loadThumbnails = async () => {
      try {
        const response = await getAvailableCourseThumbnails();

        if (!mounted) return;

        setThumbnails(response.data?.data || []);
      } catch (error) {
        if (!mounted) return;

        setThumbnails([]);

        toast.error(
          error.response?.data?.message ||
            "Failed to load available thumbnails",
        );
      } finally {
        if (mounted) {
          setThumbnailsLoading(false);
        }
      }
    };

    loadCourse();
    loadThumbnails();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ============================================================
  // FORM HANDLER
  // ============================================================

  const set = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ============================================================
  // SAVE COURSE
  // ============================================================

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Course description is required");
      return;
    }

    setSaving(true);

    try {
      await updateCourse(id, {
        ...form,
        thumbnail: form.thumbnail || null,
      });

      toast.success("Course updated successfully!");
      navigate("/instructor/courses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!form) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const selectedThumbnail = thumbnails.find(
    (thumbnail) => thumbnail._id === form.thumbnail,
  );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-5 fi max-w-2xl">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/instructor/courses")}
          className="text-muted hover:text-text transition text-sm"
        >
          ← Back
        </button>

        <h1 className="dsp text-xl font-bold text-text">Edit Course</h1>
      </div>

      {/* COURSE FORM */}

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />

        <Input
          label="Short Description"
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
        />

        <Textarea
          label="Description *"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
        />

        {/* LEVEL AND PRICE */}

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Level"
            value={form.level}
            onChange={(e) => set("level", e.target.value)}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />

          <Input
            label="Price (₦)"
            type="number"
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </div>

        {/* LANGUAGE */}

        <Input
          label="Language"
          value={form.language}
          onChange={(e) => set("language", e.target.value)}
        />

        {/* ======================================================
            COURSE THUMBNAIL
        ====================================================== */}

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Course Thumbnail
            </h3>

            <p className="text-xs text-muted mt-1">
              Choose a thumbnail from the available library. This is optional.
            </p>
          </div>

          {/* NO THUMBNAIL OPTION */}

          <button
            type="button"
            onClick={() => set("thumbnail", null)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl border
              transition text-left
              ${
                !form.thumbnail
                  ? "border-orange bg-orange/5"
                  : "border-border hover:border-orange/40"
              }
            `}
          >
            <div className="w-16 h-12 rounded-lg bg-accentDim flex items-center justify-center shrink-0">
              <ImageIcon size={22} className="text-muted" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-text">No thumbnail</p>

              <p className="text-xs text-muted">
                Use the default course cover.
              </p>
            </div>

            {!form.thumbnail && <Check size={18} className="text-orange" />}
          </button>

          {/* THUMBNAIL LOADING */}

          {thumbnailsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-xl bg-surfaceHigh animate-pulse"
                />
              ))}
            </div>
          )}

          {/* THUMBNAIL GRID */}

          {!thumbnailsLoading && thumbnails.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {thumbnails.map((thumbnail) => {
                const selected = form.thumbnail === thumbnail._id;

                return (
                  <button
                    key={thumbnail._id}
                    type="button"
                    onClick={() => set("thumbnail", thumbnail._id)}
                    className={`
                      relative text-left rounded-xl overflow-hidden
                      border transition
                      ${
                        selected
                          ? "border-orange ring-2 ring-orange/20"
                          : "border-border hover:border-orange/50"
                      }
                    `}
                  >
                    <div className="h-24 bg-accentDim">
                      {thumbnail.image?.url ? (
                        <img
                          src={thumbnail.image.url}
                          alt={thumbnail.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={25} className="text-muted" />
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <p className="text-xs font-semibold text-text truncate">
                        {thumbnail.title}
                      </p>

                      {thumbnail.category?.name && (
                        <p className="text-[10px] text-muted truncate mt-1">
                          {thumbnail.category.name}
                        </p>
                      )}
                    </div>

                    {selected && (
                      <div className="absolute top-2 right-2 bg-orange text-white rounded-full p-1">
                        <Check size={13} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* EMPTY LIBRARY */}

          {!thumbnailsLoading && thumbnails.length === 0 && (
            <p className="text-xs text-muted bg-surfaceHigh rounded-xl p-3">
              No active course thumbnails are currently available. You can still
              save your course without one.
            </p>
          )}

          {/* SELECTED THUMBNAIL */}

          {selectedThumbnail && (
            <p className="text-xs text-orange font-medium">
              Selected: {selectedThumbnail.title}
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="
              flex-1
              bg-surfaceHigh
              border border-border
              text-text
              font-semibold
              py-3
              rounded-xl
              text-sm
              hover:border-orange/40
              transition
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              flex-1
              bg-orange
              hover:bg-orange/90
              text-white
              font-semibold
              py-3
              rounded-xl
              text-sm
              transition
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
