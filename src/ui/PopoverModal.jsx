import Button from "./Button";
import CloseIcon from "@assets/pitch-craft/CloseIcon.svg?react";

export default function PopoverModal({
  isOpen,
  setIsOpen,
  message,
  proceedMsg = "Yes",
  cancelMsg = "Cancel",
  proceedAction,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="relative bg-light-default-main dark:bg-dark-default-main border-2 border-primary-hover rounded-lg w-full max-w-md p-6 text-center">
        {/* Close button */}
        <Button
          type="button"
          className="absolute top-3 right-3 py-2 px-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <CloseIcon />
        </Button>

        {/* Icon */}
        <svg
          className="mx-auto mb-4 text-red-400 w-12 h-12 dark:text-red-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        {/* Message */}
        <h3 className="mb-5 text-lg font-normal text-gray-700 dark:text-gray-300">
          {message}
        </h3>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-red-800"
            onClick={() => {
              proceedAction();
              setIsOpen(false);
            }}
          >
            {proceedMsg}
          </Button>

          <Button
            type="button"
            className="py-2.5 px-5"
            onClick={() => setIsOpen(false)}
          >
            {cancelMsg}
          </Button>
        </div>
      </div>
    </div>
  );
}
