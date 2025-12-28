require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./src/routes/auth');
const portfolioRoutes = require('./src/routes/portfolio');
const educationRoutes = require('./src/routes/education');
const experienceRoutes = require('./src/routes/experience');
const projectsRoutes = require('./src/routes/projects');
const skillsRoutes = require('./src/routes/skills');
const certificationsRoutes = require('./src/routes/certifications');
const filesRoutes = require('./src/routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway/Heroku (required for secure cookies behind load balancer)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/files', filesRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin pages
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🚀 Business Portfolio Server Running                    ║
    ║                                                           ║
    ║   🌐 URL: http://localhost:${PORT}                          ║
    ║   👤 Admin: http://localhost:${PORT}/admin/login.html        ║
    ║                                                           ║
    ║   📋 Default Admin Credentials:                           ║
    ║      Username: admin                                      ║
    ║      Password: admin123                                   ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
