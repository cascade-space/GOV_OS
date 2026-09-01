const { pool } = require('../config/database');
const logger = require('../utils/logger');

exports.getConstituencyIssues = async (req, res, next) => {
    try {
        const { status, priority } = req.query;
        const userEmail = req.headers['x-user-email'];
        let constituency_id = req.query.constituency_id;

        if (userEmail) {
            const userResult = await pool.query(
                "SELECT constituency_id, role FROM users WHERE email = $1 AND status = 'active'",
                [userEmail]
            );
            if (userResult.rows.length > 0 && userResult.rows[0].role === 'mla') {
                constituency_id = userResult.rows[0].constituency_id;
            }
        }

        let query = `
            SELECT c.*, d.name as department_name, o.name as officer_name
            FROM complaints c
            LEFT JOIN departments d ON c.assigned_department_id::text = d.id::text
            LEFT JOIN officers o ON c.assigned_officer_id::text = o.id::text
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (constituency_id) {
            query += ` AND c.constituency_id = $${paramCount}`;
            params.push(constituency_id);
            paramCount++;
        }
        if (status) {
            query += ` AND c.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (priority) {
            query += ` AND c.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        query += ` ORDER BY c.created_at DESC`;
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Error fetching constituency issues:', error);
        next(error);
    }
};
exports.getMLAStats = async (req, res, next) => {
    try {
        const { constituency_id } = req.query;
        
        const query = `
            SELECT 
                COUNT(*) as total_issues,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                COUNT(CASE WHEN status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending,
                COUNT(CASE WHEN is_escalated = true THEN 1 END) as escalated,
                COUNT(CASE WHEN priority IN ('high', 'critical') THEN 1 END) as high_priority,
                AVG(citizen_satisfaction_rating) as avg_satisfaction
            FROM complaints
            WHERE constituency_id = $1 AND deleted_at IS NULL
        `;
        
        const result = await pool.query(query, [constituency_id]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error fetching MLA stats:', error);
        next(error);
    }
};

exports.issueDirective = async (req, res, next) => {
    try {
        const { complaint_id, mla_id, directive_text, priority, target_department_id } = req.body;
        
        const query = `
            INSERT INTO mla_directives (complaint_id, mla_id, directive_text, priority, target_department_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            complaint_id,
            mla_id,
            directive_text,
            priority || 'high',
            target_department_id
        ]);
        
        // Emit socket event
        const io = req.app.get('io');
        io.to('admin').emit('directive:new', result.rows[0]);
        
        res.status(201).json({
            success: true,
            message: 'Directive issued successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error issuing directive:', error);
        next(error);
    }
};

exports.getDirectives = async (req, res, next) => {
    try {
        const { mla_id, status } = req.query;
        
        let query = `
            SELECT md.*, c.complaint_number, c.title, d.name as department_name
            FROM mla_directives md
            JOIN complaints c ON md.complaint_id = c.id
            LEFT JOIN departments d ON md.target_department_id = d.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (mla_id) {
            query += ` AND md.mla_id = $${paramCount}`;
            params.push(mla_id);
            paramCount++;
        }
        
        if (status) {
            query += ` AND md.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        query += ` ORDER BY md.created_at DESC`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching directives:', error);
        next(error);
    }
};

exports.getDepartmentPerformance = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                d.id,
                d.name as department_name,
                COUNT(c.id) as total_complaints,
                COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN c.status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending_count,
                ROUND(
                    (COUNT(CASE WHEN c.status = 'resolved' THEN 1 END)::numeric / 
                    NULLIF(COUNT(c.id), 0)) * 100, 
                    0
                ) as resolution_rate,
                ROUND(
                    (COUNT(CASE WHEN c.status = 'resolved' AND c.resolved_at IS NOT NULL THEN 1 END)::numeric / 
                    NULLIF(COUNT(CASE WHEN c.status = 'resolved' THEN 1 END), 0)) * 100, 
                    0
                ) as sla_compliance
            FROM departments d
            LEFT JOIN complaints c ON d.id = c.assigned_department_id AND c.deleted_at IS NULL
            WHERE d.is_active = true
            GROUP BY d.id, d.name
            HAVING COUNT(c.id) > 0
            ORDER BY resolution_rate DESC, sla_compliance DESC
        `;
        
        const result = await pool.query(query);
        
        // Calculate performance score (weighted average of resolution rate and SLA compliance)
        const departmentsWithScore = result.rows.map(dept => ({
            ...dept,
            performance_score: Math.round((
                (parseFloat(dept.resolution_rate) || 0) * 0.6 + 
                (parseFloat(dept.sla_compliance) || 0) * 0.4
            ))
        }));
        
        res.json({
            success: true,
            data: departmentsWithScore
        });
    } catch (error) {
        logger.error('Error fetching department performance:', error);
        next(error);
    }
};


exports.getComplaintLocations = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                id,
                latitude,
                longitude,
                priority,
                status,
                title
            FROM complaints
            WHERE latitude IS NOT NULL 
            AND longitude IS NOT NULL 
            AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query);
        
        // Format for GeoJSON
        const features = result.rows.map(complaint => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(complaint.longitude), parseFloat(complaint.latitude)]
            },
            properties: {
                id: complaint.id,
                title: complaint.title,
                priority: complaint.priority,
                status: complaint.status
            }
        }));
        
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };
        
        res.json({
            success: true,
            data: geojson
        });
    } catch (error) {
        logger.error('Error fetching complaint locations:', error);
        next(error);
    }
};

