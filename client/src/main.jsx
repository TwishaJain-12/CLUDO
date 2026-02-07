import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// Get Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

// Theme-aware Clerk appearance getter
const getClerkAppearance = (isDark) => ({
  baseTheme: undefined,
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: isDark ? "#0f172a" : "#ffffff",
    colorText: isDark ? "#f1f5f9" : "#0f172a",
    colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
    colorInputBackground: isDark ? "#1e293b" : "#ffffff",
    colorInputText: isDark ? "#f1f5f9" : "#0f172a",
    colorInputFocus: "#3b82f6",
    colorNeutral: isDark ? "#334155" : "#e2e8f0",
    colorDanger: "#ef4444",
    colorSuccess: "#10b981",
    borderRadius: "0.75rem",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "1rem",
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    spacingUnit: "0.25rem",
  },
  elements: {
    rootBox: "w-full max-w-md mx-auto",
    card: isDark
      ? "bg-dark-800 border border-dark-700 rounded-xl shadow-xl !p-0"
      : "bg-white border border-gray-200 rounded-xl shadow-xl !p-0",
    headerTitle: isDark
      ? "text-white text-2xl sm:text-3xl font-bold mb-2"
      : "text-gray-900 text-2xl sm:text-3xl font-bold mb-2",
    headerSubtitle: isDark
      ? "text-dark-400 text-sm sm:text-base mb-6"
      : "text-gray-500 text-sm sm:text-base mb-6",
    socialButtonsBlockButton: isDark
      ? "bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white transition-all duration-200 rounded-lg"
      : "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-all duration-200 rounded-lg",
    socialButtonsBlockButtonText: isDark
      ? "text-white font-medium"
      : "text-gray-700 font-medium",
    formFieldLabel: isDark
      ? "text-dark-300 text-sm font-medium mb-2"
      : "text-gray-600 text-sm font-medium mb-2",
    formFieldInput: isDark
      ? "bg-dark-800 border border-dark-600 text-white placeholder:text-dark-400 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
      : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200",
    formButtonPrimary:
      "bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
    formButtonReset: isDark
      ? "text-dark-400 hover:text-white transition-colors duration-200"
      : "text-gray-500 hover:text-gray-900 transition-colors duration-200",
    footerActionLink:
      "text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200",
    footerActionText: isDark ? "text-dark-400 text-sm" : "text-gray-500 text-sm",
    identityPreviewText: isDark ? "text-white" : "text-gray-900",
    identityPreviewEditButton: "text-primary-400 hover:text-primary-300",
    formResendCodeLink: "text-primary-400 hover:text-primary-300",
    otpCodeFieldInput: isDark
      ? "bg-dark-800 border border-dark-600 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : "bg-white border border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
    dividerLine: isDark ? "bg-dark-700" : "bg-gray-200",
    dividerText: isDark ? "text-dark-400" : "text-gray-400",
    alertText: isDark ? "text-dark-300" : "text-gray-600",
    formFieldErrorText: "text-red-400 text-sm mt-1",
    formFieldSuccessText: "text-green-400 text-sm mt-1",
    // UserButton popover styles
    userButtonPopoverCard: isDark
      ? "bg-dark-800 border border-dark-700"
      : "bg-white border border-gray-200",
    userButtonPopoverActionButton: isDark
      ? "text-white hover:bg-dark-700"
      : "text-gray-700 hover:bg-gray-100",
    userButtonPopoverActionButtonText: isDark ? "text-white" : "text-gray-700",
    userButtonPopoverActionButtonIcon: isDark
      ? "text-dark-400"
      : "text-gray-500",
    userButtonPopoverFooter: isDark
      ? "bg-dark-900 border-t border-dark-700"
      : "bg-gray-50 border-t border-gray-200",
    userPreviewMainIdentifier: isDark ? "text-white" : "text-gray-900",
    userPreviewSecondaryIdentifier: isDark ? "text-dark-400" : "text-gray-500",
    // Modal styles
    modalContent: isDark
      ? "bg-dark-900 border border-dark-700 rounded-xl max-w-[800px]"
      : "bg-white border border-gray-200 rounded-xl max-w-[800px]",
    modalCloseButton: isDark
      ? "text-dark-400 hover:text-white hover:bg-dark-700"
      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100",
    // User profile root
    userProfileRoot: isDark
      ? "bg-dark-900"
      : "bg-gray-50",
    // Navbar/sidebar styles
    navbar: isDark
      ? "bg-dark-900 border-r border-dark-700 p-4"
      : "bg-gray-50 border-r border-gray-200 p-4",
    navbarButton: isDark
      ? "text-dark-300 hover:bg-dark-700 hover:text-white rounded-lg px-3 py-2"
      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-lg px-3 py-2",
    navbarButtonIcon: isDark ? "text-dark-400" : "text-gray-500",
    // Page content styles
    pageScrollBox: isDark
      ? "bg-dark-900 p-6"
      : "bg-gray-50 p-6",
    page: isDark ? "bg-dark-900" : "bg-gray-50",
    // Profile sections
    profileSection: isDark
      ? "bg-dark-800 border border-dark-700 rounded-lg p-5 mb-4"
      : "bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm",
    profileSectionHeader: isDark
      ? "border-b border-dark-700 pb-3 mb-4"
      : "border-b border-gray-200 pb-3 mb-4",
    profileSectionTitle: isDark
      ? "text-white font-semibold"
      : "text-gray-900 font-semibold",
    profileSectionTitleText: isDark
      ? "text-white"
      : "text-gray-900",
    profileSectionSubtitle: isDark
      ? "text-dark-400 text-sm"
      : "text-gray-500 text-sm",
    profileSectionContent: isDark
      ? "text-dark-300"
      : "text-gray-600",
    profileSectionPrimaryButton:
      "bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg",
    // Accordion styles
    accordionTriggerButton: isDark
      ? "bg-dark-800 border border-dark-700 text-white hover:bg-dark-700 rounded-lg"
      : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-lg",
    accordionContent: isDark
      ? "bg-dark-800 border border-dark-700"
      : "bg-white border border-gray-200",
    // Headers
    headerTitle: isDark
      ? "text-white text-xl font-bold mb-4"
      : "text-gray-900 text-xl font-bold mb-4",
    headerSubtitle: isDark
      ? "text-dark-400 text-sm mb-6"
      : "text-gray-500 text-sm mb-6",
  },
});

// Theme-aware Clerk wrapper component
const ThemedClerkProvider = ({ children }) => {
  const { isDark } = useTheme();
  const appearance = getClerkAppearance(isDark);

  return (
    <ClerkProvider publishableKey={clerkPubKey} appearance={appearance}>
      {children}
    </ClerkProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ThemeProvider>
          <ThemedClerkProvider>
            <UserProvider>
              <NotificationProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "#1e293b",
                      color: "#f1f5f9",
                      border: "1px solid #334155",
                    },
                    success: {
                      iconTheme: {
                        primary: "#10b981",
                        secondary: "#f1f5f9",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#ef4444",
                        secondary: "#f1f5f9",
                      },
                    },
                  }}
                />
              </NotificationProvider>
            </UserProvider>
          </ThemedClerkProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

