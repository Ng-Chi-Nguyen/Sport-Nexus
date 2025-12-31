import { Footer } from "@/components/footer";

const HomePage = () => {
  const user = localStorage.getItem("user");
  return (
    <>
      <div className="p-8 mt-[100px]">
        <h1 className="text-2xl font-bold">Sport Nexus - Trang Chủ</h1>
        {user ? <>ok</> : <>not ok</>}
      </div>
    </>
  );
};

export default HomePage;
