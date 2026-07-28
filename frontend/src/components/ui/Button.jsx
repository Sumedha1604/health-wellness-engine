export default function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
  }) {
    const variants = {
      primary: "bg-primary text-text hover:brightness-95",
      secondary:
        "bg-white border border-gray-200 hover:bg-gray-50",
      danger:
        "bg-wellness-mauve text-white hover:bg-[#8A3444]",
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
          disabled:cursor-not-allowed
          disabled:opacity-60
          ${variants[variant]}
          ${className}
        `}
      >
        {children}
      </button>
    );
  }
