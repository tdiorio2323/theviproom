// VIP Room Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize VIP Room
    initializeVIPRoom();
    
    function initializeVIPRoom() {
        // Set up navigation
        setupNavigation();
        
        // Initialize animations
        initializeAnimations();
        
        // Set up interactive elements
        setupInteractivity();
        
        // Show welcome section by default
        showSection('portfolio');
        
        console.log('🏆 VIP Room initialized successfully');
    }
    
    function setupNavigation() {
        const navCards = document.querySelectorAll('.nav-card');
        
        navCards.forEach(card => {
            card.addEventListener('click', function() {
                const section = this.dataset.section;
                showSection(section);
                
                // Update active state
                navCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Add click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }
    
    function showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Scroll to section
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    function initializeAnimations() {
        // Observe elements for animation
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        // Observe navigation cards
        document.querySelectorAll('.nav-card').forEach(card => {
            observer.observe(card);
        });
        
        // Staggered animation for nav cards
        document.querySelectorAll('.nav-card').forEach((card, index) => {
            card.style.animationDelay = `${0.6 + (index * 0.1)}s`;
        });
    }
    
    function setupInteractivity() {
        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add loading state
                const originalText = this.textContent;
                this.textContent = 'Accessing...';
                this.disabled = true;
                
                // Simulate download/access
                setTimeout(() => {
                    this.textContent = 'Accessed ✓';
                    this.style.background = 'linear-gradient(135deg, #4CAF50, #8BC34A)';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.disabled = false;
                        this.style.background = '';
                    }, 2000);
                }, 1500);
                
                // Show access granted message
                showNotification('VIP Resource accessed successfully', 'success');
            });
        });
        
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.textContent.trim();
                showNotification(`${action} - VIP access confirmed`, 'info');
                
                // Add click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
        
        // Contact buttons
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const method = this.textContent.trim();
                showNotification(`${method} - Connecting to VIP line...`, 'info');
            });
        });
        
        // Portfolio items
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', function() {
                // Create modal or expand view
                const title = this.querySelector('h4').textContent;
                showNotification(`Opening ${title} - VIP Preview`, 'info');
            });
        });
        
        // Add hover effects to interactive elements
        addHoverEffects();
    }
    
    function addHoverEffects() {
        // Gold shimmer effect for buttons
        document.querySelectorAll('button, .nav-card').forEach(element => {
            element.addEventListener('mouseenter', function() {
                if (!this.querySelector('.shimmer')) {
                    const shimmer = document.createElement('div');
                    shimmer.classList.add('shimmer');
                    shimmer.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
                        animation: shimmerEffect 1.5s ease-in-out;
                        pointer-events: none;
                        z-index: 1;
                    `;
                    
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(shimmer);
                    
                    setTimeout(() => {
                        if (shimmer.parentNode) {
                            shimmer.parentNode.removeChild(shimmer);
                        }
                    }, 1500);
                }
            });
        });
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.classList.add('vip-notification', type);
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(26, 26, 26, 0.95);
            color: var(--vip-gold);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border: 1px solid var(--vip-gold);
            backdrop-filter: blur(10px);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '⚠'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add custom CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmerEffect {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .nav-card.active {
            border-color: var(--vip-gold) !important;
            background: rgba(212, 175, 55, 0.05) !important;
        }
        
        .nav-card.animated {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    showSection('portfolio');
                    break;
                case '2':
                    e.preventDefault();
                    showSection('resources');
                    break;
                case '3':
                    e.preventDefault();
                    showSection('clients');
                    break;
                case '4':
                    e.preventDefault();
                    showSection('contact');
                    break;
            }
        }
    });
    
    // Security features
    disableRightClick();
    disableDevTools();
    
    function disableRightClick() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showNotification('VIP Content Protected', 'info');
        });
    }
    
    function disableDevTools() {
        document.addEventListener('keydown', function(e) {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                showNotification('VIP Content Protected', 'info');
            }
        });
    }
    
    // Performance monitoring
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        if (loadTime < 1000) {
            console.log(`🚀 VIP Room loaded in ${loadTime.toFixed(2)}ms - Luxury performance!`);
        }
    });
    
    // Analytics tracking (placeholder)
    function trackVIPAccess(action, details = {}) {
        console.log('🔍 VIP Analytics:', { action, details, timestamp: new Date().toISOString() });
        // Here you would send to your analytics service
    }
    
    // Track initial access
    trackVIPAccess('vip_room_accessed', { 
        userAgent: navigator.userAgent.substring(0, 50),
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
});