export default function PageContainer({ children }) {
    return (
      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    );
  }