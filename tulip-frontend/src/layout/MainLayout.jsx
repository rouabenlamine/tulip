import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
console.log("MainLayout rendered");

export default function MainLayout() {
  return (
    <div className="flex min-h-screen w-full font-poppins bg-transparent overflow-visible m-0 p-0">
      {/* ensure sidebar uses its own flex sizing */}
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 m-0 p-0 border-l-4 border-red-500">
        {/* Debug banner to confirm layout mounts */}
        
        <Outlet />
      </main>
    </div>
  );
}
