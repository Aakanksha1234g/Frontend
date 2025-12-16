const Loading = ({ showText = true }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[171717]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2 border-white-600"></div>
      {showText && <p className="text-white-500">Loading...</p>}
    </div>
  );
};

export default Loading;
