/* ==========================================================================
   CONFIG & SETTINGS
   ========================================================================== */
const CONFIG = {
    // Enter your Web3Forms Access Key here to link your form to Airtable/Email.
    // Visit https://web3forms.com to retrieve a free access key instantly.
    web3forms_access_key: "4ee59ad1-d3af-4ab5-814b-9b8251891f06"
};

/* ==========================================================================
   APP INITIALIZATION & DOCK LOADING
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initCustomCursor();
    initProjectShowcase();
    initSkillsObserver();
    initMobileNav();
    initScrollObserver();
    initContactForm();
});

/* ==========================================================================
   NEBULA CANVAS PARTICLE SYSTEM
   ========================================================================== */
function initCanvas() {
    const canvas = document.getElementById('nebula-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    
    // Interaction coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120 // Distance of mouse interaction influence
    };

    // Auto-resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    }

    window.addEventListener('resize', resizeCanvas);
    
    // Mouse event bindings for particles
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle definition
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseSize = Math.random() * 2 + 1;
            this.size = this.baseSize;
            
            // Subtle speed
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            
            // Random opacity drift
            this.opacity = Math.random() * 0.4 + 0.15;
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(155, 81, 224, ';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }

        update() {
            // Mouse interaction physics
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.hypot(dx, dy);
                
                if (distance < mouse.radius) {
                    // Repel force
                    let force = (mouse.radius - distance) / mouse.radius;
                    let angle = Math.atan2(dy, dx);
                    
                    // Push particles away from mouse with ease
                    this.x -= Math.cos(angle) * force * 2.5;
                    this.y -= Math.sin(angle) * force * 2.5;
                    
                    // Pulse size gently near mouse
                    this.size = this.baseSize * (1 + force * 0.6);
                } else {
                    if (this.size > this.baseSize) {
                        this.size -= 0.05;
                    }
                }
            }

            // Normal drifting movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            
            this.draw();
        }
    }

    // Determine particle count based on screen density
    function createParticles() {
        particles = [];
        const baseDensity = window.innerWidth < 768 ? 40 : 90;
        
        for (let i = 0; i < baseDensity; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
    }

    // Draw connection paths between near particles (Constellation grid)
    function connectParticles() {
        let maxDistance = 140;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {
                    let opacity = (1 - (distance / maxDistance)) * 0.15;
                    ctx.strokeStyle = `rgba(154, 152, 180, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Canvas render loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => particle.update());
        connectParticles();
        
        animationFrameId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();
}

/* ==========================================================================
   CUSTOM CURSOR & MAGNETIC PULL INTERACTIONS
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const magneticElements = document.querySelectorAll('.magnetic');

    if (!cursor || !cursorDot) return;

    let mouseX = 0, mouseY = 0;     // Actual target mouse position
    let ringX = 0, ringY = 0;       // Delayed ring position (for smooth inertia)
    let dotX = 0, dotY = 0;         // Quick dot position

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate cursor frame loops (Interpolation)
    function renderCursor() {
        // Linear Interpolation (lerp) for smooth lag/inertia
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;

        cursor.style.left = `${ringX}px`;
        cursor.style.top = `${ringY}px`;

        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Setup Magnetic hover states and pulls
    magneticElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });

        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            elem.style.transform = 'translate3d(0px, 0px, 0px)';
        });

        // The Magnetic Pull effect: pull element slightly towards cursor
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            // Calculate absolute center of the target element
            const elemCenterX = rect.left + rect.width / 2;
            const elemCenterY = rect.top + rect.height / 2;

            // Offset between cursor and element center
            const dx = e.clientX - elemCenterX;
            const dy = e.clientY - elemCenterY;

            // Pull factor (dampener) - adjust how strongly it attracts
            const pullStrength = 0.25; 
            
            elem.style.transform = `translate3d(${dx * pullStrength}px, ${dy * pullStrength}px, 0px)`;
        });
    });
}

/* ==========================================================================
   PROJECT SHOWCASE - IDE CONTROLLER
   ========================================================================== */
function initProjectShowcase() {
    const fileItems = document.querySelectorAll('.file-tree .tree-item.file');
    const tabItems = document.querySelectorAll('.editor-tabs .editor-tab');
    const projectPanes = document.querySelectorAll('.editor-workspace .project-content');

    function switchProject(projectId) {
        // Clean active states on file explorer items
        fileItems.forEach(item => {
            if (item.getAttribute('data-project') === projectId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Clean active states on tabs
        tabItems.forEach(tab => {
            if (tab.getAttribute('data-project') === projectId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Switch active workspace project pane content
        projectPanes.forEach(pane => {
            const paneId = pane.getAttribute('id');
            if (paneId === `project-${projectId}`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    // Click handler for Sidebar Tree Items
    fileItems.forEach(item => {
        item.addEventListener('click', () => {
            const projectId = item.getAttribute('data-project');
            switchProject(projectId);
        });
    });

    // Click handler for Tabs
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const projectId = tab.getAttribute('data-project');
            switchProject(projectId);
        });
    });
}

/* ==========================================================================
   SKILLS BAR INTERSECTION OBSERVER
   ========================================================================== */
function initSkillsObserver() {
    const skillsSection = document.getElementById('skills');
    const skillBars = document.querySelectorAll('.skill-bar');

    if (!skillsSection || skillBars.length === 0) return;

    const observerOptions = {
        root: null,
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate each bar to its target capacity level
                skillBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-level');
                    bar.style.width = targetWidth;
                });
                // Once triggered, stop observing
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(skillsSection);
}

/* ==========================================================================
   MOBILE NAVIGATION TOGGLE MENU
   ========================================================================== */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    // Close mobile nav when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });
}

/* ==========================================================================
   ACTIVE SCROLL LINK HIGHLIGHTING
   ========================================================================== */
function initScrollObserver() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link:not(.btn-contact)');

    if (sections.length === 0 || navLinks.length === 0) return;

    const options = {
        root: null,
        rootMargin: '-50% 0px -50% 0px' // Trigger link highlight when section is centered
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   CONTACT FORM - MOCK SUBMIT ACTIONS
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const feedback = document.querySelector('.form-feedback-message');
    const submitBtn = document.querySelector('.btn-submit');
    const btnText = document.querySelector('.btn-submit .btn-text');

    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Visual loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Transmitting Proposal...';
        submitBtn.querySelector('i').className = 'fa-solid fa-spinner fa-spin';

        // Check if Web3Forms key is configured
        if (!CONFIG.web3forms_access_key || CONFIG.web3forms_access_key === "YOUR_ACCESS_KEY_HERE") {
            // Fallback to simulated submission if not configured
            setTimeout(() => {
                submitBtn.disabled = false;
                btnText.textContent = 'Send Proposal';
                submitBtn.querySelector('i').className = 'fa-regular fa-paper-plane';
                feedback.textContent = 'Proposal received! (Local Simulation Mode. Add your Web3Forms Access Key to CONFIG at the top of app.js to enable real database delivery!)';
                feedback.className = 'form-feedback-message success';
                feedback.style.display = 'block';
                form.reset();
                setTimeout(() => {
                    feedback.style.display = 'none';
                    feedback.className = 'form-feedback-message';
                }, 6000);
            }, 1500);
            return;
        }

        // Package Form Data
        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData);
        
        // Append access key
        dataObj.access_key = CONFIG.web3forms_access_key;

        feedback.style.display = 'none';

        // Direct AJAX post to Web3Forms endpoint
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataObj)
        })
        .then(async (response) => {
            const resData = await response.json();
            if (response.status === 200) {
                feedback.textContent = 'Proposal received! Joy will review and respond within 24 hours.';
                feedback.className = 'form-feedback-message success';
                form.reset();
            } else {
                feedback.textContent = resData.message || 'Transmission failed. Please try again.';
                feedback.className = 'form-feedback-message error';
            }
        })
        .catch(err => {
            console.error(err);
            feedback.textContent = 'Network error. Please verify your connection and try again.';
            feedback.className = 'form-feedback-message error';
        })
        .finally(() => {
            submitBtn.disabled = false;
            btnText.textContent = 'Send Proposal';
            submitBtn.querySelector('i').className = 'fa-regular fa-paper-plane';
            feedback.style.display = 'block';
            
            setTimeout(() => {
                feedback.style.display = 'none';
                feedback.className = 'form-feedback-message';
            }, 6000);
        });
    });
}
