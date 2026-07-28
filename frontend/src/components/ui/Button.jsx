export default function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
  }) {
    const variants = {
      primary: "bg-wellness-slate text-white hover:bg-[#2e4747]",
      secondary:
        "border border-wellness-teal/20 bg-white text-wellness-slate hover:bg-wellness-mist",
      danger:
        "bg-wellness-mauve text-white hover:bg-[#8A3444]",
    };
  
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`
          inline-flex items-center justify-center
          py-3 px-5
          rounded-xl
          font-semibold
          transition-all
          duration-300
          shadow-[0_8px_18px_rgba(57,86,86,.12)]
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
