class FrogHopper {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        
        // Game properties
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Player frog
        this.frog = {
            x: 375,
            y: 550,
            width: 40,
            height: 40,
            moveDistance: 50
        };
        
        // Game objects
        this.cars = [];
        this.logs = [];
        this.lilypads = [];
        this.particles = [];
        this.raindrops = [];
        
        // Lane configurations
        this.lanes = [
            { y: 500, type: 'road', speed: 2, direction: 1 },
            { y: 450, type: 'road', speed: 3, direction: -1 },
            { y: 400, type: 'road', speed: 1.5, direction: 1 },
            { y: 350, type: 'road', speed: 2.5, direction: -1 },
            { y: 250, type: 'water', speed: 1, direction: 1 },
            { y: 200, type: 'water', speed: 1.5, direction: -1 },
            { y: 150, type: 'water', speed: 2, direction: 1 },
            { y: 100, type: 'water', speed: 1.2, direction: -1 }
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.initializeRain();
        this.gameLoop();
    }
    
    initializeGame() {
        // Create initial obstacles
        this.generateCars();
        this.generateLogs();
        this.generateLilypads();
    }
    
    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.handleInput(e.key);
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.frog.x = 375;
        this.frog.y = 550;
        this.cars = [];
        this.logs = [];
        this.particles = [];
        this.raindrops = [];
        this.initializeGame();
        this.initializeRain();
        this.gameState = 'playing';
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    handleInput(key) {
        const oldX = this.frog.x;
        const oldY = this.frog.y;
        
        switch(key) {
            case 'ArrowUp':
                this.frog.y = Math.max(50, this.frog.y - this.frog.moveDistance);
                break;
            case 'ArrowDown':
                this.frog.y = Math.min(550, this.frog.y + this.frog.moveDistance);
                break;
            case 'ArrowLeft':
                this.frog.x = Math.max(0, this.frog.x - this.frog.moveDistance);
                break;
            case 'ArrowRight':
                this.frog.x = Math.min(750, this.frog.x + this.frog.moveDistance);
                break;
        }
        
        // Check if frog reached the top
        if (this.frog.y <= 50) {
            this.score += 100 * this.level;
            this.frog.y = 550;
            this.frog.x = 375;
            this.createParticles(this.frog.x, 50, '#00ff00');
        }
        
        // Award points for forward movement
        if (this.frog.y < oldY) {
            this.score += 10;
        }
    }
    
    generateCars() {
        this.lanes.forEach((lane, index) => {
            if (lane.type === 'road') {
                for (let i = 0; i < 3; i++) {
                    this.cars.push({
                        x: i * 300 * lane.direction,
                        y: lane.y,
                        width: 60,
                        height: 30,
                        speed: lane.speed * this.gameSpeed,
                        direction: lane.direction,
                        color: `hsl(${Math.random() * 360}, 70%, 50%)`
                    });
                }
            }
        });
    }
    
    generateLogs() {
        this.lanes.forEach((lane, index) => {
            if (lane.type === 'water') {
                for (let i = 0; i < 2; i++) {
                    this.logs.push({
                        x: i * 400 * lane.direction,
                        y: lane.y,
                        width: 120,
                        height: 30,
                        speed: lane.speed * this.gameSpeed,
                        direction: lane.direction
                    });
                }
            }
        });
    }
    
    generateLilypads() {
        for (let i = 0; i < 5; i++) {
            this.lilypads.push({
                x: 50 + i * 150,
                y: 50,
                width: 40,
                height: 40
            });
        }
    }
    
