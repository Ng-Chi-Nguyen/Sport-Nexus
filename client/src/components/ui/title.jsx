const TitleManagement = (props) => {
  const { children, color } = props;
  const colorMap = {
    blue: "blue",
    orange: "orange",
    emerald: "emerald",
    red: "red",
  };

  const selectedColor = colorMap[color] || colorMap.blue;
  console.log(selectedColor);
  return (
    <>
      <h3
        className={`font-black text-[11px] uppercase border-b-2 border-${selectedColor}-500 
        pb-2 mb-4 flex items-center gap-2 text-${selectedColor}-600`}
      >
        <span className={`w-2 h-4 bg-${selectedColor}-500`}></span> {children}
      </h3>
    </>
  );
};

export { TitleManagement };
