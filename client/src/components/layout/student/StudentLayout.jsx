import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import StudentBottomNav from "./StudentBottomNav";
import useUIStore from "../../../store/uiStore";

export default function StudentLayout() {
  const { mobileDrawer, closeMobileDrawer } = useUIStore();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Mobile overlay */}
      {mobileDrawer && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden fade-ov"
          onClick={closeMobileDrawer}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <StudentTopbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <StudentBottomNav />
    </div>
  );
}
