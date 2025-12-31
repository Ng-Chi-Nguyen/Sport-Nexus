import React from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Edit3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/footer";

const ProfilePage = () => {
  // 1. Lấy và giải mã dữ liệu từ localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="">
      <p>Hồ sơ cá nhân</p>
      <Footer />
    </div>
  );
};

export default ProfilePage;
