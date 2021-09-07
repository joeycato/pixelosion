import './index.css';

const params = new URL(document.location).searchParams;
const particleSize = params.get('particleSize');

const INPUT_IMAGE_FILE = 'st3.png';
const IMAGE_SCALING_FACTOR = 2; // Scale at which to draw the loaded image
const PARTICLE_SIZE = particleSize ? parseInt(particleSize) : 2; // Increase to generate a more pixelated effect ( with fewer but larger particles )
const INNER_COLLISION_RADIUS = 150; // Determines which activated particles are forcibly moved away from mouse
const OUTER_COLLISION_RADIUS = INNER_COLLISION_RADIUS + IMAGE_SCALING_FACTOR * (PARTICLE_SIZE * 2); // Determines which particles become activated
const OUTER_COLLISION_RADIUS_SQUARED = OUTER_COLLISION_RADIUS * OUTER_COLLISION_RADIUS;
const HOME_SEEKING_SPEED_DAMPING = 1 / 10;

// Represents the main canvas ( sized to fit the entire page )
const canvas = document.getElementById('canvasMain');
const ctx = canvas.getContext('2d', { alpha: false });
// Represents the pre-rendered image overlay ( sized to just fit the scaled image )
const canvasOverlayFrame = document.getElementById('canvasOverlay');
const ctxOverlayFrame = canvasOverlayFrame.getContext('2d');

let particleArray, mx, my, X_OFFSET, Y_OFFSET, INNER_WIDTH, INNER_HEIGHT;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.density = 0.5 * (Math.random() * 10 + 2);
    }
    checkCollision() {
        const dx = mx - this.x;
        const dy = my - this.y;
        if ((this.collided = dx * dx + dy * dy < OUTER_COLLISION_RADIUS_SQUARED)) {
            // Collided particles are updated immediately otherwise the moving mouse position could prematurely deactivate it
            this.update();
        }
    }

    update() {
        if (this.collided) {
            const dx = mx - this.x;
            const dy = my - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Move particle away from the mouse
            const force = (INNER_COLLISION_RADIUS - distance) / INNER_COLLISION_RADIUS;
            if (force > 0 && distance > 0) {
                this.x -= force * (dx / distance) * this.density;
                this.y -= force * (dy / distance) * this.density;
            } else {
                this.collided = false;
            }
            this.active = true;
        } else {
            // Move particle back towards its base position
            const dxBase = this.x - this.baseX;
            const dyBase = this.y - this.baseY;
            if (dxBase === 0 && dyBase === 0) {
                // Particle has reached base position therefore we can deactivate it
                if (this.active) {
                    // Pre-render particle on canvas overlay again
                    this.drawOnOverlay();
                    this.active = false;
                }
            } else {
                // Adjust particle speed to seek towards its base position
                if (Math.abs(dxBase) < 1) {
                    this.x = this.baseX;
                } else {
                    this.x -= dxBase * HOME_SEEKING_SPEED_DAMPING;
                }
                if (Math.abs(dyBase) < 1) {
                    this.y = this.baseY;
                } else {
                    this.y -= dyBase * HOME_SEEKING_SPEED_DAMPING;
                }
            }
        }

        if (this.active) {
            this.draw();
        }
    }

    drawOnOverlay() {
        ctxOverlayFrame.fillStyle = this.color;
        ctxOverlayFrame.fillRect(this.x - X_OFFSET, this.y - Y_OFFSET, IMAGE_SCALING_FACTOR * PARTICLE_SIZE, IMAGE_SCALING_FACTOR * PARTICLE_SIZE);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, IMAGE_SCALING_FACTOR * PARTICLE_SIZE, IMAGE_SCALING_FACTOR * PARTICLE_SIZE);
    }
}

const img = new Image();

function runSimulation() {
    const imageWidth = img.width;
    const imageHeight = img.height;

    canvasOverlayFrame.width = imageWidth * IMAGE_SCALING_FACTOR;
    canvasOverlayFrame.height = imageHeight * IMAGE_SCALING_FACTOR;

    function initParticles() {
        canvas.width = INNER_WIDTH = window.innerWidth;
        canvas.height = INNER_HEIGHT = window.innerHeight;

        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, imageWidth, imageHeight);
        const DATA_W = data.width;
        const DATA_H = data.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate top-left corner of image on canvas
        X_OFFSET = Math.floor(0.5 * (canvas.width - imageWidth * IMAGE_SCALING_FACTOR));
        Y_OFFSET = Math.floor(0.5 * (canvas.height - imageHeight * IMAGE_SCALING_FACTOR));

        // Reposition the overlay frame so that it properly overlaps the main canvas
        canvasOverlayFrame.style.left = X_OFFSET + 'px';
        canvasOverlayFrame.style.top = Y_OFFSET + 'px';

        // Create all particles as deactivated initially while pre-rendering the overlay canvas
        particleArray = [];
        ctxOverlayFrame.clearRect(0, 0, imageWidth * IMAGE_SCALING_FACTOR, imageHeight * IMAGE_SCALING_FACTOR);
        for (let y = 0; y < DATA_H; y += PARTICLE_SIZE) {
            for (let x = 0; x < DATA_W; x += PARTICLE_SIZE) {
                let offset = y * 4 * DATA_W + x * 4;
                const r = data.data[offset++];
                const g = data.data[offset++];
                const b = data.data[offset++];
                const a = data.data[offset++];
                // Ignore semi-transparent and black pixels
                if (a > 128 && !(r === 0 && g === 0 && b === 0)) {
                    const color = `rgb(${r},${g},${b}`;
                    const particle = new Particle(X_OFFSET + x * IMAGE_SCALING_FACTOR, Y_OFFSET + y * IMAGE_SCALING_FACTOR, color);
                    particle.drawOnOverlay();
                    particleArray.push(particle);
                }
            }
        }
    }

    function animateParticles() {
        // Darken the main canvas to generate a darkening ghost-trail effect
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, INNER_WIDTH, INNER_HEIGHT);

        for (const particle of particleArray) {
            particle.update();
        }

        requestAnimationFrame(animateParticles);
    }

    initParticles();

    animateParticles();

    const onMouseMove = event => {
        mx = Math.floor(event.x + canvas.clientLeft * 0.5);
        my = Math.floor(event.y + canvas.clientTop * 0.5);

        // Cut a hole in the overlay surface so that the activated pixels reveal beneath
        ctxOverlayFrame.globalCompositeOperation = 'destination-out';
        ctxOverlayFrame.beginPath();
        ctxOverlayFrame.arc(mx - X_OFFSET, my - Y_OFFSET, INNER_COLLISION_RADIUS, 0, 2 * Math.PI);
        ctxOverlayFrame.fill();
        ctxOverlayFrame.globalCompositeOperation = 'source-over';

        for (const particle of particleArray) {
            particle.checkCollision();
        }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove);

    window.addEventListener('resize', () => {
        initParticles();
    });
}

img.addEventListener('load', event => {
    runSimulation();
});

img.src = INPUT_IMAGE_FILE;
