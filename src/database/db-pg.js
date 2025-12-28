/**
 * PostgreSQL Database Module
 * Persistent database for Railway deployment
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Default data for initialization
const defaultData = {
    personal_info: {
        full_name: 'ชื่อ-นามสกุล',
        title: 'Modern Management Professional',
        subtitle: 'นักศึกษาคณะบริหารธุรกิจ สาขา Modern Management',
        profile_image: '',
        bio: 'นักศึกษาที่กำลังจะเข้าศึกษาต่อในระดับมหาวิทยาลัย',
        resume_file: ''
    },
    contact_info: {
        email: 'email@example.com',
        phone: '0xx-xxx-xxxx',
        address: '',
        linkedin: '',
        github: '',
        facebook: '',
        instagram: '',
        twitter: '',
        website: ''
    },
    site_settings: {
        site_title: 'Business Portfolio',
        meta_description: 'Professional Portfolio for Modern Management',
        favicon_url: '',
        primary_color: '#00d4ff',
        secondary_color: '#7c3aed'
    }
};

// Initialize database tables
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS personal_info (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                title VARCHAR(255),
                subtitle VARCHAR(255),
                bio TEXT,
                profile_image TEXT,
                resume_file TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS contact_info (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                linkedin VARCHAR(255),
                github VARCHAR(255),
                facebook VARCHAR(255),
                instagram VARCHAR(255),
                twitter VARCHAR(255),
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS site_settings (
                id SERIAL PRIMARY KEY,
                site_title VARCHAR(255),
                meta_description TEXT,
                favicon_url TEXT,
                primary_color VARCHAR(20),
                secondary_color VARCHAR(20),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS education (
                id SERIAL PRIMARY KEY,
                institution VARCHAR(255) NOT NULL,
                degree VARCHAR(255),
                field VARCHAR(255),
                start_year VARCHAR(20),
                end_year VARCHAR(20),
                gpa VARCHAR(20),
                description TEXT,
                logo TEXT,
                is_current INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS experience (
                id SERIAL PRIMARY KEY,
                company VARCHAR(255) NOT NULL,
                position VARCHAR(255),
                location VARCHAR(255),
                start_date VARCHAR(50),
                end_date VARCHAR(50),
                description TEXT,
                achievements TEXT,
                logo TEXT,
                is_current INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                technologies TEXT,
                image TEXT,
                link TEXT,
                github_link TEXT,
                featured INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS skills (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(50),
                level INTEGER DEFAULT 50,
                icon VARCHAR(255),
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS certifications (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                issuer VARCHAR(255),
                date VARCHAR(50),
                credential_url TEXT,
                image TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Check if admin user exists
        const userResult = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
        if (userResult.rows.length === 0) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await client.query(
                'INSERT INTO users (username, password) VALUES ($1, $2)',
                ['admin', hashedPassword]
            );
            console.log('Default admin user created: admin / admin123');
        }

        // Check if personal_info exists
        const personalResult = await client.query('SELECT id FROM personal_info LIMIT 1');
        if (personalResult.rows.length === 0) {
            await client.query(
                'INSERT INTO personal_info (full_name, title, subtitle, bio, profile_image, resume_file) VALUES ($1, $2, $3, $4, $5, $6)',
                [defaultData.personal_info.full_name, defaultData.personal_info.title, defaultData.personal_info.subtitle, defaultData.personal_info.bio, '', '']
            );
        }

        // Check if contact_info exists
        const contactResult = await client.query('SELECT id FROM contact_info LIMIT 1');
        if (contactResult.rows.length === 0) {
            await client.query(
                'INSERT INTO contact_info (email, phone, address, linkedin, github, facebook, instagram, twitter, website) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [defaultData.contact_info.email, defaultData.contact_info.phone, '', '', '', '', '', '', '']
            );
        }

        // Check if site_settings exists
        const settingsResult = await client.query('SELECT id FROM site_settings LIMIT 1');
        if (settingsResult.rows.length === 0) {
            await client.query(
                'INSERT INTO site_settings (site_title, meta_description, favicon_url, primary_color, secondary_color) VALUES ($1, $2, $3, $4, $5)',
                [defaultData.site_settings.site_title, defaultData.site_settings.meta_description, '', defaultData.site_settings.primary_color, defaultData.site_settings.secondary_color]
            );
        }

        console.log('PostgreSQL database initialized successfully');
    } catch (error) {
        console.error('Error initializing PostgreSQL database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Database class
class PostgresDatabase {
    constructor() {
        this.pool = pool;
        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            await initDatabase();
            this.initialized = true;
        }
    }

    // Users
    async getUserByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }

    async getUserById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    async updateUserPassword(id, hashedPassword) {
        await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, id]);
        return true;
    }

    // Personal Info
    async getPersonalInfo() {
        const result = await pool.query('SELECT * FROM personal_info LIMIT 1');
        return result.rows[0];
    }

    async updatePersonalInfo(updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            await pool.query(`UPDATE personal_info SET ${fields.join(', ')} WHERE id = 1`, values);
        }

        return this.getPersonalInfo();
    }

    // Contact Info
    async getContactInfo() {
        const result = await pool.query('SELECT * FROM contact_info LIMIT 1');
        return result.rows[0];
    }

    async updateContactInfo(updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            await pool.query(`UPDATE contact_info SET ${fields.join(', ')} WHERE id = 1`, values);
        }

        return this.getContactInfo();
    }

    // Site Settings
    async getSiteSettings() {
        const result = await pool.query('SELECT * FROM site_settings LIMIT 1');
        return result.rows[0];
    }

    async updateSiteSettings(updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            await pool.query(`UPDATE site_settings SET ${fields.join(', ')} WHERE id = 1`, values);
        }

        return this.getSiteSettings();
    }

    // Education
    async getAllEducation() {
        const result = await pool.query('SELECT * FROM education ORDER BY sort_order ASC');
        return result.rows;
    }

    async addEducation(data) {
        const result = await pool.query(
            'INSERT INTO education (institution, degree, field, start_year, end_year, gpa, description, logo, is_current, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [data.institution, data.degree, data.field, data.start_year, data.end_year, data.gpa, data.description, data.logo, data.is_current || 0, data.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateEducation(id, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            values.push(id);
            await pool.query(`UPDATE education SET ${fields.join(', ')} WHERE id = $${i}`, values);
        }

        return this.getEducationById(id);
    }

    async deleteEducation(id) {
        await pool.query('DELETE FROM education WHERE id = $1', [id]);
        return true;
    }

    async getEducationById(id) {
        const result = await pool.query('SELECT * FROM education WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Experience
    async getAllExperience() {
        const result = await pool.query('SELECT * FROM experience ORDER BY sort_order ASC');
        return result.rows;
    }

    async addExperience(data) {
        const result = await pool.query(
            'INSERT INTO experience (company, position, location, start_date, end_date, description, achievements, logo, is_current, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [data.company, data.position, data.location, data.start_date, data.end_date, data.description, data.achievements, data.logo, data.is_current || 0, data.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateExperience(id, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            values.push(id);
            await pool.query(`UPDATE experience SET ${fields.join(', ')} WHERE id = $${i}`, values);
        }

        return this.getExperienceById(id);
    }

    async deleteExperience(id) {
        await pool.query('DELETE FROM experience WHERE id = $1', [id]);
        return true;
    }

    async getExperienceById(id) {
        const result = await pool.query('SELECT * FROM experience WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Projects
    async getAllProjects() {
        const result = await pool.query('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC');
        return result.rows;
    }

    async addProject(data) {
        const result = await pool.query(
            'INSERT INTO projects (title, description, category, technologies, image, link, github_link, featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [data.title, data.description, data.category, data.technologies, data.image, data.link, data.github_link, data.featured || 0, data.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateProject(id, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            values.push(id);
            await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${i}`, values);
        }

        return this.getProjectById(id);
    }

    async deleteProject(id) {
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        return true;
    }

    async getProjectById(id) {
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Skills
    async getAllSkills() {
        const result = await pool.query('SELECT * FROM skills ORDER BY category ASC, sort_order ASC');
        return result.rows;
    }

    async addSkill(data) {
        const result = await pool.query(
            'INSERT INTO skills (name, category, level, icon, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [data.name, data.category, data.level || 50, data.icon, data.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateSkill(id, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            values.push(id);
            await pool.query(`UPDATE skills SET ${fields.join(', ')} WHERE id = $${i}`, values);
        }

        return this.getSkillById(id);
    }

    async deleteSkill(id) {
        await pool.query('DELETE FROM skills WHERE id = $1', [id]);
        return true;
    }

    async getSkillById(id) {
        const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Certifications
    async getAllCertifications() {
        const result = await pool.query('SELECT * FROM certifications ORDER BY sort_order ASC');
        return result.rows;
    }

    async addCertification(data) {
        const result = await pool.query(
            'INSERT INTO certifications (name, issuer, date, credential_url, image, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [data.name, data.issuer, data.date, data.credential_url, data.image, data.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateCertification(id, updates) {
        const fields = [];
        const values = [];
        let i = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null && value !== undefined) {
                fields.push(`${key} = $${i}`);
                values.push(value);
                i++;
            }
        }

        if (fields.length > 0) {
            fields.push(`updated_at = NOW()`);
            values.push(id);
            await pool.query(`UPDATE certifications SET ${fields.join(', ')} WHERE id = $${i}`, values);
        }

        return this.getCertificationById(id);
    }

    async deleteCertification(id) {
        await pool.query('DELETE FROM certifications WHERE id = $1', [id]);
        return true;
    }

    async getCertificationById(id) {
        const result = await pool.query('SELECT * FROM certifications WHERE id = $1', [id]);
        return result.rows[0];
    }
}

module.exports = new PostgresDatabase();
