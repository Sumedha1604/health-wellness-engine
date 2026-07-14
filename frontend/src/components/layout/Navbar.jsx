import {
  Bell,
  Moon,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  function handleLogout() {

    logout();

    navigate("/login");

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

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-semibold">
            {user?.first_name?.charAt(0)}
          </div>

          <div>

            <p className="font-medium">
              {user?.first_name} {user?.last_name}
            </p>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-1"
            >
              <LogOut size={14} />
              Logout
            </button>

          </div>

        </div>

      </div>

    </header>

  );

}