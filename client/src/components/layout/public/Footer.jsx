import { useNavigate } from "react-router-dom";
import {
  Code2,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  Palette,
  Smartphone,
  Server,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

import logo from "../../assets/logo.png";
import { COURSES } from "../../data/course";

const courseIcons = {
  "full-stack":       Code2,
  "ai-ml-engineering": BrainCircuit,
  "cybersecurity":    ShieldCheck,
  "data-analytics":   BarChart3,
  "ui-ux-design":     Palette,
  "mobile-app-dev":   Smartphone,
  "frontend-dev":     Code2,
  "backend-dev":      Server,
};

const quickLinks = [
  { label: "Home",    path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "About",   path: "/about" },
  { label: "Contact", path: "/contact" },
];

const socialLinks = [
  { icon: FaFacebookF, href: "#",                            label: "Facebook" },
  { icon: FaInstagram, href: "https://www.instagram.com/devadtechnologies",                            label: "Instagram" },
  { icon: FaXTwitter,  href: "#",                            label: "X" },
  { icon: FaYoutube,   href: "#",                            label: "YouTube" },
  { icon: FaWhatsapp,  href: "https://wa.me/2348106551348",  label: "WhatsApp" },
  { icon: FaLinkedinIn,href: "#",                            label: "LinkedIn" },
];

export default function Footer() {
  const navigate = useNavigate();

  const visibleCourses = COURSES.filter((c) => c.status === "active").slice(0, 8);

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Top Grid */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

          {/* ── Brand ── */}
          <div>
            <div className="flex items-center gap-4">
              <img src={logo} alt="Devad Tech Academy" className="h-14 w-auto" />
              <div>
                <h3 className="text-2xl font-bold text-white">Devad Tech Academy</h3>
                <p className="text-sm text-cyan-400">Building Tomorrow's Tech Leaders.</p>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-8 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:border-cyan-500/30 hover:text-cyan-400 hover:-translate-y-1"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Courses ── */}
          <div>
            <h3 className="text-lg font-semibold text-white">Our Courses</h3>
            <ul className="mt-6 space-y-4">
              {visibleCourses.map((course) => {
                const Icon = courseIcons[course.slug] ?? Code2;
                return (
                  <li key={course.slug}>
                    <button
                      onClick={() => navigate(`/courses/${course.slug}`)}
                      className="group flex items-center gap-3 text-slate-400 transition hover:text-cyan-400 text-left w-full"
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{course.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-6 space-y-4">
              {quickLinks.map(({ label, path }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(path)}
                    className="group flex items-center gap-2 text-slate-400 transition hover:text-cyan-400 w-full text-left"
                  >
                    {label}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <Mail size={18} className="mt-1 text-cyan-400 shrink-0" />
                <span className="text-slate-400 break-all">devadacademy@gmail.com</span>
              </div>
              <div className="flex gap-3">
                <Phone size={18} className="mt-1 text-cyan-400 shrink-0" />
                <span className="text-slate-400">+234 810 655 1348</span>
              </div>
              <div className="flex gap-3">
                <MapPin size={18} className="mt-1 text-cyan-400 shrink-0" />
                <span className="text-slate-400">Port Harcourt, Rivers State, Nigeria</span>
              </div>
            </div>

            {/* CTA Card */}
            <div className="mt-8 rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-5">
              <h4 className="font-semibold text-white">Need Help?</h4>
              <p className="mt-2 text-sm text-slate-400">
                Speak with our admissions team and get guidance on choosing the right program.
              </p>
              <a
                href="https://wa.me/2348106551348"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-slate-500 md:text-left">
              © {new Date().getFullYear()} Devad Tech Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => navigate("/privacy")}
                className="text-slate-500 transition hover:text-cyan-400"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-slate-500 transition hover:text-cyan-400"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
