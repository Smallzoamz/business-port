/**
 * Database Module - Hybrid PostgreSQL/JSON
 * Uses PostgreSQL when DATABASE_URL is set, falls back to JSON file for local dev
 */

// Check if PostgreSQL is configured
if (process.env.DATABASE_URL) {
    console.log('Using PostgreSQL database');
    module.exports = require('./db-pg');
} else {
    console.log('Using JSON file database (set DATABASE_URL for PostgreSQL)');

    // Keep the original JSON-based implementation for local development
    const fs = require('fs');
    const path = require('path');
    const bcrypt = require('bcryptjs');

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'portfolio.json');

    // Default data structure
    const defaultData = {
        users: [
            {
                id: 1,
                username: 'admin',
                password: bcrypt.hashSync('admin123', 10),
                created_at: new Date().toISOString()
            }
        ],
        personal_info: {
            id: 1,
            full_name: 'ชื่อ-นามสกุล',
            title: 'Modern Management Professional',
            subtitle: 'นักศึกษาคณะบริหารธุรกิจ สาขา Modern Management',
            profile_image: '',
            bio: 'นักศึกษาที่กำลังจะเข้าศึกษาต่อในระดับมหาวิทยาลัย ที่มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น คณะบริหารธุรกิจ สาขา Modern Management มีความสนใจในด้านการบริหารธุรกิจยุคใหม่ การวางแผนกลยุทธ์ และการจัดการทรัพยากรมนุษย์',
            resume_file: ''
        },
        education: [
            {
                id: 1,
                institution: 'มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น',
                degree: 'ปริญญาตรี',
                field: 'คณะบริหารธุรกิจ สาขา Modern Management',
                start_year: '2568',
                end_year: '',
                gpa: '',
                description: 'กำลังจะเข้าศึกษาในระดับปริญญาตรี ในสาขาการจัดการธุรกิจสมัยใหม่',
                logo: '',
                is_current: 1,
                sort_order: 0
            }
        ],
        experience: [],
        projects: [],
        skills: [
            { id: 1, name: 'Strategic Planning', category: 'management', level: 85, icon: '', sort_order: 0 },
            { id: 2, name: 'Business Analysis', category: 'management', level: 80, icon: '', sort_order: 1 },
            { id: 3, name: 'Project Management', category: 'management', level: 75, icon: '', sort_order: 2 },
            { id: 4, name: 'Team Leadership', category: 'soft', level: 85, icon: '', sort_order: 3 },
            { id: 5, name: 'Communication', category: 'soft', level: 90, icon: '', sort_order: 4 },
            { id: 6, name: 'Problem Solving', category: 'soft', level: 85, icon: '', sort_order: 5 },
            { id: 7, name: 'Microsoft Office', category: 'technical', level: 90, icon: '', sort_order: 6 },
            { id: 8, name: 'Data Analysis', category: 'technical', level: 70, icon: '', sort_order: 7 },
            { id: 9, name: 'Digital Marketing', category: 'technical', level: 75, icon: '', sort_order: 8 }
        ],
        certifications: [],
        contact_info: {
            id: 1,
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
            id: 1,
            site_title: 'Business Portfolio',
            meta_description: 'Professional Portfolio for Modern Management',
            favicon_url: '',
            primary_color: '#00d4ff',
            secondary_color: '#7c3aed',
            show_experience: 1,
            show_projects: 1,
            show_skills: 1,
            show_certifications: 1
        },
        counters: {
            education: 1,
            experience: 0,
            projects: 0,
            skills: 9,
            certifications: 0
        }
    };

    // Load or create database
    function loadDB() {
        try {
            if (fs.existsSync(dbPath)) {
                const data = fs.readFileSync(dbPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading database:', error);
        }
        return JSON.parse(JSON.stringify(defaultData));
    }

    // Save database
    function saveDB(data) {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error saving database:', error);
            return false;
        }
    }

    // Initialize database if needed
    if (!fs.existsSync(dbPath)) {
        saveDB(defaultData);
        console.log('Database initialized with default data');
        console.log('Default Admin Credentials: admin / admin123');
    }

    // Database class that mimics simple operations
    class Database {
        constructor() {
            this.data = loadDB();
        }

        reload() {
            this.data = loadDB();
        }

        save() {
            return saveDB(this.data);
        }

        // Async wrapper for compatibility with PostgreSQL version
        async init() {
            // No-op for JSON database
        }

        // Users
        getUserByUsername(username) {
            return this.data.users.find(u => u.username === username);
        }

        getUserById(id) {
            return this.data.users.find(u => u.id === id);
        }

        updateUserPassword(id, hashedPassword) {
            const user = this.getUserById(id);
            if (user) {
                user.password = hashedPassword;
                user.updated_at = new Date().toISOString();
                this.save();
                return true;
            }
            return false;
        }

        // Personal Info
        getPersonalInfo() {
            return this.data.personal_info;
        }

        updatePersonalInfo(updates) {
            Object.keys(updates).forEach(key => {
                if (updates[key] !== null && updates[key] !== undefined) {
                    this.data.personal_info[key] = updates[key];
                }
            });
            this.data.personal_info.updated_at = new Date().toISOString();
            this.save();
            return this.data.personal_info;
        }

        // Contact Info
        getContactInfo() {
            return this.data.contact_info;
        }

        updateContactInfo(updates) {
            Object.keys(updates).forEach(key => {
                if (updates[key] !== null && updates[key] !== undefined) {
                    this.data.contact_info[key] = updates[key];
                }
            });
            this.data.contact_info.updated_at = new Date().toISOString();
            this.save();
            return this.data.contact_info;
        }

        // Site Settings
        getSiteSettings() {
            return this.data.site_settings;
        }

        updateSiteSettings(updates) {
            Object.keys(updates).forEach(key => {
                if (updates[key] !== null && updates[key] !== undefined) {
                    this.data.site_settings[key] = updates[key];
                }
            });
            this.data.site_settings.updated_at = new Date().toISOString();
            this.save();
            return this.data.site_settings;
        }

        // Education
        getAllEducation() {
            return this.data.education.sort((a, b) => a.sort_order - b.sort_order);
        }

        addEducation(data) {
            this.data.counters.education++;
            const item = {
                id: this.data.counters.education,
                ...data,
                created_at: new Date().toISOString()
            };
            this.data.education.push(item);
            this.save();
            return item;
        }

        updateEducation(id, updates) {
            const index = this.data.education.findIndex(e => e.id === id);
            if (index !== -1) {
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== null && updates[key] !== undefined) {
                        this.data.education[index][key] = updates[key];
                    }
                });
                this.data.education[index].updated_at = new Date().toISOString();
                this.save();
                return this.data.education[index];
            }
            return null;
        }

        deleteEducation(id) {
            const index = this.data.education.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.education.splice(index, 1);
                this.save();
                return true;
            }
            return false;
        }

        getEducationById(id) {
            return this.data.education.find(e => e.id === id);
        }

        // Experience
        getAllExperience() {
            return this.data.experience.sort((a, b) => a.sort_order - b.sort_order);
        }

        addExperience(data) {
            this.data.counters.experience++;
            const item = {
                id: this.data.counters.experience,
                ...data,
                created_at: new Date().toISOString()
            };
            this.data.experience.push(item);
            this.save();
            return item;
        }

        updateExperience(id, updates) {
            const index = this.data.experience.findIndex(e => e.id === id);
            if (index !== -1) {
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== null && updates[key] !== undefined) {
                        this.data.experience[index][key] = updates[key];
                    }
                });
                this.data.experience[index].updated_at = new Date().toISOString();
                this.save();
                return this.data.experience[index];
            }
            return null;
        }

        deleteExperience(id) {
            const index = this.data.experience.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.experience.splice(index, 1);
                this.save();
                return true;
            }
            return false;
        }

        getExperienceById(id) {
            return this.data.experience.find(e => e.id === id);
        }

        // Projects
        getAllProjects() {
            return this.data.projects.sort((a, b) => {
                if (b.featured !== a.featured) return b.featured - a.featured;
                return a.sort_order - b.sort_order;
            });
        }

        addProject(data) {
            this.data.counters.projects++;
            const item = {
                id: this.data.counters.projects,
                ...data,
                created_at: new Date().toISOString()
            };
            this.data.projects.push(item);
            this.save();
            return item;
        }

        updateProject(id, updates) {
            const index = this.data.projects.findIndex(e => e.id === id);
            if (index !== -1) {
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== null && updates[key] !== undefined) {
                        this.data.projects[index][key] = updates[key];
                    }
                });
                this.data.projects[index].updated_at = new Date().toISOString();
                this.save();
                return this.data.projects[index];
            }
            return null;
        }

        deleteProject(id) {
            const index = this.data.projects.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.projects.splice(index, 1);
                this.save();
                return true;
            }
            return false;
        }

        getProjectById(id) {
            return this.data.projects.find(e => e.id === id);
        }

        // Skills
        getAllSkills() {
            return this.data.skills.sort((a, b) => {
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                return a.sort_order - b.sort_order;
            });
        }

        addSkill(data) {
            this.data.counters.skills++;
            const item = {
                id: this.data.counters.skills,
                ...data,
                created_at: new Date().toISOString()
            };
            this.data.skills.push(item);
            this.save();
            return item;
        }

        updateSkill(id, updates) {
            const index = this.data.skills.findIndex(e => e.id === id);
            if (index !== -1) {
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== null && updates[key] !== undefined) {
                        this.data.skills[index][key] = updates[key];
                    }
                });
                this.data.skills[index].updated_at = new Date().toISOString();
                this.save();
                return this.data.skills[index];
            }
            return null;
        }

        deleteSkill(id) {
            const index = this.data.skills.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.skills.splice(index, 1);
                this.save();
                return true;
            }
            return false;
        }

        getSkillById(id) {
            return this.data.skills.find(e => e.id === id);
        }

        // Certifications
        getAllCertifications() {
            return this.data.certifications.sort((a, b) => a.sort_order - b.sort_order);
        }

        addCertification(data) {
            this.data.counters.certifications++;
            const item = {
                id: this.data.counters.certifications,
                ...data,
                created_at: new Date().toISOString()
            };
            this.data.certifications.push(item);
            this.save();
            return item;
        }

        updateCertification(id, updates) {
            const index = this.data.certifications.findIndex(e => e.id === id);
            if (index !== -1) {
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== null && updates[key] !== undefined) {
                        this.data.certifications[index][key] = updates[key];
                    }
                });
                this.data.certifications[index].updated_at = new Date().toISOString();
                this.save();
                return this.data.certifications[index];
            }
            return null;
        }

        deleteCertification(id) {
            const index = this.data.certifications.findIndex(e => e.id === id);
            if (index !== -1) {
                this.data.certifications.splice(index, 1);
                this.save();
                return true;
            }
            return false;
        }

        getCertificationById(id) {
            return this.data.certifications.find(e => e.id === id);
        }
    }

    module.exports = new Database();
}
