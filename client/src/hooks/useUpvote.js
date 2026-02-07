import { useState, useCallback, useEffect } from 'react';
import { upvoteApi } from '../services/api';
import { useUserContext } from '../context/UserContext';

/**
 * Custom hook for managing upvotes on an issue
 */
export const useUpvote = (issueId, initialCount = 0) => {
    const { isSignedIn } = useUserContext();
    const [upvoted, setUpvoted] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    // Check initial upvote status
    useEffect(() => {
        const checkStatus = async () => {
            if (!issueId || !isSignedIn) return;

            try {
                const response = await upvoteApi.getUpvoteStatus(issueId);
                setUpvoted(response.data.data.upvoted);
            } catch (err) {
                console.error('Error checking upvote status:', err);
            }
        };

        checkStatus();
    }, [issueId, isSignedIn]);

    const toggleUpvote = useCallback(async () => {
        if (!isSignedIn || loading) return;

        try {
            setLoading(true);

            // Optimistic update
            const newUpvoted = !upvoted;
            const newCount = newUpvoted ? count + 1 : count - 1;
            setUpvoted(newUpvoted);
            setCount(newCount);

            const response = await upvoteApi.toggleUpvote(issueId);

            // Update with actual values from server
            setUpvoted(response.data.data.upvoted);
            setCount(response.data.data.upvotesCount);
        } catch (err) {
            // Revert on error
            setUpvoted(!upvoted);
            setCount(upvoted ? count + 1 : count - 1);
            console.error('Error toggling upvote:', err);
        } finally {
            setLoading(false);
        }
    }, [issueId, isSignedIn, upvoted, count, loading]);

    return {
        upvoted,
        count,
        loading,
        toggleUpvote,
    };
};

export default useUpvote;
