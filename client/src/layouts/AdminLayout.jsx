import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-[calc(100vh-65px)]">
      <div className="w-[20%] bg-slate-100 border border-red-400 sticky top-0">
        SideBar
      </div>
      <div className="flex-1 flex flex-col border border-blue-400">
        <div className="h-16 border-b border-green-400 flex items-center">
          Header Admin
        </div>

        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
