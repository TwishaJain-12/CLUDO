import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Map,
  AlertCircle,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import IssueCard from "../components/issues/IssueCard";
import IssueFilters from "../components/issues/IssueFilters";
import Button from "../components/common/Button";
import { CardSkeletonList } from "../components/common/Loader";
import { useIssues } from "../hooks/useIssues";
import ActionAdSidebar from "../components/home/ActionAdSidebar";

/**
 * Home Page Component
 * Main feed showing all issues
 */
const Home = () => {
  const location = useLocation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const {
    issues,
    loading,
    error,
    pagination,
    params,
    updateParams,
    resetParams,
    goToPage,
    refetch,
  } = useIssues(location.state?.filters || { limit: 10 });

  // Check if any filters are active
  const hasActiveFilters =
    params.category ||
    params.status ||
    params.search ||
    params.state ||
    params.district;

  return (
    <div className="h-screen bg-dark-900 flex flex-col pt-16">
      <Navbar />

      {/* Mobile Filter Drawer Overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-dark-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
          <IssueFilters
            params={params}
            onFilterChange={(newParams) => {
              updateParams(newParams);
            }}
            onReset={() => {
              resetParams();
              setMobileFiltersOpen(false);
            }}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        {/* Header - Fixed at top */}
        <div className="home-header flex flex-row items-center justify-between gap-2 mb-4 flex-shrink-0">
          <div className="flex lg:hidden items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Issue Feed
            </h1>
            <span className="text-dark-500">•</span>
            <p className="text-dark-400 text-sm">
              {pagination.total} issues
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl border transition-all duration-200 ${hasActiveFilters
                ? "bg-primary-600/20 border-primary-500/50 text-primary-400"
                : "bg-dark-800 border-dark-700 text-dark-300 hover:text-white hover:border-dark-600"
                }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden md:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary-400" />
              )}
            </button>
            <Link to="/map" state={{ filters: params }} className="lg:hidden">
              <Button variant="secondary" icon={Map} className="!px-3 md:!px-4">
                <span className="hidden md:inline">Map View</span>
              </Button>
            </Link>
            <SignedIn>
              <Link to="/report" className="lg:hidden">
                <Button icon={Plus} className="!px-3 md:!px-4">
                  <span className="hidden md:inline">Report Issue</span>
                </Button>
              </Link>
            </SignedIn>
            {/*<SignedOut>
              <Link to="/sign-in">
                <Button color="white" className="!px-3 md:!px-4 btn-primary">
                  <Plus className="!text-white" size={18} />
                  <span className="hidden md:inline !text-white">Sign In</span>
                </Button>
              </Link>
            </SignedOut>*/}
          </div>
        </div>

        {/* Main Content with Sidebar Layout - Takes remaining height */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Left Sidebar - Filters (Desktop only, fixed width, scrolls internally) */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0 order-1 overflow-y-auto scrollbar-hide">
            <IssueFilters
              params={params}
              onFilterChange={updateParams}
              onReset={resetParams}
            />
          </aside>

          {/* Center Content - Issue List (scrollable feed) */}
          <div className="flex-1 min-w-0 order-1 lg:order-2 overflow-y-auto scrollbar-hide">
            <div className="max-w-[1280px] mx-auto">
              {loading ? (
                <CardSkeletonList count={5} />
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
                  <AlertCircle
                    size={40}
                    className="text-red-400 mx-auto mb-3"
                  />
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button variant="secondary" onClick={refetch}>
                    Try Again
                  </Button>
                </div>
              ) : issues.length === 0 ? (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                  <MapPin size={48} className="text-dark-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Issues Found
                  </h3>
                  <p className="text-dark-400 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results."
                      : "Be the first to report an issue in your community!"}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="secondary" onClick={resetParams}>
                      Clear Filters
                    </Button>
                  ) : (
                    <SignedIn>
                      <Link to="/report">
                        <Button icon={Plus}>Report Issue</Button>
                      </Link>
                    </SignedIn>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                    {issues.map((issue) => (
                      <IssueCard key={issue._id} issue={issue} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10 pb-4">
                      <Button
                        variant="secondary"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-dark-400 px-4">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar - Action Ads (Desktop Only) */}
          <aside className="hidden xl:block w-[300px] flex-shrink-0 order-3 overflow-y-auto scrollbar-hide">
            <ActionAdSidebar />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Home;
