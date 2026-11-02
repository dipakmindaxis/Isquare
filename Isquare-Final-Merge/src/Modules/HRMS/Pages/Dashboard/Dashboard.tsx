import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startSignalRConnection, stopSignalRConnection } from "../../Services/signalRService";
import type { AppDispatch } from "../../../../store";
import { useAuth } from "../../../../hooks/useAuth";
import Sidebar from "../../../../Components/Sidebar";
import Navbar from "../../../../Components/Navbar";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useAuth();

   useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, starting SignalR connection...");
      startSignalRConnection(dispatch);
    }
    return () => {
      console.log("Dashboard layout unmounting, stopping SignalR connection...");
      stopSignalRConnection();
    };
  }, [isAuthenticated, dispatch]);
    
  return (
    <div className="flex h-screen bg-[#EDF3FF]">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#EDF3FF]">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300 bg-[#EDF3FF]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

