import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  Upload,
  Eye,
  EyeOff,
  Layers,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getAllThumbnails,
  uploadThumbnail,
  updateThumbnail,
  toggleThumbnailStatus,
  deleteThumbnail,
} from "../../services/superadmin/courseThumbnailService";

import { getCategories } from "../../services/superadmin/categoryService";

import { SkeletonCard } from "../../components/common/Skeleton";
import Badge from "../../components/common/Badge";

const initialForm = {
  title: "",
  description: "",
  category: "",
  sortOrder: 0,
};

export default function CourseThumbnails() {
  const [thumbnails, setThumbnails] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingThumbnail, setEditingThumbnail] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [thumbnailResponse, categoryResponse] = await Promise.all([
        getAllThumbnails(),
        getCategories(),
      ]);

      setThumbnails(thumbnailResponse.data?.data || []);

      setCategories(categoryResponse.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load thumbnail library",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const filteredThumbnails = useMemo(() => {
    const query = search.trim().toLowerCase();

    return thumbnails.filter((thumbnail) => {
      const matchesSearch =
        !query ||
        thumbnail.title?.toLowerCase().includes(query) ||
        thumbnail.description?.toLowerCase().includes(query) ||
        thumbnail.category?.name?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && thumbnail.isActive) ||
        (statusFilter === "inactive" && !thumbnail.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [thumbnails, search, statusFilter]);

  const activeCount = thumbnails.filter((item) => item.isActive).length;

  const inactiveCount = thumbnails.length - activeCount;

  const openCreateModal = () => {
    setEditingThumbnail(null);
    setForm(initialForm);
    setSelectedFile(null);
    setPreview("");
    setShowModal(true);
  };

  const openEditModal = (thumbnail) => {
    setEditingThumbnail(thumbnail);

    setForm({
      title: thumbnail.title || "",
      description: thumbnail.description || "",
      category: thumbnail.category?._id || "",
      sortOrder: thumbnail.sortOrder ?? 0,
    });

    setSelectedFile(null);
    setPreview(thumbnail.image?.url || "");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingThumbnail(null);
    setForm(initialForm);
    setSelectedFile(null);
    setPreview("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must not exceed 5 MB");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      toast.error("Thumbnail title is required");
      return;
    }

    if (title.length > 100) {
      toast.error("Title cannot exceed 100 characters");
      return;
    }

    if (description.length > 300) {
      toast.error("Description cannot exceed 300 characters");
      return;
    }

    if (!editingThumbnail && !selectedFile) {
      toast.error("Please select a thumbnail image");
      return;
    }

    try {
      setSubmitting(true);

      if (editingThumbnail) {
        const response = await updateThumbnail(editingThumbnail._id, {
          title,
          description,
          category: form.category || null,
          sortOrder: Number(form.sortOrder) || 0,
        });

        const updated = response.data?.data;

        setThumbnails((previous) =>
          previous.map((item) =>
            item._id === editingThumbnail._id ? updated : item,
          ),
        );

        toast.success(
          response.data?.message || "Thumbnail updated successfully",
        );
      } else {
        const formData = new FormData();

        formData.append("image", selectedFile);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", form.category || "");
        formData.append("sortOrder", String(Number(form.sortOrder) || 0));

        const response = await uploadThumbnail(formData);

        const created = response.data?.data;

        setThumbnails((previous) => [created, ...previous]);

        toast.success(
          response.data?.message || "Thumbnail uploaded successfully",
        );
      }

      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save thumbnail");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (thumbnail) => {
    try {
      setProcessing(thumbnail._id);

      const response = await toggleThumbnailStatus(thumbnail._id);

      const updated = response.data?.data;

      setThumbnails((previous) =>
        previous.map((item) => (item._id === thumbnail._id ? updated : item)),
      );

      toast.success(response.data?.message || "Thumbnail status updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update thumbnail status",
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (thumbnail) => {
    const confirmed = window.confirm(
      `Permanently delete "${thumbnail.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setProcessing(thumbnail._id);

      const response = await deleteThumbnail(thumbnail._id);

      setThumbnails((previous) =>
        previous.filter((item) => item._id !== thumbnail._id),
      );

      toast.success(response.data?.message || "Thumbnail deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete thumbnail",
      );
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 fi">
        <div>
          <div className="h-6 w-52 bg-surfaceHigh rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-surfaceHigh rounded-lg animate-pulse mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-64 bg-surface border border-border rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fi">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Image size={21} className="text-purple" strokeWidth={1.8} />

            <h1 className="dsp text-xl font-bold text-text">
              Course Thumbnails
            </h1>
          </div>

          <p className="text-muted text-sm">
            Manage the image library used across your courses
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            flex items-center gap-2
            px-4 py-2.5
            rounded-xl
            bg-purple
            text-white
            text-sm font-medium
            hover:opacity-90
            transition
          "
        >
          <Plus size={16} />
          Upload Thumbnail
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center mb-3">
            <Image size={18} className="text-purple" />
          </div>

          <div className="dsp text-xl font-extrabold text-purple">
            {thumbnails.length}
          </div>

          <div className="text-xs text-muted mt-1">Total Thumbnails</div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-green/10 flex items-center justify-center mb-3">
            <Eye size={18} className="text-green" />
          </div>

          <div className="dsp text-xl font-extrabold text-green">
            {activeCount}
          </div>

          <div className="text-xs text-muted mt-1">Active Thumbnails</div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center mb-3">
            <EyeOff size={18} className="text-blue" />
          </div>

          <div className="dsp text-xl font-extrabold text-blue">
            {inactiveCount}
          </div>

          <div className="text-xs text-muted mt-1">Inactive Thumbnails</div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search thumbnails..."
              className="
                w-full bg-surfaceHigh border border-border
                rounded-xl pl-9 pr-3 py-2.5
                text-sm text-text placeholder:text-muted
                outline-none focus:border-purple/50 transition
              "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="
              bg-surfaceHigh border border-border
              rounded-xl px-3 py-2.5
              text-sm text-text outline-none
              focus:border-purple/50
            "
          >
            <option value="all">All thumbnails</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            title="Refresh thumbnails"
            className="
              w-10 h-10 shrink-0
              flex items-center justify-center
              rounded-xl bg-surfaceHigh
              border border-border text-muted
              hover:text-text hover:border-purple/40 transition
            "
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Thumbnail gallery */}
      {filteredThumbnails.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl py-16 px-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-surfaceHigh flex items-center justify-center mb-3">
            <Image size={24} className="text-muted" />
          </div>

          <h3 className="dsp text-sm font-bold text-text">
            {search || statusFilter !== "all"
              ? "No thumbnails found"
              : "Your thumbnail library is empty"}
          </h3>

          <p className="text-xs text-muted mt-1">
            {search || statusFilter !== "all"
              ? "Try changing your search or filter."
              : "Upload your first course thumbnail to get started."}
          </p>

          {!search && statusFilter === "all" && (
            <button
              type="button"
              onClick={openCreateModal}
              className="
                inline-flex items-center gap-2
                mt-4 px-3.5 py-2
                rounded-xl bg-purple text-white
                text-xs font-medium hover:opacity-90 transition
              "
            >
              <Plus size={14} />
              Upload Thumbnail
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredThumbnails.map((thumbnail) => (
            <div
              key={thumbnail._id}
              className="
                bg-surface border border-border
                rounded-2xl overflow-hidden
                group hover:border-purple/40 transition
              "
            >
              {/* Image */}
              <div className="relative aspect-video bg-surfaceHigh overflow-hidden">
                {thumbnail.image?.url ? (
                  <img
                    src={thumbnail.image.url}
                    alt={thumbnail.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={32} className="text-muted" />
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <Badge variant={thumbnail.isActive ? "green" : "red"}>
                    {thumbnail.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-lg bg-black/65 text-white text-[10px] backdrop-blur-sm">
                    Order: {thumbnail.sortOrder ?? 0}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-text truncate">
                    {thumbnail.title}
                  </h3>

                  <p className="text-xs text-muted mt-1 line-clamp-2 min-h-8">
                    {thumbnail.description || "No description provided"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Layers size={13} />
                    <span className="truncate">
                      {thumbnail.category?.name || "General"}
                    </span>
                  </div>

                  <span className="shrink-0">
                    {thumbnail.createdAt
                      ? new Date(thumbnail.createdAt).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => openEditModal(thumbnail)}
                    className="
                      flex-1 flex items-center justify-center gap-1.5
                      py-2 rounded-lg bg-surfaceHigh
                      text-xs text-text hover:text-purple
                      transition
                    "
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(thumbnail)}
                    disabled={processing === thumbnail._id}
                    title={thumbnail.isActive ? "Deactivate" : "Activate"}
                    className="
                      w-9 h-9 flex items-center justify-center
                      rounded-lg bg-surfaceHigh text-muted
                      hover:text-purple transition
                      disabled:opacity-50
                    "
                  >
                    {thumbnail.isActive ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(thumbnail)}
                    disabled={processing === thumbnail._id}
                    title="Delete thumbnail"
                    className="
                      w-9 h-9 flex items-center justify-center
                      rounded-lg bg-surfaceHigh text-muted
                      hover:text-red transition
                      disabled:opacity-50
                    "
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit modal */}
      {showModal && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            p-4 bg-black/60 backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="
            w-full max-w-xl max-h-[90vh]
            overflow-y-auto
            bg-surface border border-border
            rounded-2xl shadow-2xl
          "
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
              <div>
                <h2 className="dsp text-base font-bold text-text">
                  {editingThumbnail ? "Edit Thumbnail" : "Upload Thumbnail"}
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  {editingThumbnail
                    ? "Update the thumbnail information."
                    : "Add an image to your course thumbnail library."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="
                  w-8 h-8 flex items-center justify-center
                  rounded-lg text-muted hover:text-text
                  hover:bg-surfaceHigh transition
                "
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-text mb-2">
                  Thumbnail Image
                  {!editingThumbnail && (
                    <span className="text-red ml-1">*</span>
                  )}
                </label>

                <label
                  className="
                    relative block w-full aspect-video
                    rounded-xl overflow-hidden
                    border-2 border-dashed border-border
                    bg-surfaceHigh cursor-pointer
                    hover:border-purple/50 transition
                  "
                >
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                        <span className="flex items-center gap-2 text-white text-sm font-medium">
                          <Upload size={17} />
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
                      <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center">
                        <Upload size={20} className="text-purple" />
                      </div>

                      <span className="text-sm font-medium text-text">
                        Click to upload image
                      </span>

                      <span className="text-[11px]">
                        JPG, PNG or WEBP · Max 5 MB
                      </span>

                      <span className="text-[10px]">
                        Recommended: 1280 × 720 pixels
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {editingThumbnail && (
                  <p className="text-[10px] text-muted mt-1.5">
                    To change the image itself, we'll add image replacement
                    support separately.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Thumbnail Title
                  <span className="text-red ml-1">*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Web Development"
                  maxLength={100}
                  required
                  className="
                    w-full bg-surfaceHigh border border-border
                    rounded-xl px-3 py-2.5
                    text-sm text-text placeholder:text-muted
                    outline-none focus:border-purple/50 transition
                  "
                />

                <p className="text-[10px] text-muted mt-1 text-right">
                  {form.title.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this thumbnail..."
                  maxLength={300}
                  rows={3}
                  className="
                    w-full bg-surfaceHigh border border-border
                    rounded-xl px-3 py-2.5
                    text-sm text-text placeholder:text-muted
                    outline-none resize-none
                    focus:border-purple/50 transition
                  "
                />

                <p className="text-[10px] text-muted mt-1 text-right">
                  {form.description.length}/300
                </p>
              </div>

              {/* Category + order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text mb-1.5">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="
                      w-full bg-surfaceHigh border border-border
                      rounded-xl px-3 py-2.5
                      text-sm text-text outline-none
                      focus:border-purple/50 transition
                    "
                  >
                    <option value="">General / No category</option>

                    {categories
                      .filter((category) => category.isActive)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text mb-1.5">
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="sortOrder"
                    min="0"
                    value={form.sortOrder}
                    onChange={handleChange}
                    className="
                      w-full bg-surfaceHigh border border-border
                      rounded-xl px-3 py-2.5
                      text-sm text-text outline-none
                      focus:border-purple/50 transition
                    "
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="
                    px-4 py-2.5 rounded-xl
                    border border-border text-sm text-muted
                    hover:text-text hover:bg-surfaceHigh transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex items-center gap-2
                    px-4 py-2.5 rounded-xl
                    bg-purple text-white
                    text-sm font-medium
                    hover:opacity-90 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingThumbnail ? (
                        <Save size={15} />
                      ) : (
                        <Upload size={15} />
                      )}

                      {editingThumbnail ? "Save Changes" : "Upload Thumbnail"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
