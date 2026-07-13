export default function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
  }) {
    const variants = {
      primary: "bg-primary text-text hover:brightness-95",
      secondary:
        "bg-white border border-gray-200 hover:bg-gray-50",
      danger:
        "bg-red-400 text-white hover:bg-red-500",
    };
  
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`
          w-full
          py-3
          rounded-xl
          font-medium
          transition-all
          duration-300
          shadow-card
          hover:-translate-y-0.5
          active:scale-95
          ${variants[variant]}
        `}
      >
        {children}
      </button>
    );
  }