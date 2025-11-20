const canvas = document.getElementById('cosmos-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let planets = [];
let zodiacs = [];
const STAR_COUNT = 200; // Reduced for performance
const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🕉️', '✨'];

// Resize canvas
function resize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Only re-init stars if width changes (e.g. rotation) to avoid reset on mobile scroll
    const needsInit = width !== newWidth;

    width = newWidth;
    height = newHeight;
    canvas.width = width;
    canvas.height = height;

    if (needsInit || stars.length === 0) {
        init();
    }
}

window.addEventListener('resize', resize);

// Star class
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 0.5; // Depth/Size
        this.alpha = Math.random() * 0.5 + 0.1;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleDir = 1;

        // Normal movement
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
    }

    update() {
        // FLOAT MODE: Normal behavior
        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha > 0.8 || this.alpha < 0.1) {
            this.twinkleDir *= -1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.z * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Planet Class
class Planet {
    constructor() {
        this.reset();
    }

    reset() {
        this.radius = Math.random() * 40 + 10; // Size 10-50
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.color = this.getRandomColor();
        this.speed = (Math.random() * 0.2 + 0.05) * (Math.random() < 0.5 ? 1 : -1);
        this.hasRing = Math.random() > 0.7;
    }

    getRandomColor() {
        const colors = [
            { stop1: '#ff9a9e', stop2: '#fecfef' }, // Pinkish
            { stop1: '#a18cd1', stop2: '#fbc2eb' }, // Purple
            { stop1: '#84fab0', stop2: '#8fd3f4' }, // Teal
            { stop1: '#e0c3fc', stop2: '#8ec5fc' }, // Blue-Purple
            { stop1: '#f093fb', stop2: '#f5576c' }  // Red-Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speed;
        if (this.x > width + 100) this.x = -100;
        if (this.x < -100) this.x = width + 100;
    }

    draw() {
        // Planet Body
        const gradient = ctx.createRadialGradient(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 10, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color.stop1);
        gradient.addColorStop(1, 'rgba(10, 10, 30, 0.8)'); // Fade into dark

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ring (optional)
        if (this.hasRing) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius * 1.8, this.radius * 0.4, Math.PI / 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Zodiac Symbol Class
class Zodiac {
    constructor() {
        this.reset();
    }

    reset() {
        this.symbol = ZODIAC_SYMBOLS[Math.floor(Math.random() * ZODIAC_SYMBOLS.length)];
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 30 + 20;
        this.speedY = -1 * (Math.random() * 0.3 + 0.1); // Float up
        this.opacity = 0;
        this.fadeIn = true;
    }

    update() {
        this.y += this.speedY;

        // Fade in/out
        if (this.fadeIn) {
            this.opacity += 0.005;
            if (this.opacity >= 0.4) this.fadeIn = false;
        } else {
            this.opacity -= 0.005;
        }

        if (this.opacity <= 0 || this.y < -50) {
            this.reset();
            this.y = height + 50;
        }
    }

    draw() {
        ctx.font = `${this.size}px Cinzel`;
        ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; // Gold
        ctx.fillText(this.symbol, this.x, this.y);
    }
}

// Shooting Star class
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5;
        this.len = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 6;
        this.size = Math.random() * 1 + 0.1;
        this.angle = Math.PI / 4;
        this.active = false;
    }

    trigger() {
        this.active = true;
        this.x = Math.random() * width * 0.8;
        this.y = 0;
    }

    update() {
        if (!this.active) return;
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        if (this.x > width || this.y > height) this.active = false;
    }

    draw() {
        if (!this.active) return;
        const tailX = this.x - this.len * Math.cos(this.angle);
        const tailY = this.y - this.len * Math.sin(this.angle);
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
    }
}

function init() {
    stars = [];
    planets = [];
    zodiacs = [];

    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
    for (let i = 0; i < 5; i++) planets.push(new Planet()); // 5 Planets
    for (let i = 0; i < 12; i++) zodiacs.push(new Zodiac()); // Increased floating symbols
}

const shootingStar = new ShootingStar();
resize(); // Calls init

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Planets (Background layer)
    planets.forEach(planet => {
        planet.update();
        planet.draw();
    });

    // Draw Zodiacs (Background layer)
    zodiacs.forEach(zodiac => {
        zodiac.update();
        zodiac.draw();
    });

    // Draw Stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw Shooting Star
    shootingStar.update();
    shootingStar.draw();
    if (!shootingStar.active && Math.random() < 0.005) shootingStar.trigger();

    requestAnimationFrame(animate);
}

animate();

// Intro Sequence
window.addEventListener('load', () => {
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');

    // Show mantra for 3 seconds then fade out
    setTimeout(() => {
        introScreen.style.opacity = '0';

        setTimeout(() => {
            introScreen.style.display = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
            mainContent.style.transition = 'opacity 2s ease-in-out';
        }, 1500); // Wait for fade out
    }, 3000); // Display time for mantra
});
