export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">

      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-3xl
          shadow-card
          p-10
        "
      >
        {children}
      </div>

    </div>
  );
}