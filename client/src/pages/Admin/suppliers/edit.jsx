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
import { TitleManagement } from "@/components/ui/title";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý chuỗi cung ứng",
    route: "",
  },
  {
    title: "Nhà cung cấp",
    route: "/management/suppliers",
  },
  {
    title: "Chỉnh sửa nhà cung cấp",
    route: "",
  },
];

const EditSupplierPage = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  const supplier = response.data;

  // State dữ liệu cơ bản
  const [contactPerson, setContactPerson] = useState(supplier.contact_person);
  const [name, setName] = useState(supplier.name);
  const [logo, setLogo] = useState(supplier.logo_url);
  const [email, setEmail] = useState(supplier.email);
  const [phone, setPhone] = useState(supplier.phone);

  // Hàm xử lý giải mã location_data an toàn, tránh lỗi sập JSON.parse
  const getInitialLocation = () => {
    const rawData = supplier?.location_data;
    if (!rawData) return { province: "", ward: "", detail: "" };

    // Nếu Backend đã tự động parse thành Object sẵn
    if (typeof rawData === "object") {
      return {
        province: rawData.province || "",
        ward: rawData.ward || "",
        detail: rawData.detail || "",
      };
    }

    // Nếu dữ liệu là dạng chuỗi string
    try {
      const parsed = JSON.parse(rawData);
      return {
        province: parsed?.province || "",
        ward: parsed?.ward || "",
        detail: parsed?.detail || "",
      };
    } catch (error) {
      console.error("Dữ liệu location_data lỗi định dạng JSON:", rawData);
      return { province: "", ward: "", detail: "" };
    }
  };

  const locObj = getInitialLocation();

  // Khởi tạo các state địa chỉ từ object an toàn
  const [province, setProvince] = useState(locObj.province);
  const [ward, setWard] = useState(locObj.ward);
  const [detail, setDetail] = useState(locObj.detail);
  const [address, setAddress] = useState("");

  const handleAddressChange = useCallback((addressData) => {
    setProvince(addressData.province);
    setWard(addressData.ward);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullAddress = `${detail}, ${ward}, ${province}`;
    setAddress(fullAddress);
    const fromData = new FormData();

    if (logo instanceof File) {
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

    try {
      let response = await supplierdApi.update(supplier.id, fromData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sửa nhà cung cấp</h2>
      <div className="flex items-start gap-4">
        <form onSubmit={handleSubmit} className="flex w-fit p-4 gap-3">
          <div className="flex-1 flex flex-col gap-6">
            <div className="border border-gray-200 p-3 rounded-[5px]">
              <TitleManagement color="green">
                Thông tin người liên hệ mua hàng phẩm
              </TitleManagement>
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
              <TitleManagement color="emerald">
                Địa chỉ kho/văn phòng nhà cung cấp
              </TitleManagement>
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
            <TitleManagement color="cyan">
              Logo nhà cung cấp (nếu có)
            </TitleManagement>
            <InputFile value={logo} onChange={(file) => setLogo(file)} />
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
