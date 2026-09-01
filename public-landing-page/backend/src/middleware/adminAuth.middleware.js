const { pool } = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

/**
 * RBAC Middleware for Admin and MLA Dashboard Access
 * Only protects /admin/* and /mla/* routes
 */

/**
 * Check if user has required admin role
 * @param {string[]} allowedRoles - Array of allowed roles ['admin', 'mla']
 */
const checkAdminRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Get user email from request (adapt based on your current auth system)
            // This assumes you have user info in req.user from existing auth
            const userEmail = req.user?.email || req.session?.email || req.headers['x-user-email'];
            
            if (!userEmail) {
                logger.warn('Admin access attempt without authentication');
                return res.status(401).json({ 
                    success: false, 
                    error: 'Authentication required for admin access' 
                });
            }

            // Query database for user role
            const client = await pool.connect();
            try {
                const result = await client.query(
                    'SELECT role, status FROM users WHERE email = $1 AND role IN ($2, $3)',
                    [userEmail, 'admin', 'mla']
                );
                
                if (result.rows.length === 0) {
                    logger.warn(`Access denied for ${userEmail} - No admin privileges found in database`);
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Access denied - No admin privileges found' 
                    });
                }
                
                const user = result.rows[0];
                const userRole = user.role;
                
                if (user.status !== 'active') {
                    logger.warn(`Access denied for ${userEmail} - User account is ${user.status}`);
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Access denied - Account is not active' 
                    });
                }
                
                if (!allowedRoles.includes(userRole)) {
                    logger.warn(`Access denied for ${userEmail} - Role ${userRole} not in ${allowedRoles.join(', ')}`);
                    return res.status(403).json({ 
                        success: false, 
                        error: `Access denied - Required role: ${allowedRoles.join(' or ')}`,
                        userRole: userRole
                    });
                }

                // Add role info to request for use in controllers
                req.userRole = userRole;
                req.isAdmin = userRole === 'admin';
                req.isMLA = userRole === 'mla';
                
                logger.info(`Admin access granted for ${userEmail} with role ${userRole} (database verified)`);
                next();
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            logger.error('Admin role check error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Authorization check failed' 
            });
        }
    };
};

/**
 * Admin only access - restricts to admin role only
 */
const adminOnly = checkAdminRole(['admin']);

/**
 * Admin or MLA access - allows both admin and MLA roles
 */
const adminOrMLA = checkAdminRole(['admin', 'mla']);

/**
 * Get user's admin role (for frontend role checking)
 */
const getUserRole = async (req, res, next) => {
    try {
        const userEmail = req.user?.email || req.session?.email || req.headers['x-user-email'];
        
        if (!userEmail) {
            return res.json({ 
                success: true,
                role: null,
                hasAdminAccess: false
            });
        }

        // Query database for user role
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT role, status, full_name FROM users WHERE email = $1 AND role IN ($2, $3)',
                [userEmail, 'admin', 'mla']
            );
            
            const role = result.rows.length > 0 ? result.rows[0].role : null;
            const status = result.rows.length > 0 ? result.rows[0].status : null;
            const fullName = result.rows.length > 0 ? result.rows[0].full_name : null;
            
            logger.info(`Role check for ${userEmail}: ${role || 'no role'} (database verified)`);
            
            res.json({ 
                success: true,
                role: role,
                hasAdminAccess: role !== null && status === 'active',
                isAdmin: role === 'admin',
                isMLA: role === 'mla',
                fullName: fullName,
                message: 'Database authentication active'
            });
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        logger.error('Get user role error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to check user role' 
        });
    }
};

/**
 * Login endpoint for admin/MLA authentication
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Query database for user credentials
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT id, email, password_hash, full_name, role, status FROM users WHERE email = $1 AND role IN ($2, $3)',
                [email, 'admin', 'mla']
            );
            
            if (result.rows.length === 0) {
                logger.warn(`Failed login attempt for ${email} - User not found`);
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            
            const user = result.rows[0];
            
            if (user.status !== 'active') {
                logger.warn(`Failed login attempt for ${email} - Account is ${user.status}`);
                return res.status(401).json({
                    success: false,
                    error: 'Account is not active'
                });
            }
            
            // Compare hashed password using bcrypt
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                logger.warn(`Failed login attempt for ${email} - Invalid password`);
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Update last login timestamp
            await client.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            logger.info(`Successful login for ${email} with role ${user.role} (database verified)`);
            
            res.json({
                success: true,
                data: {
                    email: user.email,
                    role: user.role,
                    fullName: user.full_name,
                    loginTime: new Date().toISOString()
                },
                message: 'Login successful'
            });
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

module.exports = { 
    checkAdminRole, 
    adminOnly, 
    adminOrMLA, 
    getUserRole,
    login 
};