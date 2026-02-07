import { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { useUserContext } from '../../context/UserContext';
import { formatRelativeTime, getInitials } from '../../utils/helpers';
import Button from '../common/Button';
import Loader from '../common/Loader';

/**
 * Comment Section Component
 * Displays and manages comments on an issue
 */
const CommentSection = ({ issueId }) => {
    const { user, isSignedIn } = useUserContext();
    const {
        comments,
        loading,
        pagination,
        fetchComments,
        addComment,
        deleteComment,
        loadMore,
        hasMore,
    } = useComments(issueId);

    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        try {
            setSubmitting(true);
            await addComment(newComment.trim());
            setNewComment('');
        } catch (error) {
            // Error handled in hook
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await deleteComment(commentId);
        }
    };

    return (
        <div id="comments" className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-white">
                    Comments ({pagination.total})
                </h3>
            </div>

            {/* Add Comment Form */}
            {isSignedIn ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
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
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="input-field flex-1"
                            maxLength={1000}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            icon={Send}
                            disabled={!newComment.trim() || submitting}
                            loading={submitting}
                        >
                            <span className="hidden sm:inline">Post</span>
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-dark-800 rounded-lg p-4 text-center text-dark-400">
                    <a href="/sign-in" className="text-primary-400 hover:underline">
                        Sign in
                    </a>{' '}
                    to leave a comment
                </div>
            )}

            {/* Comments List */}
            {loading && comments.length === 0 ? (
                <div className="flex justify-center py-8">
                    <Loader text="Loading comments..." />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                    <MessageCircle
                        size={40}
                        className="mx-auto mb-3 text-dark-600"
                    />
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment._id}
                            className="flex gap-3 p-4 bg-dark-800/50 rounded-lg"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-dark-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                                {comment.user?.avatar ? (
                                    <img
                                        src={comment.user.avatar}
                                        alt={comment.user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    getInitials(comment.user?.name)
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">
                                            {comment.user?.name || 'Anonymous'}
                                        </span>
                                        <span className="text-dark-500 text-xs">
                                            {formatRelativeTime(comment.createdAt)}
                                        </span>
                                    </div>

                                    {/* Delete button (for owner) */}
                                    {user && comment.user?._id === user._id && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="text-dark-500 hover:text-red-400 transition-colors p-1"
                                            title="Delete comment"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-dark-200 text-sm break-words">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center pt-2">
                            <Button
                                variant="ghost"
                                onClick={loadMore}
                                loading={loading}
                            >
                                Load More Comments
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
