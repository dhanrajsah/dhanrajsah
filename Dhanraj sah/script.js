// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Create Floating Particles
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 8 + 3}px;
            height: ${Math.random() * 8 + 3}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 20 + 15}s infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 ${Math.random() * 10 + 5}px rgba(255, 255, 255, 0.5);
        `;
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles on load
window.addEventListener('load', createParticles);

// Loading Screen
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    }
});

// Smooth Page Load Animation
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Create mailto link with formatted message
        const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `
Message:
${message}

` +
            `---\n` +
            `This message was sent from your portfolio contact form.`
        );
        
        const mailtoLink = `mailto:dhanrajsah03@gmail.com?subject=${subject}&body=${body}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        alert('Thank you for your message! Your email client will open to send the message.');
        
        // Reset form
        contactForm.reset();
    });
}

// Scroll Animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Active link highlighting on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add animation to skill cards on scroll
const skillCards = document.querySelectorAll('.skill-card');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

skillCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transitionDelay = `${index * 0.05}s`;
    skillObserver.observe(card);
});

// Add animation to project cards
const projectCards = document.querySelectorAll('.project-card');
const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'scale(1) rotateY(0)';
            }, index * 150);
        }
    });
}, { threshold: 0.1 });

projectCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9) rotateY(-10deg)';
    card.style.transition = 'all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transitionDelay = `${index * 0.1}s`;
    projectObserver.observe(card);
});

console.log('Portfolio website loaded successfully! 🚀');

// 3D Card Tilt Effect
document.querySelectorAll('.skill-card, .project-card, .education-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// Parallax Effect for Hero
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        
        hero.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
    });
}

// Profile Photo 3D Follow Effect
const profilePhoto = document.querySelector('.profile-photo');
if (profilePhoto) {
    document.addEventListener('mousemove', (e) => {
        const rect = profilePhoto.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const rotateX = (y / rect.height) * 10;
        const rotateY = -(x / rect.width) * 10;
        
        profilePhoto.style.transform = `translateY(-20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    profilePhoto.addEventListener('mouseleave', () => {
        profilePhoto.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
}

// Smooth reveal on scroll with 3D effect
const observer3D = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) rotateX(0)';
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.skill-card, .project-card, .education-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px) rotateX(-10deg)';
    el.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    observer3D.observe(el);
});

// Enhanced Typing Effect for Tagline
const tagline = document.querySelector('.tagline');
if (tagline) {
    const originalText = tagline.textContent;
    tagline.textContent = '';
    let charIndex = 0;
    
    function typeWriter() {
        if (charIndex < originalText.length) {
            tagline.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 50);
        }
    }
    
    setTimeout(typeWriter, 1200);
}

// Interactive Skills Modal
const skillsData = {
    'web-dev': {
        title: 'Web Development',
        icon: '<i class="fas fa-code"></i>',
        description: 'I design and build responsive, visually appealing, and user-friendly websites using modern web technologies. I focus on clean layouts, efficient coding practices, and intuitive navigation to create websites that provide an excellent user experience. My expertise includes HTML, CSS, JavaScript, and creating dynamic, interactive web applications that work seamlessly across all devices.'
    },
    'programming': {
        title: 'Programming (C Language)',
        icon: '<i class="fas fa-laptop-code"></i>',
        description: 'I have learned the fundamentals of programming through C, developing strong problem-solving skills and logical thinking. I apply these skills to small projects, algorithm practice, and computational tasks, which helps me understand programming concepts more deeply. This foundational knowledge enables me to approach complex problems systematically and develop efficient solutions.'
    },
    'computer-science': {
        title: 'Computer Science Fundamentals',
        icon: '<i class="fas fa-desktop"></i>',
        description: 'I have studied core concepts in computer science including algorithms, data structures, and basic computing principles. This knowledge forms the foundation for my programming and web development projects. Understanding these fundamentals allows me to write more efficient code, optimize performance, and tackle complex technical challenges with confidence.'
    },
    'business': {
        title: 'Business & Economics',
        icon: '<i class="fas fa-chart-line"></i>',
        description: 'Being a student of business economics, I understand key concepts in finance, accounting, and market operations. This knowledge allows me to approach projects with a practical perspective, combining technical skills with business awareness. I can analyze market trends, understand financial statements, and make informed decisions that bridge the gap between technology and business strategy.'
    },
    'accounting': {
        title: 'Accounting Basics',
        icon: '<i class="fas fa-calculator"></i>',
        description: 'I have practical knowledge of accounting principles, bookkeeping, and financial analysis, which strengthens my understanding of business processes and supports my analytical skills. This expertise helps me manage finances effectively, prepare accurate reports, and understand the financial health of organizations. My accounting knowledge complements my technical abilities perfectly.'
    },
    'content': {
        title: 'Content Creation',
        icon: '<i class="fas fa-pen-fancy"></i>',
        description: 'I enjoy creating educational and informative content, particularly for my project Silent Voice Nepal. This includes writing articles, creating social media posts, and sharing knowledge with a wider audience to promote awareness on social and educational topics. My content creation skills help me communicate complex ideas clearly and engage audiences effectively across multiple platforms.'
    },
    'communication': {
        title: 'Communication & Teamwork',
        icon: '<i class="fas fa-users"></i>',
        description: 'I am skilled in effective communication, collaboration, and leadership. I value working in teams, sharing ideas, and managing projects efficiently, which ensures that all tasks are completed with high quality. My ability to communicate clearly, listen actively, and work collaboratively makes me an effective team member and leader in any project or organization.'
    }
};

const skillModal = document.getElementById('skillModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalIcon = document.getElementById('modalIcon');
const modalClose = document.querySelector('.skill-modal-close');

// Add click listeners to all skill cards
document.querySelectorAll('.skill-learn-more').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const skillCard = button.closest('.skill-card');
        const skillKey = skillCard.getAttribute('data-skill');
        const skill = skillsData[skillKey];
        
        if (skill) {
            modalTitle.textContent = skill.title;
            modalDescription.textContent = skill.description;
            modalIcon.innerHTML = skill.icon;
            skillModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close modal
function closeSkillModal() {
    skillModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

modalClose.addEventListener('click', closeSkillModal);

// Close modal when clicking outside
skillModal.addEventListener('click', (e) => {
    if (e.target === skillModal) {
        closeSkillModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && skillModal.classList.contains('active')) {
        closeSkillModal();
    }
});
