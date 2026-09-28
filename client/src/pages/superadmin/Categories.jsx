import { useEffect, useMemo, useState } from "react";
import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
  BookOpen,
  X,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/superadmin/categoryService";

import { SkeletonCard } from "../../components/common/Skeleton";
import Badge from "../../components/common/Badge";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#818CF8",
  });

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      setCategories(response.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  const totalCourses = categories.reduce(
    (total, category) =>
      total + Number(category.totalCourses || 0),
    0
  );

  const openCreateModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      icon: "",
      color: "#818CF8",
    });

    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#818CF8",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      icon: "",
      color: "#818CF8",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    if (name.length > 50) {
      toast.error(
        "Category name cannot exceed 50 characters"
      );
      return;
    }

    if (description.length > 200) {
      toast.error(
        "Description cannot exceed 200 characters"
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name,
        description: description || null,
        icon: form.icon.trim() || null,
        color: form.color || "#818CF8",
      };

      if (editingCategory) {
        const response = await updateCategory(
          editingCategory._id,
          payload
        );

        const updated =
          response.data?.data;

        setCategories((previous) =>
          previous.map((category) =>
            category._id === editingCategory._id
              ? updated
              : category
          )
        );

        toast.success(
          response.data?.message ||
            "Category updated successfully"
        );
      } else {
        const response = await createCategory(
          payload
        );

        const created =
          response.data?.data;

        setCategories((previous) =>
          [...previous, created].sort((a, b) =>
            (a.name || "").localeCompare(
              b.name || ""
            )
          )
        );

        toast.success(
          response.data?.message ||
            "Category created successfully"
        );
      }

      closeModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(category._id);

      const response = await deleteCategory(
        category._id
      );

      setCategories((previous) =>
        previous.map((item) =>
          item._id === category._id
            ? {
                ...item,
                isActive: false,
              }
            : item
        )
      );

      toast.success(
        response.data?.message ||
          "Category deactivated successfully"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to deactivate category"
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 fi">
        <div>
          <div className="h-6 w-44 bg-surfaceHigh rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-surfaceHigh rounded-lg animate-pulse mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-14 bg-surfaceHigh rounded-xl animate-pulse"
              />
            ))}
          </div>
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
            <Tags
              size={21}
              className="text-purple"
              strokeWidth={1.8}
            />

            <h1 className="dsp text-xl font-bold text-text">
              Categories
            </h1>
          </div>

          <p className="text-muted text-sm">
            Manage course categories across the
            platform
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
          Add Category
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center mb-3">
            <Tags
              size={18}
              className="text-purple"
            />
          </div>

          <div className="dsp text-xl font-extrabold text-purple">
            {categories.length}
          </div>

          <div className="text-xs text-muted mt-1">
            Total Categories
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-green/10 flex items-center justify-center mb-3">
            <FolderOpen
              size={18}
              className="text-green"
            />
          </div>

          <div className="dsp text-xl font-extrabold text-green">
            {activeCount}
          </div>

          <div className="text-xs text-muted mt-1">
            Active Categories
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center mb-3">
            <BookOpen
              size={18}
              className="text-blue"
            />
          </div>

          <div className="dsp text-xl font-extrabold text-blue">
            {totalCourses}
          </div>

          <div className="text-xs text-muted mt-1">
            Courses Across Categories
          </div>
        </div>
      </div>

      {/* Search + refresh */}
      <div className="bg-surface border border-border rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-muted
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="
                w-full
                bg-surfaceHigh
                border border-border
                rounded-xl
                pl-9 pr-3
                py-2.5
                text-sm text-text
                placeholder:text-muted
                outline-none
                focus:border-purple/50
                transition
              "
            />
          </div>

          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            title="Refresh categories"
            className="
              w-10 h-10
              flex items-center justify-center
              rounded-xl
              bg-surfaceHigh
              border border-border
              text-muted
              hover:text-text
              hover:border-purple/40
              transition
            "
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-border bg-surfaceHigh">
          <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Category
          </span>

          <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Courses
          </span>

          <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Status
          </span>

          <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Created
          </span>

          <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
            Actions
          </span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="py-14 px-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-surfaceHigh flex items-center justify-center mb-3">
              <Tags
                size={22}
                className="text-muted"
              />
            </div>

            <h3 className="dsp text-sm font-bold text-text">
              {search
                ? "No categories found"
                : "No categories yet"}
            </h3>

            <p className="text-xs text-muted mt-1">
              {search
                ? "Try a different search term."
                : "Create your first course category to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="
                  inline-flex items-center gap-2
                  mt-4 px-3.5 py-2
                  rounded-xl
                  bg-purple
                  text-white
                  text-xs font-medium
                  hover:opacity-90
                  transition
                "
              >
                <Plus size={14} />
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCategories.map(
              (category) => (
                <div
                  key={category._id}
                  className="
                    grid grid-cols-1
                    md:grid-cols-[2fr_1fr_1fr_1fr_auto]
                    gap-3 md:gap-4
                    px-4 py-4
                    hover:bg-surfaceHigh/50
                    transition
                  "
                >
                  {/* Category */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${category.color || "#818CF8"}15`,
                        borderColor: `${category.color || "#818CF8"}30`,
                      }}
                    >
                      <Tags
                        size={18}
                        style={{
                          color:
                            category.color ||
                            "#818CF8",
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">
                        {category.name}
                      </p>

                      <p className="text-[10px] text-muted truncate">
                        {category.slug ||
                          "No slug"}
                      </p>

                      {category.description && (
                        <p className="text-[11px] text-muted mt-0.5 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="flex md:block items-center justify-between">
                    <span className="md:hidden text-xs text-muted">
                      Courses
                    </span>

                    <span className="text-sm font-semibold text-text">
                      {category.totalCourses ||
                        0}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex md:block items-center justify-between">
                    <span className="md:hidden text-xs text-muted">
                      Status
                    </span>

                    <Badge
                      variant={
                        category.isActive
                          ? "green"
                          : "red"
                      }
                    >
                      {category.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>

                  {/* Created */}
                  <div className="flex md:block items-center justify-between">
                    <span className="md:hidden text-xs text-muted">
                      Created
                    </span>

                    <span className="text-xs text-muted">
                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(category)
                      }
                      title="Edit category"
                      className="
                        w-8 h-8
                        flex items-center justify-center
                        rounded-lg
                        text-muted
                        hover:text-purple
                        hover:bg-purple/10
                        transition
                      "
                    >
                      <Pencil size={15} />
                    </button>

                    {category.isActive && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(category)
                        }
                        disabled={
                          deleting ===
                          category._id
                        }
                        title="Deactivate category"
                        className="
                          w-8 h-8
                          flex items-center justify-center
                          rounded-lg
                          text-muted
                          hover:text-red
                          hover:bg-red/10
                          transition
                          disabled:opacity-50
                        "
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            p-4
            bg-black/60
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="
              w-full max-w-lg
              bg-surface
              border border-border
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="dsp text-base font-bold text-text">
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="text-xs text-muted mt-0.5">
                  {editingCategory
                    ? "Update the category information."
                    : "Add a new category for courses."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  text-muted
                  hover:text-text
                  hover:bg-surfaceHigh
                  transition
                "
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Category Name
                  <span className="text-red ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Software Development"
                  maxLength={50}
                  required
                  className="
                    w-full
                    bg-surfaceHigh
                    border border-border
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm text-text
                    placeholder:text-muted
                    outline-none
                    focus:border-purple/50
                    transition
                  "
                />

                <p className="text-[10px] text-muted mt-1 text-right">
                  {form.name.length}/50
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
                  placeholder="Briefly describe this category..."
                  maxLength={200}
                  rows={3}
                  className="
                    w-full
                    bg-surfaceHigh
                    border border-border
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm text-text
                    placeholder:text-muted
                    outline-none
                    resize-none
                    focus:border-purple/50
                    transition
                  "
                />

                <p className="text-[10px] text-muted mt-1 text-right">
                  {form.description.length}/200
                </p>
              </div>

              {/* Icon + color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text mb-1.5">
                    Icon
                  </label>

                  <input
                    type="text"
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    placeholder="Optional icon name"
                    className="
                      w-full
                      bg-surfaceHigh
                      border border-border
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm text-text
                      placeholder:text-muted
                      outline-none
                      focus:border-purple/50
                      transition
                    "
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text mb-1.5">
                    Color
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="
                        w-11 h-10
                        rounded-lg
                        bg-surfaceHigh
                        border border-border
                        cursor-pointer
                      "
                    />

                    <input
                      type="text"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      maxLength={7}
                      className="
                        flex-1
                        bg-surfaceHigh
                        border border-border
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm text-text
                        outline-none
                        focus:border-purple/50
                        transition
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="
                    px-4 py-2.5
                    rounded-xl
                    border border-border
                    text-sm text-muted
                    hover:text-text
                    hover:bg-surfaceHigh
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex items-center gap-2
                    px-4 py-2.5
                    rounded-xl
                    bg-purple
                    text-white
                    text-sm font-medium
                    hover:opacity-90
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCategory ? (
                        <Save size={15} />
                      ) : (
                        <Plus size={15} />
                      )}

                      {editingCategory
                        ? "Save Changes"
                        : "Create Category"}
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