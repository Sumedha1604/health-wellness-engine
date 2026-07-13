import MainLayout from "./components/layout/MainLayout";
import Card from "./components/ui/Card";

export default function App() {
  return (
    <MainLayout>

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <Card>
          <h2 className="text-xl font-semibold">
            Calories
          </h2>

          <p className="mt-4 text-4xl font-bold">
            1820
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">
            Protein
          </h2>

          <p className="mt-4 text-4xl font-bold">
            125g
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">
            Water
          </h2>

          <p className="mt-4 text-4xl font-bold">
            2.1L
          </p>
        </Card>

      </div>

    </MainLayout>
  );
}