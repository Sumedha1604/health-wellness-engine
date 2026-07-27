export default function PageContainer({ children }) {
    return (
      <main className="min-w-0 flex-1 overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    );
  }
