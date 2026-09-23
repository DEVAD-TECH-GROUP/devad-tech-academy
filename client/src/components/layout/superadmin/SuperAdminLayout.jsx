import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";
import SuperAdminBottomNav from "./SuperAdminBottomNav";
import useUIStore from "../../../store/uiStore";

export default function SuperAdminLayout() {
  const { mobileDrawer, closeMobileDrawer } = useUIStore();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {mobileDrawer && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden fade-ov" onClick={closeMobileDrawer} />
      )}
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <SuperAdminBottomNav />
    </div>
  );
}