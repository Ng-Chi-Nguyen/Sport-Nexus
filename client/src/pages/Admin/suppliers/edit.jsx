import { useCallback, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate, useLoaderData } from "react-router-dom";
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
import { TitleManagement } from "@/components/ui/title";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhà cung cấp", route: "/management/suppliers" },
  { title: "Chỉnh sửa nhà cung cấp", route: "" },
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

    if (typeof rawData === "object") {
      return {
        province: rawData.province || "",
        ward: rawData.ward || "",
        detail: rawData.detail || "",
      };
    }

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
      let res = await supplierdApi.update(supplier.id, fromData);
      if (res.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        toast.success(res.message);
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
        Chỉnh sửa nhà cung cấp
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* PHẦN THÔNG TIN CHI TIẾT & ĐỊA CHỈ (BÊN TRÁI) */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="green">
              Thông tin người liên hệ mua hàng phẩm
            </TitleManagement>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <FloatingInput
                  id="name"
                  label="Tên nhà cung cấp"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <FloatingInput
                  id="contact_person"
                  label="Tên người đại diện"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div>
                <FloatingInput
                  id="email"
                  label="Email liên hệ"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
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

          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="emerald">
              Địa chỉ kho/văn phòng nhà cung cấp
            </TitleManagement>
            <div className="mt-3">
              <AddressSelector
                onAddressChange={handleAddressChange}
                initialProvince={province}
                initialWard={ward}
              />
            </div>
            {ward && (
              <div className="mt-4 text-sm text-sky-600 dark:text-[#4facf3] font-medium italic">
                Địa chỉ: {ward}, {province}
              </div>
            )}
            <div className="w-full mt-4">
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

        {/* PHẦN LOGO & NÚT SUBMIT (BÊN PHẢI) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            <TitleManagement color="cyan">
              Logo nhà cung cấp (nếu có)
            </TitleManagement>
            <div className="mt-3">
              <InputFile value={logo} onChange={(file) => setLogo(file)} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200 flex justify-end">
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditSupplierPage;
