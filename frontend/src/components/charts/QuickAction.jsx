import Button from "../ui/Button";

export default function QuickAction() {

  return (

    <div
      className="
      bg-white
      rounded-3xl
      p-8
      shadow-card
      "
    >

      <h2 className="text-2xl font-semibold mb-6">

        Quick Actions

      </h2>

      <div className="grid grid-cols-4 gap-4">

        <Button>

          Add Meal

        </Button>

        <Button>

          Log Water

        </Button>

        <Button>

          View Recommendations

        </Button>

        <Button>

          Update Preferences

        </Button>

      </div>

    </div>

  );

}