const SearchTable = (props) => {
  let { placeholder } = props;
  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-3 border-2 border-[#323232] rounded-[5px] shadow-[4px_4px_0px_0px_#323232] focus:outline-none focus:border-[#4facf3] transition-all"
      />
    </>
  );
};

export { SearchTable };
