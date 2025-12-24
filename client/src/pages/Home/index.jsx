import Header from "@/components/Header";
import { useLoaderData } from "react-router-dom";

const HomePage = () => {
  // const homeData = useLoaderData();
  // console.log(homeData)
  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Sport Nexus - Trang Chủ</h1>
      </div>
    </>
  );
};

export default HomePage;
