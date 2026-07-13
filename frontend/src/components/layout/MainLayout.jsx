import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageContainer from "./PageContainer";

export default function MainLayout({ children }) {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <PageContainer>

          {children}

        </PageContainer>

      </div>

    </div>
  );
}