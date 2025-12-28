const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all experience
router.get('/', async (req, res) => {
    try {
        const data = await db.getAllExperience();
        res.json(data);
    } catch (error) {
        console.error('Get experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add experience
router.post('/', requireAuth, async (req, res) => {
    try {
        const { company, position, location, start_date, end_date, description, achievements, logo, is_current, sort_order } = req.body;

        if (!company || !position) {
            return res.status(400).json({ error: 'Company and position are required' });
        }

        const newExperience = await db.addExperience({
            company,
            position,
            location: location || '',
            start_date: start_date || '',
            end_date: end_date || '',
            description: description || '',
            achievements: achievements || '',
            logo: logo || '',
            is_current: is_current ? 1 : 0,
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, data: newExperience });
    } catch (error) {
        console.error('Add experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update experience
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getExperienceById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        const updates = { ...req.body };
        if (updates.is_current !== undefined) {
            updates.is_current = updates.is_current ? 1 : 0;
        }

        const updated = await db.updateExperience(id, updates);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete experience
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getExperienceById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        await db.deleteExperience(id);
        res.json({ success: true, message: 'Experience deleted' });
    } catch (error) {
        console.error('Delete experience error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
