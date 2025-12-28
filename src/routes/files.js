const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let cloudinary = null;
if (useCloudinary) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Using Cloudinary for file uploads');
} else {
    console.log('Using local storage for file uploads (set CLOUDINARY_* env vars for cloud storage)');
}

// Configure multer - use memory storage for Cloudinary, disk storage for local
const storage = useCloudinary
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const uniqueName = `${uuidv4()}${ext}`;
            cb(null, uniqueName);
        }
    });

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'image/x-icon', 'image/vnd.microsoft.icon',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to upload buffer to Cloudinary
async function uploadToCloudinary(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'portfolio',
                resource_type: 'auto',
                ...options
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}

// List all uploaded files
router.get('/', requireAuth, async (req, res) => {
    try {
        if (useCloudinary) {
            // List files from Cloudinary
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'portfolio/',
                max_results: 100
            });
            const files = result.resources.map(r => ({
                filename: r.public_id.replace('portfolio/', ''),
                url: r.secure_url,
                size: r.bytes,
                uploadedAt: r.created_at
            }));
            return res.json(files);
        }

        // Local file listing
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => file !== '.gitkeep')
            .map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    url: `/uploads/${filename}`,
                    size: stats.size,
                    uploadedAt: stats.mtime
                };
            });

        res.json(files);
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload file
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (useCloudinary) {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, {
                public_id: uuidv4()
            });

            return res.json({
                success: true,
                file: {
                    filename: result.public_id,
                    originalName: req.file.originalname,
                    url: result.secure_url,
                    size: result.bytes,
                    mimetype: req.file.mimetype
                }
            });
        }

        // Local upload response
        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Delete file
router.delete('/:filename', requireAuth, async (req, res) => {
    try {
        const { filename } = req.params;

        if (useCloudinary) {
            // Delete from Cloudinary
            const publicId = filename.includes('/') ? filename : `portfolio/${filename}`;
            await cloudinary.uploader.destroy(publicId);
            return res.json({ success: true, message: 'File deleted' });
        }

        // Local file deletion
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

module.exports = router;
