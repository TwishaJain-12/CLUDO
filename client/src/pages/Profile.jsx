import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    User,
    MapPin,
    Calendar,
    Settings,
    LogOut,
    Flag,
    Bell,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    X,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import IssueCard from '../components/issues/IssueCard';
import Button from '../components/common/Button';
import { CardSkeletonList } from '../components/common/Loader';
import { useUserContext } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { issueApi, reportApi } from '../services/api';
import { formatDate, formatRelativeTime, getInitials, categoryConfig } from '../utils/helpers';

/**
 * Report status config
 */
const REPORT_STATUS = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    reviewed: { label: 'Reviewed', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: CheckCircle },
    dismissed: { label: 'Dismissed', color: 'text-dark-400', bg: 'bg-dark-600', icon: X },
    action_taken: { label: 'Action Taken', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
};

/**
 * Notification type config
 */
const NOTIFICATION_TYPE = {
    report_reviewed: { icon: CheckCircle, color: 'text-blue-400' },
    report_dismissed: { icon: X, color: 'text-dark-400' },
    issue_warning: { icon: AlertTriangle, color: 'text-amber-400' },
    issue_deleted: { icon: Trash2, color: 'text-red-400' },
    issue_resolved: { icon: CheckCircle, color: 'text-emerald-400' },
};

/**
 * Profile Page Component
 * Shows user profile with tabs for issues, reports, and notifications
 */
