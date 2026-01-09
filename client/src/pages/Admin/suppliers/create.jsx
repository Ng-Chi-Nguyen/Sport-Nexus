import { useCallback, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { InputFile } from "@/components/ui/input";
import { AddressSelector } from "@/components/ui/select";
// api
import supplierdApi from "@/api/management/supplierApi";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhà cung cấp", route: "/management/suppliers" },
  { title: "Thêm nhà cung cấp", route: "" },
];

const CreateSupplierPage = () => {
  const navigate = useNavigate();
  // state form
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // state address
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [detail, setDetail] = useState("");
  const [address, setAddress] = useState("");

  // 2. Hàm callback để nhận dữ liệu từ AddressSelector
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
    // console.log(fullAddress);
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
      let response = await supplierdApi.create(fromData);

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
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
      <h2>Thêm mới nhà cung cấp</h2>
      <div className="flex items-start gap-4">
        <form onSubmit={handleSubmit} className="flex w-fit p-4 gap-3">
          {/* PHẦN THÔNG TIN CHI TIẾT */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="border border-gray-200 p-3 rounded-[5px]">
              <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
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
            {/* PHẦN ĐỊA CHỈ */}
            <div className=" p-4 border border-gray-200 p-3 rounded-[5px]">
              <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-[#4facf3]"></span> Địa chỉ kho/văn
                phòng nhà cung cấp
              </h3>
              {/* 3. Truyền hàm handleAddressChange vào component con */}
              <AddressSelector onAddressChange={handleAddressChange} />

              {/* Hiển thị kết quả đã chọn (Gọn lại) */}
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
              label="Logo nhà cung cấp (nếu có)"
              value={logo}
              onChange={(file) => setLogo(file)}
            />
            <div className="mt-10">
              <Submit_GoBack />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateSupplierPage;
