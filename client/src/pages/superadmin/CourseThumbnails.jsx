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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CourseThumbnails() {
  const [thumbnails, setThumbnails] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingThumbnail, setEditingThumbnail] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch thumbnails and categories
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [thumbnailResponse, categoryResponse] = await Promise.all([
        getAllThumbnails(),
        getCategories(),
      ]);

      const thumbnailData = thumbnailResponse.data?.data;
      const categoryData = categoryResponse.data?.data;

      setThumbnails(Array.isArray(thumbnailData) ? thumbnailData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Failed to fetch thumbnail data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load thumbnails",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Revoke temporary preview URLs when they are replaced
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Filter thumbnails
  const filteredThumbnails = useMemo(() => {
    return thumbnails.filter((thumbnail) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        thumbnail.title?.toLowerCase().includes(searchValue) ||
        thumbnail.description?.toLowerCase().includes(searchValue) ||
        thumbnail.category?.name?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && thumbnail.isActive) ||
        (statusFilter === "inactive" && !thumbnail.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [thumbnails, search, statusFilter]);

  const activeCount = thumbnails.filter((item) => item.isActive).length;
  const inactiveCount = thumbnails.length - activeCount;

  // Update form fields
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG and WEBP images are allowed");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must not exceed 5 MB");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  // Open upload modal
  const openCreateModal = () => {
    setEditingThumbnail(null);
    setForm(initialForm);
    setSelectedFile(null);
    setPreview("");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (thumbnail) => {
    setEditingThumbnail(thumbnail);

    setForm({
      title: thumbnail.title || "",
      description: thumbnail.description || "",
      category: thumbnail.category?._id || thumbnail.category || "",
      sortOrder: thumbnail.sortOrder ?? 0,
    });

    setSelectedFile(null);
    setPreview(thumbnail.image?.url || "");
    setShowModal(true);
  };

  // Close and reset modal
  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingThumbnail(null);
    setForm(initialForm);
    setSelectedFile(null);
    setPreview("");
  };

  // Submit upload or update
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

        const updatedThumbnail =
          response.data?.data || response.data?.thumbnail;

        if (updatedThumbnail) {
          setThumbnails((previous) =>
            previous.map((item) =>
              item._id === editingThumbnail._id ? updatedThumbnail : item,
            ),
          );
        } else {
          await fetchData(true);
        }

        toast.success("Thumbnail updated successfully");
      } else {
        const formData = new FormData();

        formData.append("image", selectedFile);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", form.category || "");
        formData.append("sortOrder", String(Number(form.sortOrder) || 0));

        const response = await uploadThumbnail(formData);

        const newThumbnail = response.data?.data || response.data?.thumbnail;

        if (newThumbnail) {
          setThumbnails((previous) => [newThumbnail, ...previous]);
        } else {
          await fetchData(true);
        }

        toast.success("Thumbnail uploaded successfully");
      }

      // Reset and close after successful request.
      // Do not call closeModal() here because submitting is still true.
      setShowModal(false);
      setEditingThumbnail(null);
      setForm(initialForm);
      setSelectedFile(null);
      setPreview("");
    } catch (error) {
      console.error("Thumbnail submission error:", error);

      toast.error(error?.response?.data?.message || "Failed to save thumbnail");
    } finally {
      setSubmitting(false);
    }
  };

  // Activate or deactivate thumbnail
  const handleToggleStatus = async (thumbnail) => {
    try {
      const response = await toggleThumbnailStatus(thumbnail._id);

      const updatedThumbnail = response.data?.data || response.data?.thumbnail;

      if (updatedThumbnail) {
        setThumbnails((previous) =>
          previous.map((item) =>
            item._id === thumbnail._id ? updatedThumbnail : item,
          ),
        );
      } else {
        await fetchData(true);
      }

      toast.success(
        thumbnail.isActive ? "Thumbnail deactivated" : "Thumbnail activated",
      );
    } catch (error) {
      console.error("Thumbnail status error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update thumbnail status",
      );
    }
  };

  // Delete thumbnail
  const handleDelete = async (thumbnail) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${thumbnail.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteThumbnail(thumbnail._id);

      setThumbnails((previous) =>
        previous.filter((item) => item._id !== thumbnail._id),
      );

      toast.success("Thumbnail deleted successfully");
    } catch (error) {
      console.error("Thumbnail deletion error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete thumbnail",
      );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Image size={23} className="text-sky-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Course Thumbnails
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the images instructors can select for their courses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <Plus size={17} />
            Add Thumbnail
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Thumbnails
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {thumbnails.length}
              </h2>
            </div>
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
              <Layers size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {activeCount}
              </h2>
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-green-600 dark:bg-green-500/10">
              <Eye size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Inactive
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-500">
                {inactiveCount}
              </h2>
            </div>
            <div className="rounded-lg bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <EyeOff size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search thumbnails..."
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All thumbnails</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {/* Thumbnail gallery */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredThumbnails.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <Image size={42} className="mx-auto text-gray-400" />

          <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
            {search || statusFilter !== "all"
              ? "No matching thumbnails"
              : "No thumbnails yet"}
          </h3>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {search || statusFilter !== "all"
              ? "Try changing your search or filter."
              : "Upload your first course thumbnail to get started."}
          </p>

          {!search && statusFilter === "all" && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              <Plus size={16} />
              Add Thumbnail
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredThumbnails.map((thumbnail) => (
            <div
              key={thumbnail._id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {thumbnail.image?.url ? (
                  <img
                    src={thumbnail.image.url}
                    alt={thumbnail.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Image size={35} />
                  </div>
                )}

                <div className="absolute right-3 top-3">
                  <Badge variant={thumbnail.isActive ? "success" : "secondary"}>
                    {thumbnail.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {thumbnail.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {thumbnail.description || "No description provided."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    {thumbnail.category?.name || "Uncategorized"}
                  </span>

                  <span>Order: {thumbnail.sortOrder ?? 0}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => openEditModal(thumbnail)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(thumbnail)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {thumbnail.isActive ? (
                      <>
                        <EyeOff size={14} />
                        Disable
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Activate
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(thumbnail)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingThumbnail
                    ? "Edit Thumbnail"
                    : "Upload Course Thumbnail"}
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {editingThumbnail
                    ? "Update the thumbnail details."
                    : "Add an image to the course thumbnail library."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Image upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Thumbnail Image {!editingThumbnail && "*"}
                </label>

                <label
                  htmlFor="course-thumbnail-image"
                  className="block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 transition hover:border-sky-500 dark:border-gray-700"
                >
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Thumbnail preview"
                        className="h-52 w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                        <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900">
                          <Upload size={16} />
                          Change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                      <div className="rounded-full bg-sky-100 p-4 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                        <Upload size={25} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-white">
                        Click to upload an image
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        JPG, JPEG, PNG or WEBP · Maximum 5 MB
                      </p>
                    </div>
                  )}
                </label>

                <input
                  id="course-thumbnail-image"
                  name="image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={submitting}
                  className="hidden"
                />

                {selectedFile && (
                  <p className="mt-2 break-all text-xs font-medium text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}

                {editingThumbnail && !selectedFile && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Current image will be retained. Image replacement is not
                    included in this edit operation.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="thumbnail-title"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Thumbnail Title *
                </label>

                <input
                  id="thumbnail-title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Web Development"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.title.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="thumbnail-description"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Description
                </label>

                <textarea
                  id="thumbnail-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  maxLength={300}
                  rows={3}
                  placeholder="Briefly describe this thumbnail..."
                  disabled={submitting}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.description.length}/300
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="thumbnail-category"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Category
                </label>

                <select
                  id="thumbnail-category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">No category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label
                  htmlFor="thumbnail-sort-order"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Display Order
                </label>

                <input
                  id="thumbnail-sort-order"
                  type="number"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleFormChange}
                  min="0"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lower numbers can be displayed first.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingThumbnail ? (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Thumbnail
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