const Profile = () => {
    const { user, loading: userLoading } = useUserContext();
    const { signOut } = useClerk();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        notifications,
        unreadCount,
        loading: notificationsLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    // Active tab from URL or default
    const activeTab = searchParams.get('tab') || 'issues';
    const setActiveTab = (tab) => setSearchParams({ tab });

    // Issues state
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

    // Reports state
    const [myReports, setMyReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    // Fetch issues
    useEffect(() => {
        const fetchMyIssues = async () => {
            try {
                setIssuesLoading(true);
                const response = await issueApi.getMyIssues({ limit: 50 });
                const data = response.data.data;
                setIssues(data);

                const resolved = data.filter((i) => i.status === 'resolved').length;
                setStats({
                    total: data.length,
                    resolved,
                    pending: data.length - resolved,
                });
            } catch (error) {
                console.error('Error fetching issues:', error);
            } finally {
                setIssuesLoading(false);
            }
        };

        fetchMyIssues();
    }, []);

    // Fetch reports when tab changes
    useEffect(() => {
        if (activeTab === 'reports' && myReports.length === 0) {
            const fetchMyReports = async () => {
                try {
                    setReportsLoading(true);
                    const response = await reportApi.getMyReports({ limit: 50 });
                    setMyReports(response.data.data);
                } catch (error) {
                    console.error('Error fetching reports:', error);
                } finally {
                    setReportsLoading(false);
                }
            };
            fetchMyReports();
        }
    }, [activeTab, myReports.length]);

    // Fetch notifications when tab changes
    useEffect(() => {
        if (activeTab === 'notifications' && notifications.length === 0) {
            fetchNotifications();
        }
    }, [activeTab, notifications.length, fetchNotifications]);

    const handleSignOut = () => {
        signOut();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
    };

    const tabs = [
        { id: 'issues', label: 'My Issues', icon: FileText, count: stats.total },
        { id: 'reports', label: 'My Reports', icon: Flag, count: myReports.length },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    ];

    if (userLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16">
                <Navbar />
                <div className="container-custom py-8">
                    <CardSkeletonList count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-dark-900 flex flex-col pt-16 overflow-hidden">
            <Navbar />

            <main className="flex-1 overflow-y-auto">
                <div className="container-custom py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Sidebar */}
                        <div className="space-y-6 lg:sticky lg:top-8">
                            {/* Profile Card */}
                            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            getInitials(user?.name)
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        {user?.name || 'Anonymous User'}
                                    </h2>
                                    <p className="text-dark-400 text-sm mb-4">{user?.email}</p>
                                    {user?.role === 'admin' && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-sm px-3 py-1 rounded-full mb-4">
                                            <Settings size={14} />
                                            Admin
                                        </span>
                                    )}
                                    <p className="text-dark-500 text-sm flex items-center justify-center gap-1">
                                        <Calendar size={14} />
                                        Member since {formatDate(user?.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Your Activity
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-dark-400">Issues Reported</span>
                                        <span className="text-white font-semibold">{stats.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-dark-400">Resolved</span>
                                        <span className="text-emerald-400 font-semibold">{stats.resolved}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-dark-400">Pending</span>
                                        <span className="text-amber-400 font-semibold">{stats.pending}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="block">
                                        <Button variant="secondary" className="w-full" icon={Settings}>
                                            Admin Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    icon={LogOut}
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Tabs */}
                            <div className="flex items-center gap-2 mb-6 bg-dark-800 border border-dark-700 rounded-xl p-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all flex-1 justify-center ${activeTab === tab.id
                                            ? 'bg-primary-600 !text-white'
                                            : 'text-dark-400 hover:text-white hover:bg-dark-700'
                                            }`}
                                    >
                                        <tab.icon size={16} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        {tab.count > 0 && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                                                ? 'bg-white/20'
                                                : tab.id === 'notifications' && tab.count > 0
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-dark-600'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'issues' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">Your Reported Issues</h2>
                                        <Link to="/report">
                                            <Button icon={MapPin}>Report New</Button>
                                        </Link>
                                    </div>

                                    {issuesLoading ? (
                                        <CardSkeletonList count={3} />
                                    ) : issues.length === 0 ? (
                                        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                                            <MapPin size={48} className="text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                No Issues Reported Yet
                                            </h3>
                                            <p className="text-dark-400 mb-6">
                                                Start making a difference in your community by reporting civic issues.
                                            </p>
                                            <Link to="/report">
                                                <Button icon={MapPin}>Report Your First Issue</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {issues.map((issue) => (
                                                <IssueCard key={issue._id} issue={issue} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">Your Submitted Reports</h2>
                                    </div>

                                    {reportsLoading ? (
                                        <CardSkeletonList count={3} />
                                    ) : myReports.length === 0 ? (
                                        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                                            <Flag size={48} className="text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                No Reports Submitted
                                            </h3>
                                            <p className="text-dark-400">
                                                When you report inappropriate or fake issues, they'll appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {myReports.map((report) => {
                                                const statusConfig = REPORT_STATUS[report.status] || REPORT_STATUS.pending;
                                                const issueCategory = report.issue?.category
                                                    ? categoryConfig[report.issue.category]
                                                    : null;
                                                return (
                                                    <div
                                                        key={report._id}
                                                        className="bg-dark-800 border border-dark-700 rounded-xl p-4"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                                                                <statusConfig.icon size={20} className={statusConfig.color} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {report.issue ? (
                                                                        <Link
                                                                            to={`/issues/${report.issue._id}`}
                                                                            className="text-white font-medium hover:text-primary-400 transition-colors flex items-center gap-1"
                                                                        >
                                                                            {report.issue.title}
                                                                            <ExternalLink size={12} />
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-dark-400 italic">Issue Deleted</span>
                                                                    )}
                                                                    {issueCategory && (
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${issueCategory.bg} ${issueCategory.color}`}>
                                                                            {issueCategory.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-dark-300 mb-2">
                                                                    <span className="text-red-400">{report.reason}</span>
                                                                    {report.details && ` — ${report.details}`}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-xs text-dark-500">
                                                                    <span>{formatRelativeTime(report.createdAt)}</span>
                                                                    <span className={`px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                                                        {statusConfig.label}
                                                                    </span>
                                                                </div>
                                                                {report.reviewNote && (
                                                                    <div className="mt-2 p-2 bg-dark-700/50 rounded text-sm text-dark-300">
                                                                        <span className="text-dark-500">Admin note:</span> {report.reviewNote}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">Notifications</h2>
                                        {unreadCount > 0 && (
                                            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                                Mark all as read
                                            </Button>
                                        )}
                                    </div>

                                    {notificationsLoading ? (
                                        <CardSkeletonList count={3} />
                                    ) : notifications.length === 0 ? (
                                        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                                            <Bell size={48} className="text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                No Notifications
                                            </h3>
                                            <p className="text-dark-400">
                                                You'll receive notifications when your reports are reviewed.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notifications.map((notification) => {
                                                const typeConfig = NOTIFICATION_TYPE[notification.type] || { icon: Bell, color: 'text-primary-400' };
                                                const IconComponent = typeConfig.icon;
                                                return (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`bg-dark-800 border rounded-xl p-4 cursor-pointer transition-colors ${notification.read
                                                            ? 'border-dark-700'
                                                            : 'border-primary-500/30 bg-primary-500/5'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <IconComponent size={20} className={typeConfig.color} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium ${notification.read ? 'text-dark-300' : 'text-white'}`}>
                                                                    {notification.title}
                                                                </p>
                                                                <p className={`text-sm mt-1 ${notification.read ? 'text-dark-500' : 'text-dark-300'}`}>
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-dark-500 mt-2">
                                                                    {formatRelativeTime(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default Profile;
