import { useState, useCallback } from 'react';
import { commentApi } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing comments on an issue
 */
export const useComments = (issueId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });

    const fetchComments = useCallback(async (page = 1) => {
        if (!issueId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await commentApi.getComments(issueId, { page, limit: 20 });

            if (page === 1) {
                setComments(response.data.data);
            } else {
                setComments((prev) => [...prev, ...response.data.data]);
            }

            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total,
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    }, [issueId]);

    const addComment = async (content) => {
        try {
            const response = await commentApi.addComment(issueId, content);
            setComments((prev) => [response.data.data, ...prev]);
            setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
            toast.success('Comment added');
            return response.data.data;
        } catch (err) {
            toast.error(err.message || 'Failed to add comment');
            throw err;
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await commentApi.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
            toast.success('Comment deleted');
        } catch (err) {
            toast.error(err.message || 'Failed to delete comment');
            throw err;
        }
    };

    const loadMore = () => {
        if (pagination.page < pagination.pages) {
            fetchComments(pagination.page + 1);
        }
    };

    return {
        comments,
        loading,
        error,
        pagination,
        fetchComments,
        addComment,
        deleteComment,
        loadMore,
        hasMore: pagination.page < pagination.pages,
    };
};

export default useComments;
