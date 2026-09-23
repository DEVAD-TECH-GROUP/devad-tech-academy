import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  GraduationCap,
  Route,
  BadgeDollarSign,
  Building2,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";

const HEADER_HEIGHT = 80;

// Throttle utility
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

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef(null);

  // Scroll effect
  const handleScroll = useCallback(
    throttle(() => {
      setScrolled(window.scrollY > 10);
    }, 16),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Outside click close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
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

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Navigation links
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

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#040816]/98 border-b border-cyan-500/20 shadow-lg shadow-cyan-900/20"
          : "bg-[#040816]/90 border-b border-white/10"
      } backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
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
                    className={`absolute left-0 -bottom-1 h-[2px] w-full bg-gradient-to-r from-cyan-400 to-blue-500 origin-left transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </div>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/login"
            className="ml-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            Enroll Now
          </NavLink>
        </nav>

        {/* Mobile Toggle */}
        <div className="xl:hidden text-white">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 w-full bg-[#040816] border-t border-white/10 z-50 xl:hidden overflow-y-auto"
              style={{
                top: HEADER_HEIGHT,
                maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              }}
            >
              <div className="flex flex-col gap-4 px-6 py-6">
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

                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="mt-4 px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-semibold text-center transition-all active:scale-95"
                >
                  Enroll Now
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}