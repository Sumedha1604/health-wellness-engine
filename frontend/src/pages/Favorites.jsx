import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Trash2, Flame, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getFavorites, deleteFavorite } from "../services/favorite.service";

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError(null);
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your favorite meals.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(favorite) {
    try {
      await deleteFavorite(favorite.favorite_id);
      toast.success("Removed from favorites.");
      setFavorites((prev) =>
        prev.filter((item) => item.favorite_id !== favorite.favorite_id)
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to remove favorite."
      );
    }
  }

  function formatCalories(calories) {
    return `${Math.round(calories)} kcal`;
  }

  function formatQuantity(quantity) {
    return Number(quantity) === 1
      ? "1 serving"
      : `${quantity} servings`;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Favorite Meals
        </h1>
        <p className="mt-2 text-gray-500 text-lg">
          Your saved meals for quick access.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[520px] items-center justify-center rounded-3xl bg-white shadow-card">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" strokeWidth={2} />
            <p className="text-base font-semibold text-gray-800">
              Loading favorites...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[520px] items-center justify-center rounded-3xl bg-white shadow-card">
          <div className="max-w-md px-8 text-center">
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button
              type="button"
              onClick={loadFavorites}
              className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[520px] items-center justify-center rounded-3xl bg-white shadow-card">
          <div className="max-w-md px-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-8 text-3xl font-semibold text-gray-900">
              No favorites yet
            </h2>
            <p className="mt-3 text-gray-500">
              Save your favorite meals to find them here.
            </p>
            <button
              onClick={() => navigate("/meal-plans")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-green-700 hover:shadow-lg"
            >
              Browse Meal Plans
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.favorite_id}
              className="
                bg-white
                border border-gray-100
                rounded-3xl
                shadow-card
                p-6
                transition-all duration-200
                hover:shadow-lg
                hover:-translate-y-0.5
              "
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                  <Heart className="h-5 w-5 text-green-600 fill-green-600" strokeWidth={2} />
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                  <Flame className="h-4 w-4" strokeWidth={2} />
                  {formatCalories(favorite.caloric_value)}
                </span>
              </div>

              {/* Content */}
              <h3 className="mt-5 text-xl font-bold text-gray-900 tracking-tight truncate">
                {favorite.food_name}
              </h3>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {favorite.meal_type && (
                  <span
                    className="
                      px-3 py-1
                      rounded-full
                      bg-green-100
                      text-green-700
                      text-sm font-medium
                    "
                  >
                    {favorite.meal_type}
                  </span>
                )}
                {favorite.quantity != null && (
                  <span className="text-sm text-gray-500">
                    {formatQuantity(favorite.quantity)}
                  </span>
                )}
              </div>

              {favorite.meal_date && (
                <p className="mt-2 text-sm text-gray-400">
                  {formatDate(favorite.meal_date)}
                </p>
              )}

              {/* Bottom */}
              <button
                onClick={() => handleRemove(favorite)}
                className="
                  mt-6 w-full
                  flex items-center justify-center gap-2
                  rounded-xl
                  bg-red-50
                  text-red-600
                  font-medium text-sm
                  py-2.5
                  transition-colors duration-200
                  hover:bg-red-100
                "
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}