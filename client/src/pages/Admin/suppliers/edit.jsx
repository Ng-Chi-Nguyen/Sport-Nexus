import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý chuổi cung ứng",
    route: "",
  },
  {
    title: "Nhà cung cấp",
    route: "/management/suppliers",
  },
  {
    title: "Chỉnh sữa nhà cung cấp",
    route: "",
  },
];

const EditSupplierPage = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  const supplier = response.data;
  console.log(supplier);
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa nhà cung cấp</h2>
      {/* <div className="flex items-start gap-4">
        <form
          onSubmit={handleSubmit}
          className="flex border border-gray-200 rounded-[10px] w-fit p-4 gap-3"
        >
          <div className="flex flex-col items-center w-full md:w-1/4">
            <InputFile
              label="Logo nhà cung cấp"
              value={logo}
              onChange={(file) => setLogo(file)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <p className="font-bold text-[#323232] mb-4 border-b border-gray-100 pb-2">
                Thông tin người liên hệ mua hàng
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-[48%]">
                  <FloatingInput
                    id="name"
                    label="Tên nhà cung cấp"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[48%]">
                  <FloatingInput
                    id="contact_person"
                    label="Tên người đại diện"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[48%]">
                  <FloatingInput
                    id="email"
                    label="Email liên hệ"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[48%]">
                  <FloatingInput
                    id="phone"
                    label="Số điện thoại"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
              <p className="font-bold text-[#323232] mb-4">
                Địa chỉ kho/văn phòng nhà cung cấp
              </p>
              <AddressSelector onAddressChange={handleAddressChange} />
              {ward && (
                <div className="mt-4 text-sm text-[#4facf3] font-medium italic">
                  Địa chỉ: {ward}, {province}
                </div>
              )}
              <div className="w-full mt-5">
                <FloatingInput
                  id="specific_address"
                  label="Địa chỉ chi tiết"
                  required
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-5 ml-3 mt-4">
              <BtnGoback />
              <BtnSubmit name="Thêm" />
            </div>
          </div>
        </form>
      </div> */}
    </>
  );
};

export default EditSupplierPage;
