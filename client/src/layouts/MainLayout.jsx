import { Outlet } from "react-router-dom";
import ScrollToTop from "../utils/Scroll"
import Header from "../components/layout/public/Header";
import Footer from "../components/layout/public/Footer";

export default function MainLayout() {
  return (
    <>

      <ScrollToTop />
      <Header />

      {/* Page content */}
      <main className="relative pt-0 min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}