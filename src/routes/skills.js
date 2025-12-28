const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
    try {
        const data = await db.getAllSkills();
        res.json(data);
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add skill
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, category, level, icon, sort_order } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newSkill = await db.addSkill({
            name,
            category: category || 'technical',
            level: level || 50,
            icon: icon || '',
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, data: newSkill });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update skill
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getSkillById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        const updated = await db.updateSkill(id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete skill
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getSkillById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        await db.deleteSkill(id);
        res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
