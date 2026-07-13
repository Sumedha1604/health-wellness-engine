export default function Card({ children }) {
    return (
      <div
        className="
        w-[420px]
        bg-white
        rounded-3xl
        shadow-card
        p-8
        transition-all
        duration-300
        hover:shadow-hover
      "
      >
        {children}
      </div>
    );
  }