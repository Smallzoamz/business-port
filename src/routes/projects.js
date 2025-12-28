const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
    try {
        const data = await db.getAllProjects();
        res.json(data);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add project
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, category, image, link, github_link, technologies, featured, sort_order } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newProject = await db.addProject({
            title,
            description: description || '',
            category: category || '',
            image: image || '',
            link: link || '',
            github_link: github_link || '',
            technologies: technologies || '',
            featured: featured ? 1 : 0,
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update project
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getProjectById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updates = { ...req.body };
        if (updates.featured !== undefined) {
            updates.featured = updates.featured ? 1 : 0;
        }

        const updated = await db.updateProject(id, updates);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete project
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getProjectById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await db.deleteProject(id);
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
