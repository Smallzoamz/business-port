/**
 * Admin Panel JavaScript
 * Handles CRUD operations, file uploads, and UI interactions
 */

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initNavigation();
    initForms();
    loadAllData();
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = '/admin/login.html';
        } else {
            document.getElementById('user-name').innerHTML = `
                <i class="fas fa-user-circle"></i>
                ${data.user.username}
            `;
        }
    } catch (error) {
        window.location.href = '/admin/login.html';
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login.html';
    } catch (error) {
        showToast('Logout failed', 'error');
    }
}

// ========================================
// Navigation
// ========================================

function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) {
                switchSection(section);
            }
        });
    });
}

function switchSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionId}`).classList.add('active');

    // Update title
    const titles = {
        personal: 'ข้อมูลส่วนตัว',
        education: 'การศึกษา',
        experience: 'ประสบการณ์ทำงาน',
        projects: 'โปรเจค / ผลงาน',
        skills: 'ทักษะ',
        certifications: 'ใบรับรอง',
        contact: 'ข้อมูลติดต่อ',
        files: 'จัดการไฟล์',
        settings: 'ตั้งค่า'
    };
    document.getElementById('page-title').textContent = titles[sectionId] || sectionId;
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// ========================================
// Load Data
// ========================================

async function loadAllData() {
    try {
        // Load portfolio data
        const response = await fetch('/api/portfolio');
        const data = await response.json();

        // Populate forms
        populatePersonalForm(data.personalInfo);
        populateContactForm(data.contact);
        populateSettingsForm(data.settings);

        // Render lists
        renderEducationList(data.education);
        renderExperienceList(data.experience);
        renderProjectsList(data.projects);
        renderSkillsList(data.skills);
        renderCertificationsList(data.certifications);

        // Load files
        loadFiles();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

// ========================================
// Personal Info
// ========================================

function populatePersonalForm(data) {
    if (!data) return;

    document.getElementById('full_name').value = data.full_name || '';
    document.getElementById('title').value = data.title || '';
    document.getElementById('subtitle').value = data.subtitle || '';
    document.getElementById('bio').value = data.bio || '';
    document.getElementById('profile_image').value = data.profile_image || '';
    document.getElementById('resume_file').value = data.resume_file || '';

    // Profile image preview
    const profilePreview = document.getElementById('profile-preview');
    if (data.profile_image) {
        profilePreview.innerHTML = `<img src="${data.profile_image}" alt="Profile">`;
    }

    // Resume preview
    const resumePreview = document.getElementById('resume-preview');
    if (data.resume_file) {
        resumePreview.classList.add('has-file');
        resumePreview.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>Resume uploaded ✓</span>
        `;
    }
}

// ========================================
// Contact Info
// ========================================

function populateContactForm(data) {
    if (!data) return;

    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('linkedin').value = data.linkedin || '';
    document.getElementById('github').value = data.github || '';
    document.getElementById('facebook').value = data.facebook || '';
    document.getElementById('instagram').value = data.instagram || '';
    document.getElementById('twitter').value = data.twitter || '';
    document.getElementById('website').value = data.website || '';
}

// ========================================
// Settings
// ========================================

function populateSettingsForm(data) {
    if (!data) return;

    document.getElementById('site_title').value = data.site_title || '';
    document.getElementById('meta_description').value = data.meta_description || '';
    document.getElementById('favicon_url').value = data.favicon_url || '';

    // Show favicon preview if exists
    if (data.favicon_url) {
        document.getElementById('favicon-preview').innerHTML = `<img src="${data.favicon_url}" alt="Favicon">`;
    }
}

// ========================================
// Education
// ========================================

