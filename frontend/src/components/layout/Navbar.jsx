import {
    Bell,
    Moon,
    Search,
  } from "lucide-react";
  
  export default function Navbar() {
    return (
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
  
        <div className="relative">
  
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
  
          <input
            placeholder="Search..."
            className="
              w-80
              rounded-xl
              border
              border-gray-200
              py-3
              pl-12
              pr-4
              outline-none
            "
          />
  
        </div>
  
        <div className="flex items-center gap-5">
  
          <button>
            <Moon size={20} />
          </button>
  
          <button>
            <Bell size={20} />
          </button>
  
          <div className="w-10 h-10 rounded-full bg-primary" />
  
        </div>
  
      </header>
    );
  }