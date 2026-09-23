import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <>


      <Header />

      {/* Page content */}
      <main className="relative pt-0 min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}