    initializeRain() {
        // Create initial raindrops
        for (let i = 0; i < 100; i++) {
            this.raindrops.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                speed: Math.random() * 3 + 2,
                length: Math.random() * 10 + 5
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update cars
        this.cars.forEach(car => {
            car.x += car.speed * car.direction;
            
            // Wrap around screen
            if (car.direction > 0 && car.x > 850) car.x = -100;
            if (car.direction < 0 && car.x < -100) car.x = 850;
        });
        
        // Update logs
        this.logs.forEach(log => {
            log.x += log.speed * log.direction;
            
            // Wrap around screen
            if (log.direction > 0 && log.x > 850) log.x = -150;
            if (log.direction < 0 && log.x < -150) log.x = 850;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
        
        // Update raindrops
        this.raindrops.forEach(drop => {
            drop.y += drop.speed;
            drop.x += Math.sin(drop.y * 0.01) * 0.5; // Slight drift
            
            // Reset raindrop when it goes off screen
            if (drop.y > 600) {
                drop.y = -drop.length;
                drop.x = Math.random() * 800;
            }
        });
        
        this.checkCollisions();
        this.updateUI();
    }
    
    checkCollisions() {
        const frogRect = {
            x: this.frog.x,
            y: this.frog.y,
            width: this.frog.width,
            height: this.frog.height
        };
        
        // Check car collisions
        for (let car of this.cars) {
            if (this.isColliding(frogRect, car)) {
                this.frogDied();
                return;
            }
        }
        
        // Check if frog is in water without a log
        const isInWater = this.lanes.some(lane => 
            lane.type === 'water' && 
            this.frog.y >= lane.y - 20 && 
            this.frog.y <= lane.y + 20
        );
        
        if (isInWater) {
            let onLog = false;
            for (let log of this.logs) {
                if (this.isColliding(frogRect, log)) {
                    // Frog moves with the log
                    this.frog.x += log.speed * log.direction;
                    onLog = true;
                    break;
                }
            }
            
            if (!onLog) {
                this.frogDied();
                return;
            }
        }
        
        // Keep frog on screen when on logs
        this.frog.x = Math.max(0, Math.min(750, this.frog.x));
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    frogDied() {
        this.createParticles(this.frog.x, this.frog.y, '#ff0000');
        this.lives--;
        this.frog.x = 375;
        this.frog.y = 550;
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + Math.random() * 40,
                y: y + Math.random() * 40,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: color,
                life: 30
            });
        }
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('livesValue').textContent = this.lives;
        document.getElementById('levelValue').textContent = this.level;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background lanes
        this.drawLanes();
        
        // Draw game objects
        this.drawRain();
        this.drawCars();
        this.drawLogs();
        this.drawLilypads();
        this.drawFrog();
        this.drawParticles();
    }
    
    drawLanes() {
        // Water lanes
        this.ctx.fillStyle = '#4169E1';
        this.lanes.forEach(lane => {
            if (lane.type === 'water') {
                this.ctx.fillRect(0, lane.y - 25, 800, 50);
            }
        });
        
        // Road lanes
        this.ctx.fillStyle = '#333';
        this.lanes.forEach(lane => {
            if (lane.type === 'road') {
                this.ctx.fillRect(0, lane.y - 25, 800, 50);
                // Road lines
                this.ctx.fillStyle = '#fff';
                for (let x = 0; x < 800; x += 60) {
                    this.ctx.fillRect(x, lane.y - 2, 30, 4);
                }
                this.ctx.fillStyle = '#333';
            }
        });
    }
    
    drawCars() {
        this.cars.forEach(car => {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y - 15, car.width, car.height);
            
            // Car details
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(car.x + 5, car.y - 10, car.width - 10, 20);
            
            // Headlights
            this.ctx.fillStyle = '#ffff99';
            if (car.direction > 0) {
                this.ctx.fillRect(car.x + car.width - 5, car.y - 8, 3, 6);
                this.ctx.fillRect(car.x + car.width - 5, car.y + 2, 3, 6);
            } else {
                this.ctx.fillRect(car.x + 2, car.y - 8, 3, 6);
                this.ctx.fillRect(car.x + 2, car.y + 2, 3, 6);
            }
        });
    }
    
    drawLogs() {
        this.logs.forEach(log => {
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(log.x, log.y - 15, log.width, log.height);
            
            // Log texture
            this.ctx.fillStyle = '#654321';
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(log.x + i * 40, log.y - 10, 2, 20);
            }
        });
    }
    
    drawLilypads() {
        this.lilypads.forEach(pad => {
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(pad.x + pad.width/2, pad.y + pad.height/2, pad.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Lilypad details
            this.ctx.fillStyle = '#32CD32';
            this.ctx.beginPath();
            this.ctx.arc(pad.x + pad.width/2, pad.y + pad.height/2, pad.width/3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawFrog() {
        const frog = this.frog;
        
        // Draw frog emoji
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText('🐸', frog.x + frog.width/2, frog.y + frog.height/2);
        // Reset text alignment
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
    }
    
    drawRain() {
        this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.8)';
        this.ctx.lineWidth = 2;
        
        this.raindrops.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x - 2, drop.y + drop.length);
            this.ctx.stroke();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
            this.ctx.globalAlpha = 1;
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new FrogHopper();
});