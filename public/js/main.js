/**
 * Business Portfolio - Main JavaScript
 * Handles data fetching, rendering, animations, and interactions
 */

// Global state
let portfolioData = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initScrollEffects();
    loadPortfolioData();
    initCurrentYear();
    initTypingEffect();
    initSatelliteWords();
});

// ========================================
// Data Loading
// ========================================

async function loadPortfolioData() {
    try {
        const response = await fetch('/api/portfolio');
        portfolioData = await response.json();

        renderPersonalInfo(portfolioData.personalInfo);
        renderEducation(portfolioData.education);
        renderExperience(portfolioData.experience);
        renderProjects(portfolioData.projects);
        renderSkills(portfolioData.skills);
        renderCertifications(portfolioData.certifications);
        renderContact(portfolioData.contact);
        renderSettings(portfolioData.settings);
        updateStats(portfolioData);

        // Initialize reveal animations after content is loaded
        setTimeout(initRevealAnimations, 100);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

function renderSettings(settings) {
    if (!settings) return;

    // Update page title
    if (settings.site_title) {
        document.title = settings.site_title;
    }

    // Update meta description
    if (settings.meta_description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', settings.meta_description);
        }
    }

    // Update favicon
    if (settings.favicon_url) {
        const favicon = document.getElementById('site-favicon');
        if (favicon) {
            favicon.href = settings.favicon_url;
        }
    }
}

// ========================================
// Render Functions
// ========================================

function renderPersonalInfo(info) {
    if (!info) return;

    // Hero section
    if (info.full_name) {
        document.getElementById('hero-name').textContent = info.full_name;
    }
    if (info.title) {
        document.getElementById('hero-title').textContent = info.title;
        document.getElementById('about-title').textContent = info.title;
    }
    if (info.subtitle) {
        document.getElementById('hero-subtitle').textContent = info.subtitle;
    }
    if (info.bio) {
        document.getElementById('about-bio').textContent = info.bio;
    }
    if (info.profile_image) {
        const heroProfile = document.getElementById('hero-profile');
        const aboutImage = document.getElementById('about-image');

        heroProfile.innerHTML = `<img src="${info.profile_image}" alt="${info.full_name}">`;
        aboutImage.innerHTML = `<img src="${info.profile_image}" alt="${info.full_name}">`;
    }
    if (info.resume_file) {
        const downloadBtn = document.getElementById('download-resume');
        const contactResumeBtn = document.getElementById('contact-resume');

        downloadBtn.href = info.resume_file;
        downloadBtn.style.display = 'inline-flex';
        downloadBtn.setAttribute('download', '');

        contactResumeBtn.href = info.resume_file;
        contactResumeBtn.style.display = 'flex';
        contactResumeBtn.setAttribute('download', '');
    }
}

function renderEducation(education) {
    const timeline = document.getElementById('education-timeline');

    if (!education || education.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-graduation-cap"></i>
                <p>กำลังอัพเดทข้อมูลการศึกษา</p>
            </div>
        `;
        return;
    }

    timeline.innerHTML = education.map((item, index) => `
        <div class="timeline-item reveal ${index % 2 === 0 ? 'stagger-1' : 'stagger-2'}">
            <div class="timeline-dot"></div>
            <div class="timeline-content hover-lift hover-border">
                <span class="timeline-date">
                    ${item.start_year}${item.end_year ? ` - ${item.end_year}` : ' - ปัจจุบัน'}
                </span>
                <h3 class="timeline-title">${item.institution}</h3>
                <p class="timeline-subtitle">${item.degree}${item.field ? ` - ${item.field}` : ''}</p>
                ${item.description ? `<p class="timeline-text">${item.description}</p>` : ''}
                ${item.gpa ? `<p class="timeline-text">GPA: ${item.gpa}</p>` : ''}
                ${item.is_current ? `
                    <div class="timeline-current">
                        <span class="dot"></span>
                        กำลังศึกษา
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderExperience(experience) {
    const timeline = document.getElementById('experience-timeline');
    const emptyState = document.getElementById('experience-empty');

    if (!experience || experience.length === 0) {
        timeline.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    timeline.style.display = 'block';
    emptyState.style.display = 'none';

    timeline.innerHTML = experience.map((item, index) => `
        <div class="timeline-item reveal ${index % 2 === 0 ? 'stagger-1' : 'stagger-2'}">
            <div class="timeline-dot"></div>
            <div class="timeline-content hover-lift hover-border">
                <span class="timeline-date">
                    ${item.start_date}${item.end_date ? ` - ${item.end_date}` : ' - ปัจจุบัน'}
                </span>
                <h3 class="timeline-title">${item.position}</h3>
                <p class="timeline-subtitle">${item.company}${item.location ? ` • ${item.location}` : ''}</p>
                ${item.description ? `<p class="timeline-text">${item.description}</p>` : ''}
                ${item.achievements ? `
                    <div class="timeline-text">
                        <strong>ผลงาน:</strong> ${item.achievements}
                    </div>
                ` : ''}
                ${item.is_current ? `
                    <div class="timeline-current">
                        <span class="dot"></span>
                        ปัจจุบัน
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    const filter = document.getElementById('projects-filter');
    const emptyState = document.getElementById('projects-empty');

    if (!projects || projects.length === 0) {
        grid.style.display = 'none';
        filter.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    filter.style.display = 'flex';
    emptyState.style.display = 'none';

    // Get unique categories
    const categories = [...new Set(projects.filter(p => p.category).map(p => p.category))];

    // Render filter buttons
    if (categories.length > 0) {
        filter.innerHTML = `
            <button class="filter-btn active" data-filter="all">ทั้งหมด</button>
            ${categories.map(cat => `
                <button class="filter-btn" data-filter="${cat}">${cat}</button>
            `).join('')}
        `;

        // Add filter event listeners
        filter.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => filterProjects(btn.dataset.filter));
        });
    }

    // Render projects
    grid.innerHTML = projects.map((project, index) => `
        <div class="project-card reveal stagger-${(index % 3) + 1}" data-category="${project.category || ''}">
            <div class="project-image">
                ${project.image ? `<img src="${project.image}" alt="${project.title}">` : '<i class="fas fa-project-diagram"></i>'}
                ${project.featured ? '<span class="project-featured">Featured</span>' : ''}
            </div>
            <div class="project-content">
                ${project.category ? `<span class="project-category">${project.category}</span>` : ''}
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description || ''}</p>
                ${project.technologies ? `
                    <div class="project-tech">
                        ${project.technologies.split(',').map(tech => `<span>${tech.trim()}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-links">
                    ${project.link ? `
                        <a href="${project.link}" class="project-link" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Demo
                        </a>
                    ` : ''}
                    ${project.github_link ? `
                        <a href="${project.github_link}" class="project-link" target="_blank">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function filterProjects(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 50);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    });
}

function renderSkills(skills) {
    if (!skills || skills.length === 0) return;

    const categories = {
        management: document.querySelector('#skills-management .skills-list'),
        technical: document.querySelector('#skills-technical .skills-list'),
        soft: document.querySelector('#skills-soft .skills-list')
    };

    // Clear existing
    Object.values(categories).forEach(el => el.innerHTML = '');

    skills.forEach(skill => {
        const category = skill.category || 'technical';
        const container = categories[category];

        if (container) {
            container.innerHTML += `
                <div class="skill-item reveal">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" data-level="${skill.level}" style="width: 0%"></div>
                    </div>
                </div>
            `;
        }
    });

    // Hide empty categories
    Object.entries(categories).forEach(([key, el]) => {
        const parent = el.closest('.skills-category');
        if (el.children.length === 0) {
            parent.style.display = 'none';
        } else {
            parent.style.display = 'block';
        }
    });
}

function renderCertifications(certifications) {
    const grid = document.getElementById('certs-grid');
    const emptyState = document.getElementById('certs-empty');

    if (!certifications || certifications.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = certifications.map((cert, index) => `
        <div class="cert-card reveal stagger-${(index % 3) + 1}">
            <div class="cert-icon">
                ${cert.image ? `<img src="${cert.image}" alt="${cert.name}">` : '<i class="fas fa-certificate"></i>'}
            </div>
            <div class="cert-info">
                <h4 class="cert-name">${cert.name}</h4>
                ${cert.issuer ? `<p class="cert-issuer">${cert.issuer}</p>` : ''}
                ${cert.date ? `<p class="cert-date">ได้รับเมื่อ: ${cert.date}</p>` : ''}
                ${cert.credential_url ? `
                    <a href="${cert.credential_url}" class="cert-link" target="_blank">
                        <i class="fas fa-external-link-alt"></i> ดูใบรับรอง
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderContact(contact) {
    if (!contact) return;

    // Email
    const emailEl = document.getElementById('contact-email');
    if (contact.email) {
        emailEl.href = `mailto:${contact.email}`;
        emailEl.querySelector('.value').textContent = contact.email;
    }

    // Phone
    const phoneEl = document.getElementById('contact-phone');
    if (contact.phone) {
        phoneEl.href = `tel:${contact.phone}`;
        phoneEl.querySelector('.value').textContent = contact.phone;
    }

    // Address
    const addressEl = document.getElementById('contact-address');
    if (contact.address) {
        addressEl.querySelector('.value').textContent = contact.address;
    }

    // Social links
    const socialContainer = document.getElementById('social-links');
    const socials = [
        { key: 'linkedin', icon: 'fab fa-linkedin-in', url: contact.linkedin },
        { key: 'github', icon: 'fab fa-github', url: contact.github },
        { key: 'facebook', icon: 'fab fa-facebook-f', url: contact.facebook },
        { key: 'instagram', icon: 'fab fa-instagram', url: contact.instagram },
        { key: 'twitter', icon: 'fab fa-twitter', url: contact.twitter },
        { key: 'website', icon: 'fas fa-globe', url: contact.website }
    ];

    socialContainer.innerHTML = socials
        .filter(s => s.url)
        .map(s => `
            <a href="${s.url}" class="social-link" target="_blank" rel="noopener">
                <i class="${s.icon}"></i>
            </a>
        `).join('');
}

function updateStats(data) {
    document.getElementById('stat-education').textContent = data.education?.length || 0;
    document.getElementById('stat-experience').textContent = data.experience?.length || 0;
    document.getElementById('stat-projects').textContent = data.projects?.length || 0;
    document.getElementById('stat-certs').textContent = data.certifications?.length || 0;
}

// ========================================
// Particles Background
// ========================================

function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50; // More particles

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${4 + Math.random() * 6}s`; // Faster: 4-10s instead of 15-25s

        // Random sizes and colors
        const size = 2 + Math.random() * 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random color between cyan and purple
        const hue = Math.random() > 0.5 ? '186' : '263'; // Cyan or Purple
        particle.style.background = `hsl(${hue}, 100%, 50%)`;
        particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 50%)`;

        container.appendChild(particle);
    }
}

// ========================================
// Navigation
// ========================================

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active link
        updateActiveNavLink();
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);

        if (link) {
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
}

// ========================================
// Scroll Effects
// ========================================

function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle internal anchor links, not external URLs
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');

        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }

        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');

                // Animate skill bars
                if (entry.target.classList.contains('skill-item')) {
                    const progressBar = entry.target.querySelector('.skill-progress');
                    if (progressBar) {
                        const level = progressBar.dataset.level;
                        progressBar.style.width = `${level}%`;
                    }
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ========================================
// Utilities
// ========================================

function initCurrentYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// Typing Effect for Hero Title
function initTypingEffect() {
    const nameEl = document.getElementById('hero-name');
    if (!nameEl) return;

    const originalText = nameEl.textContent;
    if (!originalText || originalText === 'ชื่อ-นามสกุล') return;

    nameEl.textContent = '';
    nameEl.style.borderRight = '3px solid var(--accent-primary)';

    let i = 0;
    const speed = 100;

    function type() {
        if (i < originalText.length) {
            nameEl.textContent += originalText.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Blink cursor then remove
            let blinks = 0;
            const blinkInterval = setInterval(() => {
                nameEl.style.borderRight = nameEl.style.borderRight === 'none' ? '3px solid var(--accent-primary)' : 'none';
                blinks++;
                if (blinks > 6) {
                    clearInterval(blinkInterval);
                    nameEl.style.borderRight = 'none';
                }
            }, 500);
        }
    }

    setTimeout(type, 500); // Start after 0.5s
}

// Floating Tags Animation
function initFloatingTags() {
    const tags = document.querySelectorAll('.skill-tag, .floating-tag');

    tags.forEach((tag, index) => {
        // Random floating animation
        const duration = 3 + Math.random() * 2;
        const delay = index * 0.2;

        tag.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
}

// Glowing Profile Frame
function initGlowingFrame() {
    const frame = document.querySelector('.profile-frame');
    if (!frame) return;

    // Add pulsing glow effect
    frame.style.animation = 'rotateBorder 20s linear infinite, glowPulse 2s ease-in-out infinite';

    // Add shimmer effect on hover
    frame.addEventListener('mouseenter', () => {
        frame.style.boxShadow = '0 0 60px rgba(0, 212, 255, 0.8), inset 0 0 30px rgba(0, 212, 255, 0.3)';
    });

    frame.addEventListener('mouseleave', () => {
        frame.style.boxShadow = '';
    });
}

// Animate counter
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    update();
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Satellite Words - True 3D Orbiting System
function initSatelliteWords() {
    const satellite = document.getElementById('satellite-word');
    const textEl = document.getElementById('sat-text');
    const iconEl = document.getElementById('sat-icon');

    if (!satellite || !textEl || !iconEl) return;

    const skills = [
        { text: 'Strategic Planning', icon: 'fas fa-chess', color: '#00d4ff' },
        { text: 'Digital Transformation', icon: 'fas fa-rocket', color: '#7c3aed' },
        { text: 'Project Management', icon: 'fas fa-tasks', color: '#10b981' },
        { text: 'Business Analytics', icon: 'fas fa-chart-pie', color: '#f59e0b' },
        { text: 'Team Leadership', icon: 'fas fa-users-cog', color: '#ec4899' }
    ];

    let currentIndex = 0;
    let angle = 0;
    let wasBehind = false;

    // MATCH CSS: .orbit-ring { rotateZ(45deg) rotateX(60deg) }
    const radius = 240;
    const phi = 60 * (Math.PI / 180); // rotateX
    const theta = 45 * (Math.PI / 180); // rotateZ
    const orbitSpeed = 0.005;

    function update3DPosition() {
        angle += orbitSpeed;
        if (angle >= Math.PI * 2) angle = 0;

        // 1. Position on flat circle in XY plane
        const x0 = radius * Math.cos(angle);
        const y0 = radius * Math.sin(angle);

        // 2. Flatten for 3D perspective (rotateX)
        // x' = x0, y' = y0 * cos(phi), z' = y0 * sin(phi)
        const x1 = x0;
        const y1 = y0 * Math.cos(phi);
        const z1 = y0 * Math.sin(phi); // Y becomes Z depth

        // 3. Rotate the ellipse to -45 deg (rotateZ)
        const x2 = x1 * Math.cos(theta) - y1 * Math.sin(theta);
        const y2 = x1 * Math.sin(theta) + y1 * Math.cos(theta);
        const z2 = z1;

        // Depth logic: Word change timing
        // z2 range: -233 to 233
        const isBehind = z2 < -20;
        const isChangingWord = z2 < -220; // Goes all the way behind before changing

        // Perspective scaling
        const scale = 1.0 + (z2 / radius) * 0.25;

        satellite.style.transform = `translate3d(calc(-50% + ${x2}px), calc(-50% + ${y2}px), ${z2}px) scale(${scale})`;

        if (satellite.style.visibility === 'hidden') {
            satellite.style.visibility = 'visible';
        }

        // Transparency and transition
        if (isBehind) {
            satellite.style.opacity = '0';
            if (isChangingWord && !wasBehind) {
                changeWord();
                wasBehind = true;
            }
        } else {
            satellite.style.opacity = '1';
            wasBehind = false;
        }

        requestAnimationFrame(update3DPosition);
    }

    function changeWord() {
        currentIndex = (currentIndex + 1) % skills.length;
        const skill = skills[currentIndex];
        textEl.textContent = skill.text;
        iconEl.className = skill.icon;
        iconEl.style.color = skill.color;
        satellite.style.borderColor = skill.color;
        satellite.style.boxShadow = `0 0 30px ${skill.color}66`;
    }

    update3DPosition();
}

