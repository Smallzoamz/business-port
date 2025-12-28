const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all portfolio data (public)
router.get('/', (req, res) => {
    try {
        const personalInfo = db.getPersonalInfo();
        const education = db.getAllEducation();
        const experience = db.getAllExperience();
        const projects = db.getAllProjects();
        const skills = db.getAllSkills();
        const certifications = db.getAllCertifications();
        const contact = db.getContactInfo();
        const settings = db.getSiteSettings();

        res.json({
            personalInfo,
            education,
            experience,
            projects,
            skills,
            certifications,
            contact,
            settings
        });
    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get personal info
router.get('/personal', (req, res) => {
    try {
        const data = db.getPersonalInfo();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update personal info
router.put('/personal', requireAuth, (req, res) => {
    try {
        const updated = db.updatePersonalInfo(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update personal info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get contact info
router.get('/contact', (req, res) => {
    try {
        const data = db.getContactInfo();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update contact info
router.put('/contact', requireAuth, (req, res) => {
    try {
        const updated = db.updateContactInfo(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update contact info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get site settings
router.get('/settings', (req, res) => {
    try {
        const data = db.getSiteSettings();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update site settings
router.put('/settings', requireAuth, (req, res) => {
    try {
        const updated = db.updateSiteSettings(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
