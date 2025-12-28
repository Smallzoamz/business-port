const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all portfolio data (public)
router.get('/', async (req, res) => {
    try {
        const personalInfo = await db.getPersonalInfo();
        const education = await db.getAllEducation();
        const experience = await db.getAllExperience();
        const projects = await db.getAllProjects();
        const skills = await db.getAllSkills();
        const certifications = await db.getAllCertifications();
        const contact = await db.getContactInfo();
        const settings = await db.getSiteSettings();

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
router.get('/personal', async (req, res) => {
    try {
        const data = await db.getPersonalInfo();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update personal info
router.put('/personal', requireAuth, async (req, res) => {
    try {
        const updated = await db.updatePersonalInfo(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update personal info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get contact info
router.get('/contact', async (req, res) => {
    try {
        const data = await db.getContactInfo();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update contact info
router.put('/contact', requireAuth, async (req, res) => {
    try {
        const updated = await db.updateContactInfo(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update contact info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get site settings
router.get('/settings', async (req, res) => {
    try {
        const data = await db.getSiteSettings();
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update site settings
router.put('/settings', requireAuth, async (req, res) => {
    try {
        const updated = await db.updateSiteSettings(req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
