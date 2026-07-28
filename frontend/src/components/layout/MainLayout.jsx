import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageContainer from "./PageContainer";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <PageContainer>

          {children}

        </PageContainer>

      </div>

    </div>
  );
}
