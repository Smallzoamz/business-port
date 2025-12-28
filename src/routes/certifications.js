const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all certifications
router.get('/', async (req, res) => {
    try {
        const data = await db.getAllCertifications();
        res.json(data);
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add certification
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, issuer, date, expiry_date, credential_id, credential_url, image, sort_order } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newCert = await db.addCertification({
            name,
            issuer: issuer || '',
            date: date || '',
            credential_url: credential_url || '',
            image: image || '',
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, data: newCert });
    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update certification
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getCertificationById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        const updated = await db.updateCertification(id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update certification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete certification
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await db.getCertificationById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        await db.deleteCertification(id);
        res.json({ success: true, message: 'Certification deleted' });
    } catch (error) {
        console.error('Delete certification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
