export default function Input(props) {
    return (
      <input
        {...props}
        className="
          w-full
          rounded-xl
          border
          border-gray-200
          px-4
          py-3
          outline-none
          transition-all
          focus:ring-2
          focus:ring-primary
        "
      />
    );
  }