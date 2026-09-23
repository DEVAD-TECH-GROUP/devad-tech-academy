import { Outlet } from "react-router-dom";
import InstructorSidebar from "./InstructorSidebar";
import InstructorTopbar from "./InstructorTopbar";
import InstructorBottomNav from "./InstructorBottomNav";
import useUIStore from "../../../store/uiStore";

export default function InstructorLayout() {
  const { mobileDrawer, closeMobileDrawer } = useUIStore();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {mobileDrawer && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden fade-ov" onClick={closeMobileDrawer} />
      )}
      <InstructorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <InstructorTopbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <InstructorBottomNav />
    </div>
  );
}