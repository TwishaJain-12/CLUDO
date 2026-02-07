import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

const CustomUserMenu = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-dark-700 transition-all duration-200"
            >
                <img
                    src={user.imageUrl}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-full border border-dark-600"
                />
                <ChevronDown
                    size={16}
                    className={`text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-64 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-dropdown">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-dark-700 bg-dark-900/50">
                        <p className="text-sm font-semibold text-white truncate">
                            {user.fullName || user.username}
                        </p>
                        <p className="text-xs text-dark-400 truncate mt-0.5">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            <User size={18} className="text-primary-400" />
                            <span>My Profile</span>
                        </Link>

                        <Link
                            to="/profile/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            <Settings size={18} className="text-dark-400" />
                            <span>Account Settings</span>
                        </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-dark-700 pt-1 pb-1">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomUserMenu;
