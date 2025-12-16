export default function Spinner({ text = 'Loading' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-black/50 backdrop-blur-md z-70">
      <div className="flex flex-col items-center justify-center bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto gap-4">
        <svg
            className="animate-spin size-10 text-[#175CD3]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p className="mt-3 text-center text-sm text-[#A3A3A3]">
          {text}, please wait...
        </p>
      </div>
    </div>
  );
}
