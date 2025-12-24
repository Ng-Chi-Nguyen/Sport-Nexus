import { useLoaderData } from "react-router-dom";

const HomePage = () => {
    const homeData = useLoaderData();
    console.log(homeData)
    return (
        <>
            <div className="p-8">
                <h1 className="text-2xl font-bold">Sport Nexus - Trang Chủ</h1>
                
                {/* 3. Hiển thị dữ liệu */}
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    {homeData ? (
                        <p className="text-green-600 font-semibold">{homeData}</p>
                    ) : (
                        <p className="text-red-500">Chưa có dữ liệu từ Server</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default HomePage;