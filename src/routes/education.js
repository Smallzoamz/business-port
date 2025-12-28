const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all education
router.get('/', (req, res) => {
    try {
        const data = db.getAllEducation();
        res.json(data);
    } catch (error) {
        console.error('Get education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add education
router.post('/', requireAuth, (req, res) => {
    try {
        const { institution, degree, field, start_year, end_year, gpa, description, logo, is_current, sort_order } = req.body;

        if (!institution || !degree) {
            return res.status(400).json({ error: 'Institution and degree are required' });
        }

        const newEducation = db.addEducation({
            institution,
            degree,
            field: field || '',
            start_year: start_year || '',
            end_year: end_year || '',
            gpa: gpa || '',
            description: description || '',
            logo: logo || '',
            is_current: is_current ? 1 : 0,
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, data: newEducation });
    } catch (error) {
        console.error('Add education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update education
router.put('/:id', requireAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = db.getEducationById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Education not found' });
        }

        const updates = { ...req.body };
        if (updates.is_current !== undefined) {
            updates.is_current = updates.is_current ? 1 : 0;
        }

        const updated = db.updateEducation(id, updates);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete education
router.delete('/:id', requireAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = db.getEducationById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Education not found' });
        }

        db.deleteEducation(id);
        res.json({ success: true, message: 'Education deleted' });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
