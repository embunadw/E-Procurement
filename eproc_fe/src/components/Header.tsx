import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";


type HeaderProps = {
  onLogout: () => void;
  userName: string;
};

function Header({ onLogout, userName }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="header fixed top-0 z-10 left-0 right-0 flex items-center shrink-0 bg-[#fefefe] dark:bg-coal-500 shadow-sm dark:border-b dark:border-b-coal-100"
      id="header"
    >
      <div className="container-fixed flex justify-between items-center px-4 py-2 lg:gap-4 w-full max-w-screen-xl mx-auto">
        {/* Left side */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            
          </h1>
        </div>

        {/* Right side */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={open}
          >
            Hello, {userName}
            <svg
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-coal-600 border border-gray-200 dark:border-coal-400 rounded-md shadow-lg py-1 z-20">
              <button
  onClick={async () => {
    setOpen(false);
   const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (result.isConfirmed) {
      onLogout();
    }
  }}
  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-coal-500"
  type="button"
>
  Log out
</button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
