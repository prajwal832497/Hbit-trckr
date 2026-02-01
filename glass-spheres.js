// Advanced Glass Spheres System - Enhanced Version with All Features
const AdvancedGlassSpheres = {
    spheres: [],
    particles: [],
    containerElement: null,
    animationFrame: null,
    scrollY: 0,

    // Configuration
    config: {
        sphereCount: 7,
        particleCount: 30,
        colorTheme: 'purple', // 'purple', 'blue', 'rainbow', 'white'
        enableSounds: true,
        enableCollisions: true,
        enableParticles: true,
        enableScrollEffects: true
    },

    // Color themes
    themes: {
        purple: {
            primary: 'rgba(147, 51, 234, 0.3)',
            secondary: 'rgba(168, 85, 247, 0.2)',
            glow: 'rgba(147, 51, 234, 0.4)'
        },
        blue: {
            primary: 'rgba(59, 130, 246, 0.3)',
            secondary: 'rgba(96, 165, 250, 0.2)',
            glow: 'rgba(59, 130, 246, 0.4)'
        },
        rainbow: {
            colors: [
                'rgba(239, 68, 68, 0.3)',
                'rgba(249, 115, 22, 0.3)',
                'rgba(234, 179, 8, 0.3)',
                'rgba(34, 197, 94, 0.3)',
                'rgba(59, 130, 246, 0.3)',
                'rgba(147, 51, 234, 0.3)',
                'rgba(236, 72, 153, 0.3)'
            ]
        },
        white: {
            primary: 'rgba(255, 255, 255, 0.3)',
            secondary: 'rgba(255, 255, 255, 0.2)',
            glow: 'rgba(255, 255, 255, 0.4)'
        }
    },

    // Initialize
    init() {
        this.createContainer();
        this.generateSpheres();
        if (this.config.enableParticles) {
            this.generateParticles();
        }
        this.setupEventListeners();
        this.startAnimation();
        this.fadeInSpheres();
    },

    // Create container
    createContainer() {
        // Remove old container if exists
        const oldContainer = document.getElementById('glassSpheres');
        if (oldContainer) oldContainer.remove();

        this.containerElement = document.createElement('div');
        this.containerElement.id = 'glassSpheres';
        this.containerElement.className = 'glass-spheres-container';
        document.body.insertBefore(this.containerElement, document.body.firstChild);
    },

    // Generate spheres with different shapes
    generateSpheres() {
        const shapes = ['sphere', 'sphere', 'sphere', 'cube', 'pyramid', 'sphere', 'cube'];
        const positions = [
            { x: 10, y: 8, size: 150 },
            { x: 85, y: 12, size: 100 },
            { x: 50, y: 25, size: 60 },
            { x: 20, y: 50, size: 120 },
            { x: 75, y: 55, size: 80 },
            { x: 40, y: 75, size: 90 },
            { x: 15, y: 85, size: 70 }
        ];

        positions.forEach((pos, index) => {
            const sphere = {
                id: index,
                shape: shapes[index],
                x: pos.x,
                y: pos.y,
                size: pos.size,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                speed: 0.3 + Math.random() * 0.5,
                direction: Math.random() > 0.5 ? 1 : -1,
                floatOffset: Math.random() * Math.PI * 2,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                parallaxX: 0,
                parallaxY: 0,
                element: null,
                color: this.getColorForSphere(index)
            };

            this.spheres.push(sphere);
            this.createShapeElement(sphere);
        });
    },

    // Get color based on theme
    getColorForSphere(index) {
        const theme = this.config.colorTheme;
        if (theme === 'rainbow') {
            return this.themes.rainbow.colors[index % this.themes.rainbow.colors.length];
        }
        return this.themes[theme] || this.themes.white;
    },

    // Create shape element
    createShapeElement(sphere) {
        const el = document.createElement('div');
        el.className = `glass-shape glass-${sphere.shape}`;
        el.style.width = sphere.size + 'px';
        el.style.height = sphere.size + 'px';
        el.style.left = sphere.x + '%';
        el.style.top = sphere.y + '%';
        el.style.opacity = '0'; // Start invisible for fade-in
        el.dataset.sphereId = sphere.id;

        // Apply color theme
        if (typeof sphere.color === 'string') {
            el.style.setProperty('--shape-color', sphere.color);
        } else if (sphere.color.primary) {
            el.style.setProperty('--shape-color', sphere.color.primary);
            el.style.setProperty('--shape-glow', sphere.color.glow);
        }

        sphere.element = el;
        this.containerElement.appendChild(el);
    },

    // Generate floating particles
    generateParticles() {
        for (let i = 0; i < this.config.particleCount; i++) {
            const particle = {
                id: 'particle-' + i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 2 + Math.random() * 4,
                speed: 0.1 + Math.random() * 0.3,
                opacity: 0.2 + Math.random() * 0.5,
                element: null
            };

            this.particles.push(particle);
            this.createParticleElement(particle);
        }
    },

    // Create particle element
    createParticleElement(particle) {
        const el = document.createElement('div');
        el.className = 'glass-particle';
        el.style.width = particle.size + 'px';
        el.style.height = particle.size + 'px';
        el.style.left = particle.x + '%';
        el.style.top = particle.y + '%';
        el.style.opacity = particle.opacity;

        particle.element = el;
        this.containerElement.appendChild(el);
    },

    // Fade in animation on load
    fadeInSpheres() {
        this.spheres.forEach((sphere, index) => {
            setTimeout(() => {
                sphere.element.style.transition = 'opacity 1s ease-out';
                sphere.element.style.opacity = '1';
            }, index * 150);
        });
    },

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('scroll', () => this.handleScroll());

        this.spheres.forEach(sphere => {
            sphere.element.addEventListener('click', (e) => this.handleShapeClick(e, sphere));
            sphere.element.addEventListener('mouseenter', () => this.handleShapeHover(sphere, true));
            sphere.element.addEventListener('mouseleave', () => this.handleShapeHover(sphere, false));
        });

        window.addEventListener('resize', () => this.handleResize());
    },

    // Handle mouse movement
    handleMouseMove(e) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        this.spheres.forEach((sphere, index) => {
            const depth = (index + 1) * 0.03;
            sphere.parallaxX = (centerX - mouseX) * depth;
            sphere.parallaxY = (centerY - mouseY) * depth;
        });
    },

    // Handle scroll
    handleScroll() {
        if (!this.config.enableScrollEffects) return;
        this.scrollY = window.scrollY;
    },

    // Handle shape click
    handleShapeClick(e, sphere) {
        e.stopPropagation();

        // Play sound
        if (this.config.enableSounds) {
            this.playClickSound();
        }

        // Create ripple
        this.createRipple(e.clientX, e.clientY);

        // Pulse animation
        sphere.element.style.transform = `translate(${sphere.parallaxX}px, ${sphere.parallaxY}px) scale(1.3) rotate(${sphere.rotation}deg)`;

        setTimeout(() => {
            sphere.element.style.transform = `translate(${sphere.parallaxX}px, ${sphere.parallaxY}px) scale(1) rotate(${sphere.rotation}deg)`;
        }, 300);

        // Create particle burst
        this.createParticleBurst(e.clientX, e.clientY);
    },

    // Play click sound
    playClickSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    },

    // Create ripple effect
    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'sphere-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    },

    // Create particle burst
    createParticleBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            const angle = (i / 8) * Math.PI * 2;
            const distance = 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    },

    // Handle hover
    handleShapeHover(sphere, isHovering) {
        if (isHovering) {
            sphere.element.classList.add('hovered');
        } else {
            sphere.element.classList.remove('hovered');
        }
    },

    // Handle resize
    handleResize() {
        const width = window.innerWidth;
        if (width < 768) {
            this.spheres.forEach((sphere, index) => {
                sphere.element.style.display = index > 3 ? 'none' : 'block';
            });
        } else {
            this.spheres.forEach(sphere => {
                sphere.element.style.display = 'block';
            });
        }
    },

    // Check collisions
    checkCollisions() {
        if (!this.config.enableCollisions) return;

        for (let i = 0; i < this.spheres.length; i++) {
            for (let j = i + 1; j < this.spheres.length; j++) {
                const s1 = this.spheres[i];
                const s2 = this.spheres[j];

                const dx = (s1.x + s1.parallaxX / 10) - (s2.x + s2.parallaxX / 10);
                const dy = (s1.y + s1.parallaxY / 10) - (s2.y + s2.parallaxY / 10);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (s1.size + s2.size) / 20;

                if (distance < minDistance) {
                    // Collision detected - bounce
                    const angle = Math.atan2(dy, dx);
                    const targetX = s2.x + Math.cos(angle) * minDistance;
                    const targetY = s2.y + Math.sin(angle) * minDistance;

                    s1.vx += (s1.x - targetX) * 0.01;
                    s1.vy += (s1.y - targetY) * 0.01;
                }
            }
        }
    },

    // Animation loop
    startAnimation() {
        const animate = () => {
            const time = Date.now() * 0.001;

            // Animate spheres
            this.spheres.forEach(sphere => {
                // Floating animation
                const floatY = Math.sin(time * sphere.speed + sphere.floatOffset) * 20;

                // Rotation for cubes and pyramids
                if (sphere.shape !== 'sphere') {
                    sphere.rotation += sphere.rotationSpeed;
                }

                // Apply scroll effect
                let scrollOffset = 0;
                if (this.config.enableScrollEffects) {
                    scrollOffset = this.scrollY * 0.05 * (sphere.id % 3);
                }

                // Combine transformations
                const translateX = sphere.parallaxX;
                const translateY = sphere.parallaxY + floatY + scrollOffset;

                sphere.element.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${sphere.rotation}deg)`;

                // Update position for physics
                sphere.x += sphere.vx;
                sphere.y += sphere.vy;

                // Boundary bounce
                if (sphere.x < 0 || sphere.x > 100) sphere.vx *= -1;
                if (sphere.y < 0 || sphere.y > 100) sphere.vy *= -1;

                // Damping
                sphere.vx *= 0.98;
                sphere.vy *= 0.98;
            });

            // Animate particles
            if (this.config.enableParticles) {
                this.particles.forEach(particle => {
                    const particleFloat = Math.sin(time * particle.speed) * 30;
                    particle.element.style.transform = `translateY(${particleFloat}px)`;
                });
            }

            // Check collisions
            this.checkCollisions();

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    },

    // Stop animation
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },

    // Change theme
    changeTheme(themeName) {
        this.config.colorTheme = themeName;
        this.spheres.forEach((sphere, index) => {
            sphere.color = this.getColorForSphere(index);
            if (typeof sphere.color === 'string') {
                sphere.element.style.setProperty('--shape-color', sphere.color);
            } else if (sphere.color.primary) {
                sphere.element.style.setProperty('--shape-color', sphere.color.primary);
                sphere.element.style.setProperty('--shape-glow', sphere.color.glow);
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdvancedGlassSpheres.init());
} else {
    AdvancedGlassSpheres.init();
}

// Global function to change theme
window.changeGlassTheme = (theme) => {
    AdvancedGlassSpheres.changeTheme(theme);
};
