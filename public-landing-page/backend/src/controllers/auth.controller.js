const { pool } = require('../config/database');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

// Secret for JWT - in production this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'civicpath_citizen_secret_key_2024';

const requestPublicOtp = async (req, res) => {
    try {
        const { identifier } = req.body;
        
        if (!identifier) {
            return res.status(400).json({ success: false, error: 'Mobile number is required' });
        }

        const client = await pool.connect();
        try {
            // Check if citizen exists
            const result = await client.query('SELECT id, phone FROM users WHERE phone = $1', [identifier]);
            
            if (result.rows.length === 0) {
                // Auto-register citizen
                logger.info(`Citizen not found. Auto-registering: ${identifier}`);
                await client.query(
                    'INSERT INTO users (phone, full_name, tenant_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
                    [identifier, 'Citizen User', '00000000-0000-0000-0000-000000000001']
                );
            }
            
            // In a real app, integrate SMS Gateway here.
            // For now, assume mock OTP 123456
            logger.info(`OTP requested for ${identifier}. Mock OTP: 123456`);
            
            res.json({
                success: true,
                message: 'OTP sent successfully (Mock: 123456)'
            });
        } finally {
            client.release();
        }
    } catch (error) {
        logger.error('Error requesting OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to request OTP' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { identifier, otp } = req.body;
        
        if (!identifier || !otp) {
            return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
        }

        // Mock verification
        if (otp !== '123456') {
            return res.status(401).json({ success: false, error: 'Invalid OTP' });
        }

        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE phone = $1', [identifier]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            
            const user = result.rows[0];
            
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, phone: user.phone, role: 'CITIZEN' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                accessToken: token,
                user: {
                    id: user.id,
                    phone: user.phone,
                    role: 'CITIZEN'
                }
            });
        } finally {
            client.release();
        }
    } catch (error) {
        logger.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
};

module.exports = {
    requestPublicOtp,
    verifyOtp
};
