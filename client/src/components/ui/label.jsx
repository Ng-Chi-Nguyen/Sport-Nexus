const Label = (props) => {
  let { name, notNull } = props;
  return (
    <>
      <label className="font-bold transition-colors text-[12px] bg-[#FFF] mb-[-9px] z-[3] w-fit ml-2 peer-focus:text-blue-600">
        {name}
        {notNull ? <span className="text-red-500">*</span> : <></>}
      </label>
    </>
  );
};

export default Label;
