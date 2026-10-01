import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  GraduationCap,
  Route,
  Building2,
  Phone,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";

import { useAuthStore } from "../../../store/authStore";

const HEADER_HEIGHT = 80;

// ─────────────────────────────────────────────────────────────
// Throttle utility
// ─────────────────────────────────────────────────────────────

const throttle = (func, limit) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────

export default function Header() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuRef = useRef(null);
  const profileRef = useRef(null);

  // ───────────────────────────────────────────────────────────
  // Auth
  // ───────────────────────────────────────────────────────────

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuthStore();

  // ───────────────────────────────────────────────────────────
  // User information
  // ───────────────────────────────────────────────────────────

  const userName = useMemo(() => {
    if (!user) {
      return "User";
    }

    const fullName = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }

    if (user.name) {
      return user.name;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  }, [user]);

  const userInitials = useMemo(() => {
    if (!user) {
      return "U";
    }

    const firstName =
      user.firstName?.trim() || "";

    const lastName =
      user.lastName?.trim() || "";

    if (firstName && lastName) {
      return (
        firstName.charAt(0) +
        lastName.charAt(0)
      ).toUpperCase();
    }

    if (firstName) {
      return firstName
        .slice(0, 2)
        .toUpperCase();
    }

    if (user.name) {
      const parts = user.name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (parts.length >= 2) {
        return (
          parts[0].charAt(0) +
          parts[1].charAt(0)
        ).toUpperCase();
      }

      return (
        parts[0]
          ?.slice(0, 2)
          .toUpperCase() || "U"
      );
    }

    if (user.email) {
      return user.email
        .charAt(0)
        .toUpperCase();
    }

    return "U";
  }, [user]);

  const profileImage = useMemo(() => {
    if (!user) {
      return null;
    }

    const image =
      user.profileImage ||
      user.profilePicture ||
      user.avatar ||
      user.photo ||
      null;

    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return image;
    }

    if (typeof image === "object") {
      return (
        image.url ||
        image.secure_url ||
        image.path ||
        null
      );
    }

    return null;
  }, [user]);

  // ───────────────────────────────────────────────────────────
  // Scroll effect
  // ───────────────────────────────────────────────────────────

  const handleScroll = useCallback(
    throttle(() => {
      setScrolled(window.scrollY > 10);
    }, 16),
    []
  );

  useEffect(() => {
    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [handleScroll]);

  // ───────────────────────────────────────────────────────────
  // Close mobile menu when clicking outside
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // Close profile dropdown when clicking outside
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // Lock body scroll when mobile menu is open
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = isOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ───────────────────────────────────────────────────────────
  // Navigation links
  // ───────────────────────────────────────────────────────────

  const navLinks = useMemo(
    () => [
      {
        name: "Home",
        path: "/",
        icon: Home,
      },
      {
        name: "Courses",
        path: "/courses",
        icon: GraduationCap,
      },
      {
        name: "Career Paths",
        path: "/career-paths",
        icon: Route,
      },
      {
        name: "About",
        path: "/about",
        icon: Building2,
      },
      {
        name: "Contact",
        path: "/contact",
        icon: Phone,
      },
    ],
    []
  );

  // ───────────────────────────────────────────────────────────
  // Menu controls
  // ───────────────────────────────────────────────────────────

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Dashboard
  // ───────────────────────────────────────────────────────────


  const getDashboardPath = (role) => {
  switch (role) {
    case "student":
      return "/student/dashboard";

    case "instructor":
      return "/instructor/dashboard";

    case "super_admin":
      return "/admin/dashboard";

    default:
      return "/";
  }
};

  const handleDashboard = useCallback(() => {
  setIsProfileOpen(false);
  setIsOpen(false);

  const dashboardPath =
    getDashboardPath(user?.role);

  navigate(dashboardPath);
}, [navigate, user?.role]);
  // ───────────────────────────────────────────────────────────
  // Logout
  // ───────────────────────────────────────────────────────────

  const handleLogout = useCallback(async () => {
    setIsProfileOpen(false);
    setIsOpen(false);

    await logout();
  }, [logout]);

  // ───────────────────────────────────────────────────────────
  // Profile avatar
  // ───────────────────────────────────────────────────────────

  const renderAvatar = (size = "w-10 h-10") => {
    return (
      <div
        className={`${size} rounded-full overflow-hidden border border-cyan-500/30 bg-[#071126] flex items-center justify-center shrink-0`}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-cyan-400 font-semibold text-sm">
            {userInitials}
          </span>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled
          ? "bg-[#040816]/98 border-b border-cyan-500/20 shadow-lg shadow-cyan-900/20"
          : "bg-[#040816]/90 border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* ─────────────────────────────────────────────────────
            Logo
        ────────────────────────────────────────────────────── */}

        <NavLink
          to="/"
          className="flex items-center gap-3 group"
        >
          <img
            src={logo}
            alt="Devad Technologies Academy Logo"
            className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
          />

          <div className="leading-tight">
            <h1 className="text-white text-lg font-bold tracking-wide">
              DEVAD
            </h1>

            <p className="text-cyan-400 text-xs tracking-[0.28em] font-medium">
              TECH ACADEMY
            </p>
          </div>
        </NavLink>

        {/* ─────────────────────────────────────────────────────
            Desktop Navigation
        ────────────────────────────────────────────────────── */}

        <nav className="hidden xl:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `relative text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <div className="relative group">
                  {link.name}

                  <span
                    className={`absolute left-0 -bottom-1 h-0.5 w-full bg-gradient-to-r from-cyan-400 to-blue-500 origin-left transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </div>
              )}
            </NavLink>
          ))}

          {/* ─────────────────────────────────────────────────
              Desktop Auth
          ────────────────────────────────────────────────── */}

          {!isAuthenticated ? (
            <NavLink
              to="/login"
              className="ml-4 px-6 py-2.5 rounded-lg text-black font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 bg-[linear-gradient(90deg,#22d3ee,#2563eb)]"
            >
              Login
            </NavLink>
          ) : (
            <div
              ref={profileRef}
              className="relative ml-4"
            >
              <button
                type="button"
                onClick={() =>
                  setIsProfileOpen(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-300 hover:bg-white/5"
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
              >
                {renderAvatar("w-9 h-9")}

                <span className="text-white text-sm font-semibold max-w-32 truncate">
                  {userName}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isProfileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Desktop User Dropdown */}

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="absolute right-0 top-full mt-3 w-52 rounded-xl bg-[#040816] border border-white/10 shadow-xl shadow-black/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={
                        handleDashboard
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard
                        size={18}
                        className="text-cyan-400"
                      />

                      <span>
                        My Dashboard
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors border-t border-white/5"
                    >
                      <LogOut size={18} />

                      <span>
                        Logout
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* ─────────────────────────────────────────────────────
            Mobile Toggle
        ────────────────────────────────────────────────────── */}

        <div className="xl:hidden text-white">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={
              isOpen
                ? "Close Menu"
                : "Open Menu"
            }
            aria-expanded={isOpen}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          Mobile Menu
      ────────────────────────────────────────────────────────── */}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed left-0 w-full bg-black/80 backdrop-blur-lg z-40 xl:hidden"
              style={{
                top: HEADER_HEIGHT,
                height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              }}
              onClick={closeMenu}
            />

            {/* Mobile Dropdown */}

            <motion.div
              ref={menuRef}
              initial={{
                opacity: 0,
                y: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.25,
              }}
              className="fixed left-0 w-full bg-[#040816] border-t border-white/10 z-50 xl:hidden overflow-y-auto"
              style={{
                top: HEADER_HEIGHT,
                maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              }}
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                {/* Mobile Navigation Links */}

                {navLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={20} />

                      <span className="text-base font-medium">
                        {link.name}
                      </span>
                    </NavLink>
                  );
                })}

                {/* ─────────────────────────────────────────────
                    Mobile Auth
                ───────────────────────────────────────────── */}

                {!isAuthenticated ? (
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="ml-4 px-6 py-2.5 rounded-lg text-black font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 bg-[linear-gradient(90deg,#22d3ee,#2563eb)]"
                  >
                    Login
                  </NavLink>
                ) : (
                  <div className="ml-4 relative">
                    {/* Mobile Profile Button */}

                    <button
                      type="button"
                      onClick={() =>
                        setIsProfileOpen(
                          (prev) => !prev
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300"
                      aria-expanded={
                        isProfileOpen
                      }
                    >
                      <div className="flex items-center gap-3">
                        {renderAvatar(
                          "w-10 h-10"
                        )}

                        <span className="text-white text-sm font-semibold">
                          {userName}
                        </span>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-300 ${
                          isProfileOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Profile Dropdown */}

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={
                              handleDashboard
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <LayoutDashboard
                              size={18}
                              className="text-cyan-400"
                            />

                            <span>
                              My Dashboard
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleLogout
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors border-t border-white/5"
                          >
                            <LogOut
                              size={18}
                            />

                            <span>
                              Logout
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
