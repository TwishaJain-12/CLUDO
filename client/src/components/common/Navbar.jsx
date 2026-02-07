import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import CustomUserMenu from "./CustomUserMenu";
import { useUserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import {
  Home,
  MapPin,
  PlusCircle,
  User,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Navigation Bar Component
 * Responsive with mobile menu (breakpoint at lg/1024px)
 */
const Navbar = () => {
  const location = useLocation();
  const { isAdmin, user } = useUserContext();
  const { toggleTheme, isDark } = useTheme();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/map", label: "Map", icon: MapPin },
    { path: "/satellite-audit", label: "Env. Audit", icon: Globe },
    {
      path: "/report",
      label: "Report Issue",
      icon: PlusCircle,
      authRequired: true,
    },
    { path: "/profile", label: "Profile", icon: User, authRequired: true },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700 navbar-header">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              {/* Mini logo for mobile/compact spaces */}
              <img
                src={isDark ? "/mini-logo.png" : "/mini-logo-light.png"}
                alt="NagarSathi"
                className="h-16 rounded-md"
              />
            </Link>

            {/* Desktop Navigation - visible at lg (1024px) and up */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.authRequired) {
                  return (
                    <SignedIn key={link.path}>
                      <Link
                        to={link.path}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 nav-link ${isActive(link.path)
                          ? "bg-primary-600 text-white"
                          : "text-dark-300 hover:text-white hover:bg-dark-700"
                          }`}
                      >
                        <link.icon size={18} />
                        <span>{link.label}</span>
                      </Link>
                    </SignedIn>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 nav-link ${isActive(link.path)
                      ? "bg-primary-600 text-white"
                      : "text-dark-300 hover:text-white hover:bg-dark-700"
                      }`}
                  >
                    <link.icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Admin Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 nav-link ${isActive("/admin")
                    ? "bg-primary-600 text-white"
                    : "text-amber-400 hover:text-amber-300 hover:bg-dark-700"
                    }`}
                >
                  <LayoutDashboard size={18} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all duration-200 nav-theme-toggle"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* Right Side - Auth & Mobile Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Sign In/Up - Always visible for logged out users */}
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="btn-ghost text-sm hidden sm:inline-flex navbar-signin"
                >
                  Sign In
                </Link>
                <Link to="/sign-up" className="btn-primary text-sm">
                  Get Started
                </Link>
              </SignedOut>

              {/* Logged in user controls */}
              <SignedIn>
                <div className="hidden lg:flex items-center space-x-3 gap-2">
                  <NotificationDropdown />
                  <CustomUserMenu />
                </div>

                {/* Notification Bell & Profile Icon - Mobile/Tablet (below lg) */}
                <div className="lg:hidden flex items-center space-x-2">
                  <NotificationDropdown />
                  <CustomUserMenu />
                </div>
              </SignedIn>

              {/* Mobile Menu Button - visible below lg */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-dark-300 hover:text-white nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer - Slides from right */}
      <div
        className={`fixed top-0 right-0 h-screen w-[280px] bg-dark-900 z-[110] transform transition-transform duration-300 ease-in-out lg:hidden mobile-menu-drawer ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 mobile-menu-header">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors mobile-menu-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              if (link.authRequired) {
                return (
                  <SignedIn key={link.path}>
                    <Link
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg mobile-menu-link ${isActive(link.path)
                        ? "bg-primary-600 text-white"
                        : "text-dark-300 hover:bg-dark-700"
                        }`}
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  </SignedIn>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg mobile-menu-link ${isActive(link.path)
                    ? "bg-primary-600 text-white"
                    : "text-dark-300 hover:bg-dark-700"
                    }`}
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mobile-menu-link ${isActive("/admin")
                  ? "bg-primary-600 text-white"
                  : "text-amber-400 hover:bg-dark-700"
                  }`}
              >
                <LayoutDashboard size={20} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-700 w-full text-left mobile-menu-link"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Logout Button - Mobile */}
            <SignedIn>
              <div className="border-t border-dark-700 mt-4 pt-4">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    signOut();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </SignedIn>

            {/* Sign In Link - Mobile (for signed out users) */}
            <SignedOut>
              <Link
                to="/sign-in"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-700 border-t border-dark-700 mt-4 pt-4 mobile-menu-link"
              >
                <User size={20} />
                <span>Sign In</span>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
