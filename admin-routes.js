// Admin API Endpoints
// Simple admin routes for Caloriv admin panel

const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Allow if admin key matches or valid JWT token
    if (adminKey === process.env.ADMIN_KEY || adminKey === 'caloriv-admin-2025') {
        return next();
    }

    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';
            const decoded = jwt.verify(token, JWT_SECRET);
            const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

            if (adminEmails.includes(decoded.email)) {
                req.user = decoded;
                return next();
            }
        } catch (err) {
            // Invalid token, continue to unauthorized
        }
    }

    res.status(401).json({ success: false, error: 'Unauthorized' });
};

module.exports = function (app, db) {

    // Get all users
    app.get('/api/admin/users', adminAuth, (req, res) => {
        db.all(
            'SELECT id, email, name, age, gender, height, currentWeight, targetWeight, goal, createdAt FROM users',
            [],
            (err, users) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: users || [], count: (users || []).length });
            }
        );
    });

    // Get dashboard stats
    app.get('/api/admin/stats', adminAuth, (req, res) => {
        const stats = {};
        let completed = 0;
        const total = 5;

        const checkComplete = () => {
            completed++;
            if (completed === total) {
                res.json({ success: true, data: stats });
            }
        };

        db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
            stats.totalUsers = err ? 0 : result.count;
            checkComplete();
        });

        db.get('SELECT COUNT(*) as count FROM foods WHERE isActive = 1', [], (err, result) => {
            stats.totalFoods = err ? 0 : result.count;
            checkComplete();
        });

        db.get('SELECT COUNT(*) as count FROM exercises WHERE isActive = 1', [], (err, result) => {
            stats.totalExercises = err ? 0 : result.count;
            checkComplete();
        });

        db.get('SELECT COUNT(*) as count FROM food_submissions WHERE status = "pending"', [], (err, result) => {
            stats.pendingFoodSubmissions = err ? 0 : result.count;
            checkComplete();
        });

        db.get('SELECT COUNT(*) as count FROM exercise_submissions WHERE status = "pending"', [], (err, result) => {
            stats.pendingExerciseSubmissions = err ? 0 : result.count;
            checkComplete();
        });
    });

    // Promotions endpoints
    app.get('/api/admin/promotions', adminAuth, (req, res) => {
        db.all('SELECT * FROM promotions ORDER BY createdAt DESC', [], (err, promotions) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: promotions || [] });
        });
    });

    app.post('/api/admin/promotions', adminAuth, (req, res) => {
        const { title, description, imageUrl, link, isActive } = req.body;
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();

        db.run(
            'INSERT INTO promotions (id, title, description, imageUrl, link, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, description, imageUrl, link, isActive ? 1 : 0, createdAt],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: { id, title, description, imageUrl, link, isActive, createdAt } });
            }
        );
    });

    app.put('/api/admin/promotions/:id', adminAuth, (req, res) => {
        const { title, description, imageUrl, link, isActive } = req.body;

        db.run(
            'UPDATE promotions SET title = ?, description = ?, imageUrl = ?, link = ?, isActive = ? WHERE id = ?',
            [title, description, imageUrl, link, isActive ? 1 : 0, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, message: 'Promotion updated' });
            }
        );
    });

    app.delete('/api/admin/promotions/:id', adminAuth, (req, res) => {
        db.run('DELETE FROM promotions WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: 'Promotion deleted' });
        });
    });

    // Announcements endpoints
    app.get('/api/admin/announcements', adminAuth, (req, res) => {
        db.all('SELECT * FROM announcements ORDER BY createdAt DESC', [], (err, announcements) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: announcements || [] });
        });
    });

    app.post('/api/admin/announcements', adminAuth, (req, res) => {
        const { title, message, type, isActive } = req.body;
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();

        db.run(
            'INSERT INTO announcements (id, title, message, type, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, message, type, isActive ? 1 : 0, createdAt],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: { id, title, message, type, isActive, createdAt } });
            }
        );
    });

    app.put('/api/admin/announcements/:id', adminAuth, (req, res) => {
        const { title, message, type, isActive } = req.body;

        db.run(
            'UPDATE announcements SET title = ?, message = ?, type = ?, isActive = ? WHERE id = ?',
            [title, message, type, isActive ? 1 : 0, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, message: 'Announcement updated' });
            }
        );
    });

    app.delete('/api/admin/announcements/:id', adminAuth, (req, res) => {
        db.run('DELETE FROM announcements WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: 'Announcement deleted' });
        });
    });

    console.log('✅ Admin API routes loaded');
};
