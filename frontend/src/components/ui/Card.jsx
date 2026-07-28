export default function Card({ children, className = "" }) {
    return (
      <div
        className="
        wellness-card
        w-full
        p-6
        sm:p-8
        ${className}
      "
      >
        {children}
      </div>
    );
  }
