import { useCallback, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { AddressSelector } from "@/components/ui/select";
// api
import supplierdApi from "@/api/management/supplierApi";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";

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
  // stete dữ liệu cũ
  const [contactPerson, setContactPerson] = useState(supplier.contact_person);
  const [name, setName] = useState(supplier.name);
  const [logo, setLogo] = useState(supplier.logo_url);
  const [email, setEmail] = useState(supplier.email);
  const [phone, setPhone] = useState(supplier.phone);
  // Giải mã chuỗi location_data
  const locObj = JSON.parse(supplier.location_data);
  // console.log(locObj);
  const [province, setProvince] = useState(locObj.province);
  const [ward, setWard] = useState(locObj.ward);
  const [detail, setDetail] = useState(locObj.detail);
  const [address, setAddress] = useState("");

  const handleAddressChange = useCallback((addressData) => {
    setProvince(addressData.province);
    setWard(addressData.ward);
    // Log kiểm tra
    // console.log("Tỉnh:", addressData.province);
    // console.log("Xã/Phường:", addressData.ward);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullAddress = `${detail}, ${ward}, ${province}`;
    setAddress(fullAddress);
    const fromData = new FormData();

    if (logo instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      fromData.append("logo_url", logo);
    }
    fromData.append("contact_person", contactPerson);
    fromData.append("email", email);
    fromData.append("phone", phone);
    fromData.append("name", name);

    const locationObj = {
      province: province,
      ward: ward,
      detail: detail,
    };
    fromData.append("location_data", JSON.stringify(locationObj));

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of fromData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      let response = await supplierdApi.update(supplier.id, fromData);
      // console.log(response);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa nhà cung cấp</h2>
      <div className="flex items-start gap-4">
        <form onSubmit={handleSubmit} className="flex w-fit p-4 gap-3">
          <div className="flex-1 flex flex-col gap-6">
            <div className="border border-gray-200 p-3 rounded-[5px]">
              <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin người
                liên hệ mua hàng phẩm
              </h3>
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
            <div className="border border-gray-200 p-3 rounded-[5px]">
              <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-[#4facf3]"></span> Địa chỉ kho/văn
                phòng nhà cung cấp
              </h3>
              <AddressSelector
                onAddressChange={handleAddressChange}
                initialProvince={province}
                initialWard={ward}
              />
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
          </div>
          <div className="border border-gray-200 p-3 rounded-[5px]">
            <InputFile
              label="Logo nhà cung cấp"
              value={logo}
              onChange={(file) => setLogo(file)}
            />
            <div className="mt-[75px]">
              <Submit_GoBack />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSupplierPage;
