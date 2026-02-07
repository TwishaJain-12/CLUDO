/**
 * Role-Based Authorization Middleware
 * Checks if the authenticated user has the required role
 */

/**
 * Require Admin Role
 * Use after requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }

    next();
};

/**
 * Require User Role (any authenticated user)
 * Use after requireAuth middleware
 */
export const requireUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }

    next();
};

/**
 * Check if user is owner or admin
 * Factory function that accepts a function to get the resource owner ID
 */
export const requireOwnerOrAdmin = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        try {
            const ownerId = await getOwnerId(req);

            if (!ownerId) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found',
                });
            }

            const isOwner = ownerId.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only modify your own resources.',
                });
            }

            next();
        } catch (error) {
            console.error('Owner check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error',
            });
        }
    };
};
