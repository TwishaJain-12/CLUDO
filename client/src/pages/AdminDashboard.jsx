import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  AlertTriangle,
  Flag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import IssueTable from "../components/admin/IssueTable";
import AnalyticsWidgets from "../components/admin/AnalyticsWidgets";
import StatusUpdateModal from "../components/admin/StatusUpdateModal";
import GroupedReportsTable from "../components/admin/GroupedReportsTable";
import ReportReviewModal from "../components/admin/ReportReviewModal";
import IssueFilters from "../components/issues/IssueFilters";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import Modal from "../components/common/Modal";
import { useUserContext } from "../context/UserContext";
import { adminApi } from "../services/api";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

/**
 * Admin Dashboard Page
 * Issue management and analytics for admins
 */
const AdminDashboard = () => {
  const { user, isAdmin, loading: userLoading } = useUserContext();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("issues");
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [params, setParams] = useState({ limit: 15 });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    issueId: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Reports state
  const [groupedReports, setGroupedReports] = useState([]);
  const [reportsStats, setReportsStats] = useState({});
  const [reportsPagination, setReportsPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [reportsParams, setReportsParams] = useState({
    limit: 15,
    sortBy: "reportCount",
    minReports: 1,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // Fetch issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllIssues(params);
      setIssues(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await adminApi.getAnalytics({ days: 30 });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Fetch report analytics
  const [reportAnalytics, setReportAnalytics] = useState(null);
  const fetchReportAnalytics = async () => {
    try {
      const response = await adminApi.getReportAnalytics({ days: 30 });
      setReportAnalytics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch report analytics:", error);
    }
  };

  // Fetch grouped reports
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const response = await adminApi.getGroupedReports(reportsParams);
      setGroupedReports(response.data.data);
      setReportsStats(response.data.stats || {});
      setReportsPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
      // Count issues with pending reports
      const pendingCount = response.data.data.reduce(
        (acc, group) => acc + group.pendingCount,
        0
      );
      setPendingReportsCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchIssues();
      fetchAnalytics();
      fetchReportAnalytics();
      fetchReports();
    }
  }, [isAdmin, params]);

  // Refetch reports when params change
  useEffect(() => {
    if (isAdmin && activeTab === "reports") {
      fetchReports();
    }
  }, [reportsParams]);

  // Redirect if not admin
  if (userLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  };

  const handleResetFilters = () => {
    setParams({ limit: 15 });
  };

  const handleStatusUpdate = (issue) => {
    setSelectedIssue(issue);
    setModalOpen(true);
  };

  const handleSubmitStatus = async (issueId, data, isResolution) => {
    try {
      setUpdating(true);

      if (isResolution) {
        await adminApi.resolveIssue(issueId, data);
        toast.success("Issue marked as resolved");
      } else {
        await adminApi.updateIssueStatus(issueId, data);
        toast.success("Status updated");
      }

      setModalOpen(false);
      fetchIssues();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (issueId) => {
    setDeleteConfirmation({ open: true, issueId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.issueId) return;

    try {
      setDeleting(true);
      await adminApi.deleteIssue(deleteConfirmation.issueId);
      toast.success("Issue deleted");
      fetchIssues();
      fetchAnalytics();
      setDeleteConfirmation({ open: false, issueId: null });
    } catch (error) {
      toast.error(error.message || "Failed to delete issue");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "issues", label: "Issues", icon: LayoutDashboard },
    { id: "reports", label: "Reports", icon: Flag, badge: pendingReportsCount },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  // Report handlers
  const handleReportPageChange = (page) => {
    setReportsParams((prev) => ({ ...prev, page }));
  };

  const handleReviewReport = (report) => {
    setSelectedReport(report);
    setReportModalOpen(true);
  };

  const handleDismissReport = async (reportId) => {
    try {
      await adminApi.dismissReport(reportId, { note: "Quick dismissed" });
      toast.success("Report dismissed");
      fetchReports();
    } catch (error) {
      toast.error(error.message || "Failed to dismiss report");
    }
  };

  const handleSubmitReportReview = async (reportId, data) => {
    try {
      setUpdating(true);
      await adminApi.reviewReport(reportId, data);
      toast.success("Report reviewed");
      setReportModalOpen(false);
      fetchReports();
    } catch (error) {
      toast.error(error.message || "Failed to review report");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteIssueFromReport = async (reportId, reviewNote) => {
    try {
      setUpdating(true);
      await adminApi.reviewReport(reportId, {
        status: "action_taken",
        reviewNote: reviewNote || "Issue deleted",
        deleteIssue: true,
      });
      toast.success("Issue deleted and report resolved");
      setReportModalOpen(false);
      fetchReports();
      fetchIssues();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message || "Failed to delete issue");
    } finally {
      setUpdating(false);
    }
  };

  // Check if filters are active for the current tab
  const hasActiveFilters =
    activeTab === "issues"
      ? params.category ||
      params.status ||
      params.search ||
      params.state ||
      params.district
      : reportsParams.category ||
      reportsParams.issueStatus ||
      reportsParams.search;

  return (
    <div className="h-screen bg-dark-900 flex flex-col overflow-hidden pt-16">
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
          {activeTab === "issues" ? (
            <IssueFilters
              params={params}
              onFilterChange={(newParams) => {
                handleFilterChange(newParams);
              }}
              onReset={() => {
                handleResetFilters();
                setMobileFiltersOpen(false);
              }}
            />
          ) : activeTab === "reports" ? (
            <IssueFilters
              params={{
                ...reportsParams,
                status: reportsParams.issueStatus,
              }}
              onFilterChange={(newParams) => {
                const { status: issueStatusFilter, ...rest } = newParams;
                setReportsParams((prev) => ({
                  ...prev,
                  ...rest,
                  issueStatus: issueStatusFilter,
                  page: 1,
                }));
              }}
              onReset={() => {
                setReportsParams({
                  limit: 15,
                  sortBy: "reportCount",
                  minReports: 1,
                });
                setMobileFiltersOpen(false);
              }}
              hideCounts={true}
            />
          ) : null}
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        {/* Header - Centered tabs */}
        <div className="relative flex items-center justify-center gap-2 mb-4 flex-shrink-0">
          {/* Title and Filter button - Left side */}
          <div className="absolute left-0 flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-white">
              Admin
            </h1>
            {(activeTab === "issues" || activeTab === "reports") && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className={`lg:hidden flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all duration-200 ${hasActiveFilters
                  ? "bg-primary-600/20 border-primary-500/50 text-primary-400"
                  : "bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600"
                  }`}
              >
                <SlidersHorizontal size={14} />
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary-400" />
                )}
              </button>
            )}
          </div>

          {/* Centered Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                  ? "bg-primary-600 !text-white"
                  : `text-dark-400 hover:text-white ${isDark
                    ? "hover:bg-dark-700"
                    : "hover:bg-dark-200 hover:!text-black"
                  }`
                  }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Takes remaining height */}
        {activeTab === "issues" && (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Left Sidebar - Filters (Desktop only) */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0 order-1 overflow-y-auto scrollbar-hide ">
              <IssueFilters
                params={params}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Right Content - Issue Table (scrollable with max-width) */}
            <div className="flex-1 min-w-0 order-1 lg:order-2 overflow-y-auto scrollbar-hide">
              <div className="max-w-7xl">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader size="lg" text="Loading issues..." />
                  </div>
                ) : (
                  <IssueTable
                    issues={issues}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteClick}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Left Sidebar - Issue Filters (Desktop only) */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0 order-1 overflow-y-auto scrollbar-hide">
              <IssueFilters
                params={{
                  ...reportsParams,
                  status: reportsParams.issueStatus,
                }}
                onFilterChange={(newParams) => {
                  const { status: issueStatusFilter, ...rest } = newParams;
                  setReportsParams((prev) => ({
                    ...prev,
                    ...rest,
                    issueStatus: issueStatusFilter,
                    page: 1,
                  }));
                }}
                onReset={() =>
                  setReportsParams({
                    limit: 15,
                    sortBy: "reportCount",
                    minReports: 1,
                  })
                }
                hideCounts={true}
              />
            </aside>

            {/* Right Content - Grouped Reports */}
            <div className="flex-1 min-w-0 order-1 lg:order-2 overflow-y-auto scrollbar-hide">
              <div className="max-w-7xl space-y-4">
                {/* Sort & Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 bg-dark-800 border border-dark-700 rounded-xl p-4">
                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-400">Sort:</span>
                    <select
                      value={reportsParams.sortBy || "reportCount"}
                      onChange={(e) =>
                        setReportsParams((prev) => ({
                          ...prev,
                          sortBy: e.target.value,
                          page: 1,
                        }))
                      }
                      className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="reportCount">Most Reported</option>
                      <option value="pendingFirst">Pending First</option>
                      <option value="newest">Newest Reports</option>
                      <option value="oldest">Oldest Reports</option>
                    </select>
                  </div>

                  {/* Min Reports Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-400">Min Reports:</span>
                    <select
                      value={reportsParams.minReports || 1}
                      onChange={(e) =>
                        setReportsParams((prev) => ({
                          ...prev,
                          minReports: parseInt(e.target.value),
                          page: 1,
                        }))
                      }
                      className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="1">1+ (All)</option>
                      <option value="2">2+ Reports</option>
                      <option value="3">3+ Reports</option>
                      <option value="5">5+ Reports</option>
                    </select>
                  </div>
                </div>

                {/* Grouped Reports Table */}
                <GroupedReportsTable
                  groupedReports={groupedReports}
                  pagination={reportsPagination}
                  stats={reportsStats}
                  onPageChange={handleReportPageChange}
                  onReviewReport={handleReviewReport}
                  loading={reportsLoading}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
            <div className="max-w-7xl mx-auto w-full">
              <AnalyticsWidgets
                data={analytics}
                reportAnalytics={reportAnalytics}
              />
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={selectedIssue}
        onSubmit={handleSubmitStatus}
        loading={updating}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, issueId: null })}
        title="Delete Issue"
        size="sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
          <p className="text-dark-300 mb-8">
            This action cannot be undone. This will permanently delete the issue
            and remove all associated data.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteConfirmation({ open: false, issueId: null })
              }
              className="flex-1"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        report={selectedReport}
        onReview={handleSubmitReportReview}
        onDeleteIssue={handleDeleteIssueFromReport}
        loading={updating}
      />
    </div>
  );
};

export default AdminDashboard;
