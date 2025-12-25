import Header from "@/components/header";
import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header className="h-[65px] shrink-0 mb-[100px]" />

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
