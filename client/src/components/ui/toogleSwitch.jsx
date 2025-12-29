const ToogleSwitchBlue3D = (props) => {
  let { checked, onChange } = props;
  // console.log(checked);
  return (
    <>
      <label className="relative inline-flex cursor-pointer select-none">
        {/* Input Checkbox (ẩn nhưng vẫn hoạt động) */}
        <input
          type="checkbox"
          checked={checked} // Thay đổi ở đây
          onChange={onChange}
          readOnly
          className="sr-only peer"
        />

        {/* Thanh Slider (Track) */}
        <div
          className="
            w-10 h-5 
            bg-white 
            border-2 border-[#323232] 
            rounded-[5px] 
            shadow-[4px_4px_0px_0px_#323232] 
            transition-all duration-300
            peer-checked:bg-[#4facf3]
        "
        ></div>

        {/* Nút tròn/vuông (Thumb) */}
        <div
          className="
            absolute left-[2px] top-[-2px] 
            w-5 h-5
            bg-white 
            border-2 border-[#323232] 
            rounded-[5px] 
            shadow-[0_3px_0_0_#323232] 
            transition-all duration-300
            peer-checked:translate-x-4
            peer-checked:shadow-none 
            peer-checked:translate-y-[2px]
        "
        ></div>
      </label>
    </>
  );
};

export { ToogleSwitchBlue3D };
