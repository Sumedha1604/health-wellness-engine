import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {

    logout();

    navigate("/login");

  }

  function handleGoToProfile() {
    setIsMenuOpen(false);
    navigate("/profile");
  }

  return (

    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">

      <div>

        <h2 className="text-2xl font-semibold">
          Dashboard
        </h2>

      </div>

      <div className="flex items-center gap-6">

        <button className="hover:opacity-70 transition">
          <Moon size={20} />
        </button>

        <button className="hover:opacity-70 transition">
          <Bell size={20} />
        </button>

        <div className="relative" ref={menuRef}>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="
              flex items-center gap-3
              rounded-xl
              px-2 py-1.5
              transition-colors duration-200
              hover:bg-green-50
            "
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
              {user?.first_name?.charAt(0)}
            </span>

            <div className="text-left">
              <p className="font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen && (
            <div
              className="
                absolute right-0 top-full mt-2 w-56
                bg-white
                rounded-2xl
                shadow-card
                border border-gray-100
                p-2
                z-50
              "
            >
              <button
                onClick={handleGoToProfile}
                className="
                  flex w-full items-center gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-sm font-medium text-gray-700
                  transition-colors duration-200
                  hover:bg-green-50
                "
              >
                <User className="h-4 w-4 text-green-600" strokeWidth={2} />
                Go to Profile
              </button>

              <button
                onClick={handleLogout}
                className="
                  flex w-full items-center gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-sm font-medium text-gray-700
                  transition-colors duration-200
                  hover:bg-red-50 hover:text-red-500
                "
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Logout
              </button>
            </div>
          )}

        </div>

      </div>

    </header>

  );

}