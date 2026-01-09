const SearchTable = (props) => {
  let { placeholder } = props;
  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 table-retro focus:outline-none focus:border-[#4facf3] transition-all"
      />
    </>
  );
};

export { SearchTable };
