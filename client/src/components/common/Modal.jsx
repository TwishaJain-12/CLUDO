import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/helpers";
import { useTheme } from "../../context/ThemeContext";

/**
 * Modal Component
 * Centered modal with backdrop
 * Uses React Portal to render outside parent DOM hierarchy
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
}) => {
  // All hooks must be called before any early returns (Rules of Hooks)
  const { isDark } = useTheme();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full bg-dark-800 rounded-2xl shadow-xl border border-dark-700 animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 sticky top-0 bg-dark-800 z-10 ">
            {title && (
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`rounded-lg p-2 text-center cursor-pointer transition-all duration-200 ${isDark
                  ? "border-primary-500 bg-primary-500/10 text-dark-400 hover:text-white hover:bg-dark-700"
                  : "border-dark-600 dark:border-dark-600 hover:border-primary-500 hover:bg-primary-500/5 dark:hover:bg-primary-500/10"
                  }}`}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Use portal to render modal to document.body
  return createPortal(modalContent, document.body);
};

export default Modal;
