import Header from "@/components/header";
import "./App.css";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header className="h-[65px] shrink-0" />

      <main className="flex-1 overflow-hidden">
        <Toaster position="top-right" richColors />
        <Outlet />
      </main>
    </div>
  );
}

export default App;
