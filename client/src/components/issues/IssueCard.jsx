import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  MessageCircle,
  ArrowUp,
  Flag,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  Facebook,
  Twitter,
  Image as ImageIcon,
  ArrowBigUp,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import ReportIssueModal from "./ReportIssueModal";
import { useUpvote } from "../../hooks/useUpvote";
import { useUserContext } from "../../context/UserContext";
import {
  formatRelativeTime,
  categoryConfig,
  truncateText,
  getInitials,
} from "../../utils/helpers";

/**
 * Issue Card Component
 * Revamped with persistent layout structure and consistent image sizing
 */
const IssueCard = ({ issue }) => {
  const { isSignedIn, user } = useUserContext();
  const { upvoted, count, loading, toggleUpvote } = useUpvote(
    issue._id,
    issue.upvotesCount
  );
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const category = categoryConfig[issue.category] || categoryConfig.other;
  const isOwnIssue = user && issue.createdBy?._id === user._id;
  const hasImage = issue.images && issue.images.length > 0;
  const hasMultipleImages = issue.images && issue.images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === issue.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? issue.images.length - 1 : prev - 1
    );
  };

  const issueUrl = `${window.location.origin}/issues/${issue._id}`;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={40} />,
      color: "hover:bg-green-500/20 hover:text-green-400",
      action: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            issue.title + " - " + issueUrl
          )}`,
          "_blank"
        ),
    },
    {
      name: "Facebook",
      icon: <Facebook size={40} />,
      color: "hover:bg-blue-500/20 hover:text-blue-400",
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            issueUrl
          )}`,
          "_blank"
        ),
    },
    {
      name: "Twitter",
      icon: <Twitter size={40} />,
      color: "hover:bg-sky-500/20 hover:text-sky-400",
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            issue.title
          )}&url=${encodeURIComponent(issueUrl)}`,
          "_blank"
        ),
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(issueUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden transition-all duration-300 hover:border-dark-600 hover:shadow-lg hover:shadow-primary-500/5 group/card">
      {/* Header Section - Simplified and Cleaner */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-dark-700/50">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Avatar - Smaller */}
          <Link
            to={`/profile/${issue.createdBy?._id}`}
            className="flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs sm:text-sm font-semibold ring-1.5 ring-dark-600 hover:ring-primary-500/50 transition-all">
              {issue.createdBy?.avatar ? (
                <img
                  src={issue.createdBy.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(issue.createdBy?.name)
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/profile/${issue.createdBy?._id}`}
                  className="text-white font-semibold text-sm sm:text-base hover:text-primary-400 transition-colors truncate"
                >
                  {issue.createdBy?.name || "Anonymous"}
                </Link>
                <StatusBadge status={issue.status} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dark-400">
                <span>{formatRelativeTime(issue.createdAt)}</span>
                {issue.location?.address && (
                  <>
                    <span className="text-dark-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin size={10} className="flex-shrink-0 mt-0.5" />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {truncateText(issue.location.address, 20)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section - Responsive Height */}
      <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] bg-dark-900 group/image overflow-hidden">
        {hasImage ? (
          <>
            <Link to={`/issues/${issue._id}`} className="block w-full h-full">
              <img
                src={issue.images[currentImageIndex]}
                alt={issue.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
              />
            </Link>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark-900/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-200 hover:bg-dark-800 hover:scale-110 shadow-lg image-nav-button"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark-900/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-200 hover:bg-dark-800 hover:scale-110 shadow-lg image-nav-button"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-dark-900/60 backdrop-blur-md rounded-full image-dots-container">
                {issue.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`rounded-full transition-all duration-200 ${idx === currentImageIndex
                      ? "bg-primary-400 w-2 h-2 sm:w-2.5 sm:h-2.5"
                      : "bg-white/40 hover:bg-white/60 w-1.5 h-1.5 sm:w-2 sm:h-2 image-dot"
                      }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image counter */}
            {hasMultipleImages && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-dark-900/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs text-white font-medium shadow-lg image-counter">
                {currentImageIndex + 1}/{issue.images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-dark-500">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <p className="text-sm text-dark-500">No image available</p>
          </div>
        )}

        {/* Details Button - Glassmorphic style at bottom-right of image */}
        <Link
          to={`/issues/${issue._id}`}
          className="absolute bottom-3 right-3 px-2 py-1 sm:px-2 sm:py-1 rounded-xl bg-gray-800/50 backdrop-blur-md border-[0.5px] border-white/20 text-gray-300 text-xs sm:text-sm font-medium hover:bg-gray-700/20 hover:border-gray-700/20 transition-all duration-200 shadow-lg flex items-center gap-1 group/link"
        >
          <span>Details</span>
          <ChevronRight
            size={12}
            className="sm:w-3 sm:h-3 group-hover/link:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>

      {/* Content Section - Always Present */}
      <div className="px-4 sm:px-5 py-3 sm:py-4">
        {/* Title Row with Action Buttons inline */}
        <div className="flex items-center justify-between gap-2">
          {/* Title and Category */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Link
              to={`/issues/${issue._id}`}
              className="group/title min-w-0 flex-shrink"
            >
              <h3 className="text-white font-semibold text-sm sm:text-base leading-snug group-hover/title:text-primary-400 transition-colors truncate">
                {issue.title}
              </h3>
            </Link>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${category.bg} ${category.color} border-[0.25px] border-[#0f172a]`}
            >
              {category.label}
            </span>
          </div>

          {/* Action Buttons - Inline with title */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Upvote */}
            <button
              onClick={() => isSignedIn && toggleUpvote()}
              disabled={loading || !isSignedIn}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg transition-all duration-200 ${upvoted
                ? "text-gray-300 bg-primary-500/10"
                : "text-dark-300 hover:text-primary-400 hover:bg-primary-500/5"
                } ${!isSignedIn && "opacity-50 cursor-not-allowed"}`}
              aria-label={upvoted ? "Remove upvote" : "Upvote"}
            >
              <ArrowBigUp
                strokeWidth={upvoted ? 1 : 1.2}
                size={14}
                className={`sm:w-[30px] sm:h-[30px] transition-transform ${upvoted ? "fill-primary-400" : ""
                  } ${!loading && "hover:scale-110"}`}
              />
              <span className="text-xs font-medium">{count}</span>
            </button>

            {/* Comments */}
            <Link
              to={`/issues/${issue._id}#comments`}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-dark-300 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-200"
              aria-label="View comments"
            >
              <MessageCircle strokeWidth={2} size={14} className="sm:w-5 sm:h-5" />
              {(issue.commentsCount || 0) > 0 && (
                <span className="text-xs font-medium">
                  {issue.commentsCount}
                </span>
              )}
            </Link>

            {/* Share */}
            <button
              onClick={() => setShareMenuOpen(true)}
              className="px-1.5 sm:px-2 py-1 rounded-lg text-dark-300 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-200"
              aria-label="Share issue"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" />
            </button>

            {/* Report - Only show for non-owners */}
            {isSignedIn && !isOwnIssue && (
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-1.5 sm:px-2 py-1 rounded-lg text-dark-300 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 relative"
                aria-label="Report issue"
              >
                <Flag size={14} className="sm:w-4 sm:h-4" />
                {(issue.reportsCount || 0) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-medium">
                    {issue.reportsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>



      {/* Report Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        issueId={issue._id}
        issueTitle={issue.title}
      />

      {/* Share Modal - Revamped */}
      {shareMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShareMenuOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Share Issue
                </h3>
                <p className="text-xs text-dark-400 mt-0.5">
                  Choose how you want to share
                </p>
              </div>
              <button
                onClick={() => setShareMenuOpen(false)}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all modal-close-button"
                aria-label="Close share menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Share Options Grid - Improved Layout */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      setShareMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-dark-700/30 border border-dark-600/50 hover:bg-dark-700 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group active:scale-95 share-option-button"
                  >
                    <div className="w-12 h-12 rounded-full bg-dark-800/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500/10 transition-all share-icon-container">
                      <span className="text-2xl text-dark-300 group-hover:text-primary-400 transition-colors">
                        {option.icon}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-dark-300 group-hover:text-primary-400 transition-colors">
                      {option.name}
                    </span>
                  </button>
                ))}
                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-dark-700/30 border border-dark-600/50 hover:bg-dark-700 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group active:scale-95 share-option-button"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-dark-800/50 flex items-center justify-center group-hover:scale-110 transition-all share-icon-container ${copied
                      ? "bg-green-500/10"
                      : "group-hover:bg-primary-500/10"
                      }`}
                  >
                    {copied ? (
                      <Check size={24} className="text-green-400" />
                    ) : (
                      <Copy
                        size={24}
                        className="text-dark-300 group-hover:text-primary-400 transition-colors"
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${copied
                      ? "text-green-400"
                      : "text-dark-300 group-hover:text-primary-400"
                      }`}
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>
            </div>

            {/* Link Preview - Enhanced */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3 p-4 bg-dark-700/30 border border-dark-600/50 rounded-xl hover:border-primary-500/50 transition-all">
                <img
                  src="/mini-logo.png"
                  alt="NagarSathi"
                  className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg ring-2 ring-primary-500/20 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate mb-1.5">
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-dark-400 truncate font-mono flex-1">
                      {issueUrl.length > 35
                        ? `${issueUrl.substring(0, 35)}...`
                        : issueUrl}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink();
                      }}
                      className="p-1.5 rounded-lg hover:bg-dark-600/50 transition-colors flex-shrink-0 group/copy"
                      aria-label="Copy link"
                    >
                      <Copy
                        size={14}
                        className="text-dark-400 group-hover/copy:text-primary-400 transition-colors"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
