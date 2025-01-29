import React, { useState, useEffect } from "react";
import { FaCog } from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuthContext(); // Access user and logout from AuthContext
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close the dropdown on logout or if the user becomes null
  useEffect(() => {
    if (!user) {
      setDropdownOpen(false); // Close the dropdown
    }
  }, [user]);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setDropdownOpen(false);
    };

    if (dropdownOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white relative">
      {/* Left: Company Icon */}
      <div className="flex items-center space-x-2">
        <img
          src="/favicon.ico"
          alt="Company Logo"
          className="h-8 w-8"
        />
        <span className="text-xl font-bold">CompanyName</span>
      </div>

      {/* Right: User Info and Settings */}
      <div className="relative">
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the dropdown from closing when clicked
            toggleDropdown();
          }}
        >
          <span className="text-sm font-medium">
            {user ? user.name : "Guest"}
          </span>
          <FaCog size={20} className="hover:text-gray-400" />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
            <ul className="py-2">
              {user ? (
                <>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Settings
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                    onClick={() => {
                      logout(); // Call logout
                      setDropdownOpen(false); // Close the dropdown
                    }}
                  >
                    Logout
                  </li>
                </>
              ) : (
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-blue-500"
                  onClick={() => {
                    setDropdownOpen(false); // Close the dropdown
                  }}
                >
                  Cerrar
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
