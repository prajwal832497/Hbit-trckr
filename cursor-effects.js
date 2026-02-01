// Apple Glass UI - Interactive Cursor Effects
const CursorEffects = {
    spotlightElement: null,
    isEnabled: true,

    // Initialize cursor effects
    init() {
        this.createSpotlight();
        this.setupMouseTracking();
        this.setupCardInteractions();
        this.setupRippleEffects();
    },

    // Create cursor spotlight element
    createSpotlight() {
        const spotlight = document.createElement('div');
        spotlight.id = 'cursor-spotlight';
        spotlight.className = 'cursor-spotlight';
        document.body.appendChild(spotlight);
        this.spotlightElement = spotlight;
    },

    // Setup mouse tracking for spotlight
    setupMouseTracking() {
        let mouseX = 0;
        let mouseY = 0;
        let spotlightX = 0;
        let spotlightY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth animation loop
        const animateSpotlight = () => {
            // Smooth following with easing
            const ease = 0.15;
            spotlightX += (mouseX - spotlightX) * ease;
            spotlightY += (mouseY - spotlightY) * ease;

            if (this.spotlightElement) {
                this.spotlightElement.style.left = spotlightX + 'px';
                this.spotlightElement.style.top = spotlightY + 'px';
            }

            requestAnimationFrame(animateSpotlight);
        };

        animateSpotlight();
    },

    // Setup 3D card tilt interactions
    setupCardInteractions() {
        const cards = document.querySelectorAll('.glass-card, .habit-card, .stats-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease-out';
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    },

    // Setup ripple effects on click
    setupRippleEffects() {
        document.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';

            document.body.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    },

    // Add glow to specific elements on hover
    addHoverGlow(selector) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.6)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = '';
            });
        });
    },

    // Enable/disable effects
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (this.spotlightElement) {
            this.spotlightElement.style.display = this.isEnabled ? 'block' : 'none';
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CursorEffects.init();
});
