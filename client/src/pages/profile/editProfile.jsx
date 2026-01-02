import { FloatingInput } from "@/components/ui/input";
import { InputFile } from "@/components/ui/input";
import { BtnSubmit, BtnGoback } from "@/components/ui/button";

const EditProfile = () => {
  return (
    <>
      <div className="relative z-10">
        <h2>Chỉnh sữa thông tin</h2>
        <form className="mt-4 flex mx-4">
          <div className="w-fit h-fit mr-4  border-4 border-primary rounded-[50%]">
            <InputFile />
          </div>
          <div className="flex flex-col w-2/3 gap-3 mt-3">
            <div className="">
              <FloatingInput id="1" label="Họ tên" />
            </div>
            <div className="">
              <FloatingInput id="1" label="email" />
            </div>
            <div className="">
              <FloatingInput id="1" label="Số điện thoại" />
            </div>
            <div className="flex gap-2">
              <div className="">
                <BtnSubmit name="Chỉnh sữa" />
              </div>
              <div className="">
                <BtnGoback />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
