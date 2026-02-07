import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useUserContext } from "./context/UserContext";
import { PageLoader } from "./components/common/Loader";

// Lazy load pages for code splitting (faster initial load)
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const ReportIssue = lazy(() => import("./pages/ReportIssue"));
const IssueDetail = lazy(() => import("./pages/IssueDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const MapPage = lazy(() => import("./pages/MapPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SatelliteAudit = lazy(() => import("./pages/SatelliteAudit"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));

/**
 * Protected Route Component
 * Redirects to sign-in if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { loading } = useUserContext();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

/**
 * Main App Component
 * Handles routing for the entire application
 */
function App() {
  return (
    <Suspense fallback={<PageLoader text="Loading page..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/satellite-audit" element={<SatelliteAudit />} />
        <Route path="/issues/:id" element={<IssueDetail />} />

        {/* Auth Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