function renderEducationList(items) {
    const container = document.getElementById('education-list');

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีข้อมูลการศึกษา</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="item-info">
                <div class="item-title">${item.institution}</div>
                <div class="item-subtitle">${item.degree}${item.field ? ` - ${item.field}` : ''}</div>
                <div class="item-meta">${item.start_year}${item.end_year ? ` - ${item.end_year}` : ' - ปัจจุบัน'}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editEducation(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="item-btn delete" onclick="deleteEducation(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// Experience
// ========================================

function renderExperienceList(items) {
    const container = document.getElementById('experience-list');

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีประสบการณ์ทำงาน</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-icon">
                <i class="fas fa-briefcase"></i>
            </div>
            <div class="item-info">
                <div class="item-title">${item.position}</div>
                <div class="item-subtitle">${item.company}</div>
                <div class="item-meta">${item.start_date}${item.end_date ? ` - ${item.end_date}` : ' - ปัจจุบัน'}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editExperience(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="item-btn delete" onclick="deleteExperience(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// Projects
// ========================================

function renderProjectsList(items) {
    const container = document.getElementById('projects-list');

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีโปรเจค</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="grid-card">
            <div class="grid-card-image">
                ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<i class="fas fa-project-diagram"></i>'}
            </div>
            <div class="grid-card-content">
                <div class="grid-card-title">${item.title}</div>
                <div class="grid-card-subtitle">${item.category || 'ไม่ระบุหมวดหมู่'}</div>
                <div class="grid-card-actions">
                    <button class="item-btn" onclick="editProject(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="item-btn delete" onclick="deleteProject(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// Skills
// ========================================

function renderSkillsList(items) {
    const container = document.getElementById('skills-list');

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีทักษะ</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="skill-card">
            <div class="skill-card-info">
                <div class="skill-card-name">${item.name}</div>
                <div class="skill-card-category">${item.category}</div>
            </div>
            <div class="skill-card-level">${item.level}%</div>
            <div class="item-actions">
                <button class="item-btn" onclick="editSkill(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="item-btn delete" onclick="deleteSkill(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// Certifications
// ========================================

function renderCertificationsList(items) {
    const container = document.getElementById('certifications-list');

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีใบรับรอง</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-icon">
                ${item.image ? `<img src="${item.image}" alt="">` : '<i class="fas fa-certificate"></i>'}
            </div>
            <div class="item-info">
                <div class="item-title">${item.name}</div>
                <div class="item-subtitle">${item.issuer || 'ไม่ระบุผู้ออก'}</div>
                <div class="item-meta">${item.date || ''}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn" onclick="editCertification(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="item-btn delete" onclick="deleteCertification(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// Files
// ========================================

async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        renderFilesList(files);
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

function renderFilesList(files) {
    const container = document.getElementById('files-list');

    if (!files || files.length === 0) {
        container.innerHTML = '<p class="empty-text">ยังไม่มีไฟล์</p>';
        return;
    }

    container.innerHTML = files.map(file => {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
        return `
            <div class="file-card">
                <div class="file-preview">
                    ${isImage ? `<img src="${file.url}" alt="${file.filename}">` : '<i class="fas fa-file"></i>'}
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.filename}">${file.filename}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-actions">
                        <button class="item-btn" onclick="copyFileUrl('${file.url}')" title="Copy URL">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="item-btn delete" onclick="deleteFile('${file.filename}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function uploadFiles(files) {
    if (!files || files.length === 0) return;

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('อัพโหลดไฟล์สำเร็จ', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            showToast(`อัพโหลดไฟล์ไม่สำเร็จ: ${file.name}`, 'error');
        }
    }

    loadFiles();
}

async function deleteFile(filename) {
    if (!confirm('ต้องการลบไฟล์นี้หรือไม่?')) return;

    try {
        const response = await fetch(`/api/files/${filename}`, { method: 'DELETE' });

        if (response.ok) {
            showToast('ลบไฟล์สำเร็จ', 'success');
            loadFiles();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        showToast('ลบไฟล์ไม่สำเร็จ', 'error');
    }
}

function copyFileUrl(url) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showToast('คัดลอก URL แล้ว', 'success');
}

// ========================================
// Forms
// ========================================

function initForms() {
    // Personal form
    document.getElementById('personal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePersonalInfo();
    });

    // Contact form
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveContactInfo();
    });

    // Settings form
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings();
    });

    // Password form
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });

    // Profile image upload
    document.getElementById('profile-preview').addEventListener('click', () => {
        document.getElementById('profile-image-input').click();
    });

    document.getElementById('profile-image-input').addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            await uploadProfileImage(e.target.files[0]);
        }
    });

    // Resume upload
    document.getElementById('resume-preview').addEventListener('click', () => {
        document.getElementById('resume-input').click();
    });

    document.getElementById('resume-input').addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            await uploadResume(e.target.files[0]);
        }
    });

    // Favicon upload
    document.getElementById('favicon-preview').addEventListener('click', () => {
        document.getElementById('favicon-input').click();
    });

    document.getElementById('favicon-input').addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            await uploadFavicon(e.target.files[0]);
        }
    });
}

async function savePersonalInfo() {
    const formData = {
        full_name: document.getElementById('full_name').value,
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        bio: document.getElementById('bio').value,
        profile_image: document.getElementById('profile_image').value,
        resume_file: document.getElementById('resume_file').value
    };

    try {
        const response = await fetch('/api/portfolio/personal', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('บันทึกข้อมูลสำเร็จ', 'success');
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        showToast('บันทึกข้อมูลไม่สำเร็จ', 'error');
    }
}

async function saveContactInfo() {
    const formData = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        facebook: document.getElementById('facebook').value,
        instagram: document.getElementById('instagram').value,
        twitter: document.getElementById('twitter').value,
        website: document.getElementById('website').value
    };

    try {
        const response = await fetch('/api/portfolio/contact', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('บันทึกข้อมูลสำเร็จ', 'success');
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        showToast('บันทึกข้อมูลไม่สำเร็จ', 'error');
    }
}

async function saveSettings() {
    const formData = {
        site_title: document.getElementById('site_title').value,
        meta_description: document.getElementById('meta_description').value,
        favicon_url: document.getElementById('favicon_url').value
    };

    try {
        const response = await fetch('/api/portfolio/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('บันทึกการตั้งค่าสำเร็จ', 'success');
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        showToast('บันทึกการตั้งค่าไม่สำเร็จ', 'error');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;

    try {
        const response = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
            document.getElementById('password-form').reset();
        } else {
            throw new Error(data.error || 'Change password failed');
        }
    } catch (error) {
        showToast(error.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error');
    }
}

async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profile_image').value = data.file.url;
            document.getElementById('profile-preview').innerHTML = `<img src="${data.file.url}" alt="Profile">`;
            showToast('อัพโหลดรูปภาพสำเร็จ', 'success');
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        showToast('อัพโหลดรูปภาพไม่สำเร็จ', 'error');
    }
}

async function uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('resume_file').value = data.file.url;
            const preview = document.getElementById('resume-preview');
            preview.classList.add('has-file');
            preview.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>Resume uploaded ✓</span>
            `;
            showToast('อัพโหลด Resume สำเร็จ', 'success');
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        showToast('อัพโหลด Resume ไม่สำเร็จ', 'error');
    }
}

async function uploadFavicon(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('favicon_url').value = data.file.url;
            document.getElementById('favicon-preview').innerHTML = `<img src="${data.file.url}" alt="Favicon">`;
            showToast('อัพโหลดไอคอนสำเร็จ', 'success');
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        showToast('อัพโหลดไอคอนไม่สำเร็จ', 'error');
    }
}

// ========================================
// Modals
// ========================================

let currentEditId = null;
let currentEditType = null;

function openModal(type, id = null) {
    currentEditId = id;
    currentEditType = type;

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    const isEdit = id !== null;

    const templates = {
        education: {
            title: isEdit ? 'แก้ไขการศึกษา' : 'เพิ่มการศึกษา',
            form: `
                <form id="modal-form" class="form-grid">
                    <div class="form-group">
                        <label>สถาบันการศึกษา *</label>
                        <input type="text" id="modal_institution" required>
                    </div>
                    <div class="form-group">
                        <label>ระดับการศึกษา *</label>
                        <input type="text" id="modal_degree" required placeholder="เช่น ปริญญาตรี">
                    </div>
                    <div class="form-group">
                        <label>สาขา / คณะ</label>
                        <input type="text" id="modal_field">
                    </div>
                    <div class="form-group">
                        <label>ปีเริ่มต้น</label>
                        <input type="text" id="modal_start_year" placeholder="2568">
                    </div>
                    <div class="form-group">
                        <label>ปีจบ (เว้นว่างถ้ากำลังศึกษา)</label>
                        <input type="text" id="modal_end_year" placeholder="2572">
                    </div>
                    <div class="form-group">
                        <label>GPA</label>
                        <input type="text" id="modal_gpa">
                    </div>
                    <div class="form-group">
                        <label>รายละเอียด</label>
                        <textarea id="modal_description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label><input type="checkbox" id="modal_is_current"> กำลังศึกษาอยู่</label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> บันทึก
                        </button>
                    </div>
                </form>
            `
        },
        experience: {
            title: isEdit ? 'แก้ไขประสบการณ์' : 'เพิ่มประสบการณ์',
            form: `
                <form id="modal-form" class="form-grid">
                    <div class="form-group">
                        <label>บริษัท / องค์กร *</label>
                        <input type="text" id="modal_company" required>
                    </div>
                    <div class="form-group">
                        <label>ตำแหน่ง *</label>
                        <input type="text" id="modal_position" required>
                    </div>
                    <div class="form-group">
                        <label>สถานที่</label>
                        <input type="text" id="modal_location">
                    </div>
                    <div class="form-group">
                        <label>เริ่มงาน</label>
                        <input type="text" id="modal_start_date" placeholder="มกราคม 2568">
                    </div>
                    <div class="form-group">
                        <label>สิ้นสุด (เว้นว่างถ้ายังทำอยู่)</label>
                        <input type="text" id="modal_end_date">
                    </div>
                    <div class="form-group">
                        <label>รายละเอียดงาน</label>
                        <textarea id="modal_description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>ผลงาน / ความสำเร็จ</label>
                        <textarea id="modal_achievements" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label><input type="checkbox" id="modal_is_current"> ยังทำงานอยู่</label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> บันทึก
                        </button>
                    </div>
                </form>
            `
        },
        project: {
            title: isEdit ? 'แก้ไขโปรเจค' : 'เพิ่มโปรเจค',
            form: `
                <form id="modal-form" class="form-grid">
                    <div class="form-group">
                        <label>ชื่อโปรเจค *</label>
                        <input type="text" id="modal_title" required>
                    </div>
                    <div class="form-group">
                        <label>หมวดหมู่</label>
                        <input type="text" id="modal_category" placeholder="เช่น Business Plan, Research">
                    </div>
                    <div class="form-group">
                        <label>รายละเอียด</label>
                        <textarea id="modal_description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>รูปภาพ URL</label>
                        <input type="text" id="modal_image" placeholder="/uploads/...">
                    </div>
                    <div class="form-group">
                        <label>Link Demo</label>
                        <input type="url" id="modal_link">
                    </div>
                    <div class="form-group">
                        <label>GitHub Link</label>
                        <input type="url" id="modal_github_link">
                    </div>
                    <div class="form-group">
                        <label>Technologies (คั่นด้วย comma)</label>
                        <input type="text" id="modal_technologies" placeholder="Excel, PowerPoint, Canva">
                    </div>
                    <div class="form-group">
                        <label><input type="checkbox" id="modal_featured"> Featured (แสดงเด่น)</label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> บันทึก
                        </button>
                    </div>
                </form>
            `
        },
        skill: {
            title: isEdit ? 'แก้ไขทักษะ' : 'เพิ่มทักษะ',
            form: `
                <form id="modal-form" class="form-grid">
                    <div class="form-group">
                        <label>ชื่อทักษะ *</label>
                        <input type="text" id="modal_name" required>
                    </div>
                    <div class="form-group">
                        <label>หมวดหมู่</label>
                        <select id="modal_category">
                            <option value="management">Management Skills</option>
                            <option value="technical">Technical Skills</option>
                            <option value="soft">Soft Skills</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>ระดับความชำนาญ (0-100)</label>
                        <input type="number" id="modal_level" min="0" max="100" value="50">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> บันทึก
                        </button>
                    </div>
                </form>
            `
        },
        certification: {
            title: isEdit ? 'แก้ไขใบรับรอง' : 'เพิ่มใบรับรอง',
            form: `
                <form id="modal-form" class="form-grid">
                    <div class="form-group">
                        <label>ชื่อใบรับรอง *</label>
                        <input type="text" id="modal_name" required>
                    </div>
                    <div class="form-group">
                        <label>ผู้ออกใบรับรอง</label>
                        <input type="text" id="modal_issuer">
                    </div>
                    <div class="form-group">
                        <label>วันที่ได้รับ</label>
                        <input type="text" id="modal_date" placeholder="มกราคม 2568">
                    </div>
                    <div class="form-group">
                        <label>วันหมดอายุ</label>
                        <input type="text" id="modal_expiry_date">
                    </div>
                    <div class="form-group">
                        <label>Credential ID</label>
                        <input type="text" id="modal_credential_id">
                    </div>
                    <div class="form-group">
                        <label>Credential URL</label>
                        <input type="url" id="modal_credential_url">
                    </div>
                    <div class="form-group">
                        <label>รูปภาพ URL</label>
                        <input type="text" id="modal_image" placeholder="/uploads/...">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> บันทึก
                        </button>
                    </div>
                </form>
            `
        }
    };

    const template = templates[type];
    if (!template) return;

    modalTitle.textContent = template.title;
    modalBody.innerHTML = template.form;

    // Attach form submit handler
    document.getElementById('modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveModalForm();
    });

    // If editing, load existing data
    if (isEdit) {
        loadModalData(type, id);
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    currentEditId = null;
    currentEditType = null;
}

async function loadModalData(type, id) {
    const endpoints = {
        education: '/api/education',
        experience: '/api/experience',
        project: '/api/projects',
        skill: '/api/skills',
        certification: '/api/certifications'
    };

    try {
        const response = await fetch(endpoints[type]);
        const items = await response.json();
        const item = items.find(i => i.id === id);

        if (!item) return;

        // Populate form fields based on type
        if (type === 'education') {
            document.getElementById('modal_institution').value = item.institution || '';
            document.getElementById('modal_degree').value = item.degree || '';
            document.getElementById('modal_field').value = item.field || '';
            document.getElementById('modal_start_year').value = item.start_year || '';
            document.getElementById('modal_end_year').value = item.end_year || '';
            document.getElementById('modal_gpa').value = item.gpa || '';
            document.getElementById('modal_description').value = item.description || '';
            document.getElementById('modal_is_current').checked = item.is_current;
        } else if (type === 'experience') {
            document.getElementById('modal_company').value = item.company || '';
            document.getElementById('modal_position').value = item.position || '';
            document.getElementById('modal_location').value = item.location || '';
            document.getElementById('modal_start_date').value = item.start_date || '';
            document.getElementById('modal_end_date').value = item.end_date || '';
            document.getElementById('modal_description').value = item.description || '';
            document.getElementById('modal_achievements').value = item.achievements || '';
            document.getElementById('modal_is_current').checked = item.is_current;
        } else if (type === 'project') {
            document.getElementById('modal_title').value = item.title || '';
            document.getElementById('modal_category').value = item.category || '';
            document.getElementById('modal_description').value = item.description || '';
            document.getElementById('modal_image').value = item.image || '';
            document.getElementById('modal_link').value = item.link || '';
            document.getElementById('modal_github_link').value = item.github_link || '';
            document.getElementById('modal_technologies').value = item.technologies || '';
            document.getElementById('modal_featured').checked = item.featured;
        } else if (type === 'skill') {
            document.getElementById('modal_name').value = item.name || '';
            document.getElementById('modal_category').value = item.category || 'technical';
            document.getElementById('modal_level').value = item.level || 50;
        } else if (type === 'certification') {
            document.getElementById('modal_name').value = item.name || '';
            document.getElementById('modal_issuer').value = item.issuer || '';
            document.getElementById('modal_date').value = item.date || '';
            document.getElementById('modal_expiry_date').value = item.expiry_date || '';
            document.getElementById('modal_credential_id').value = item.credential_id || '';
            document.getElementById('modal_credential_url').value = item.credential_url || '';
            document.getElementById('modal_image').value = item.image || '';
        }
    } catch (error) {
        console.error('Error loading modal data:', error);
    }
}

async function saveModalForm() {
    const type = currentEditType;
    const isEdit = currentEditId !== null;

    const endpoints = {
        education: '/api/education',
        experience: '/api/experience',
        project: '/api/projects',
        skill: '/api/skills',
        certification: '/api/certifications'
    };

    let formData = {};

    if (type === 'education') {
        formData = {
            institution: document.getElementById('modal_institution').value,
            degree: document.getElementById('modal_degree').value,
            field: document.getElementById('modal_field').value,
            start_year: document.getElementById('modal_start_year').value,
            end_year: document.getElementById('modal_end_year').value,
            gpa: document.getElementById('modal_gpa').value,
            description: document.getElementById('modal_description').value,
            is_current: document.getElementById('modal_is_current').checked
        };
    } else if (type === 'experience') {
        formData = {
            company: document.getElementById('modal_company').value,
            position: document.getElementById('modal_position').value,
            location: document.getElementById('modal_location').value,
            start_date: document.getElementById('modal_start_date').value,
            end_date: document.getElementById('modal_end_date').value,
            description: document.getElementById('modal_description').value,
            achievements: document.getElementById('modal_achievements').value,
            is_current: document.getElementById('modal_is_current').checked
        };
    } else if (type === 'project') {
        formData = {
            title: document.getElementById('modal_title').value,
            category: document.getElementById('modal_category').value,
            description: document.getElementById('modal_description').value,
            image: document.getElementById('modal_image').value,
            link: document.getElementById('modal_link').value,
            github_link: document.getElementById('modal_github_link').value,
            technologies: document.getElementById('modal_technologies').value,
            featured: document.getElementById('modal_featured').checked
        };
    } else if (type === 'skill') {
        formData = {
            name: document.getElementById('modal_name').value,
            category: document.getElementById('modal_category').value,
            level: parseInt(document.getElementById('modal_level').value)
        };
    } else if (type === 'certification') {
        formData = {
            name: document.getElementById('modal_name').value,
            issuer: document.getElementById('modal_issuer').value,
            date: document.getElementById('modal_date').value,
            expiry_date: document.getElementById('modal_expiry_date').value,
            credential_id: document.getElementById('modal_credential_id').value,
            credential_url: document.getElementById('modal_credential_url').value,
            image: document.getElementById('modal_image').value
        };
    }

    try {
        const url = isEdit ? `${endpoints[type]}/${currentEditId}` : endpoints[type];
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast(isEdit ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ', 'success');
            closeModal();
            loadAllData();
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        showToast('บันทึกไม่สำเร็จ', 'error');
    }
}

// ========================================
// Edit/Delete Functions
// ========================================

function editEducation(id) { openModal('education', id); }
function editExperience(id) { openModal('experience', id); }
function editProject(id) { openModal('project', id); }
function editSkill(id) { openModal('skill', id); }
function editCertification(id) { openModal('certification', id); }

async function deleteEducation(id) { await deleteItem('education', id); }
async function deleteExperience(id) { await deleteItem('experience', id); }
async function deleteProject(id) { await deleteItem('projects', id); }
async function deleteSkill(id) { await deleteItem('skills', id); }
async function deleteCertification(id) { await deleteItem('certifications', id); }

async function deleteItem(type, id) {
    if (!confirm('ต้องการลบรายการนี้หรือไม่?')) return;

    try {
        const response = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });

        if (response.ok) {
            showToast('ลบสำเร็จ', 'success');
            loadAllData();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        showToast('ลบไม่สำเร็จ', 'error');
    }
}

// ========================================
// Utilities
// ========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const text = toast.querySelector('.toast-message');

    toast.className = `toast ${type}`;
    icon.className = `toast-icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
    text.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
