import { IoMdClose as CloseIcon } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "error";
  message: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = ({
  isOpen,
  onClose,
  status,
  message,
  children,
  footer,
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const isError = status === "error";
  const titleColor = isError ? "text-red-400" : "text-white";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-neutral-700 rounded-lg shadow-2xl w-full max-w-md m-4 p-8 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <CloseIcon size={24} />
        </button>

        {/* Modal Header */}
        <h2 className={`text-xl font-bold text-center ${titleColor}`}>
          {message}
        </h2>

        {/* Main Content Body (passed in as children) */}
        {children && <div className="mt-2">{children}</div>}

        {/* Footer for Action Buttons (passed in as the footer prop) */}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
