import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#eef6ff] text-slate-900">
      <Sidebar />

      <div className="theme-page min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(105,181,35,0.18),_transparent_28%),linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_48%,_#f4f9f0_100%)]">
        <Navbar />

        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
