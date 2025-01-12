const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = 5; // snelheid van de speler
        this.velocity = { x: 0, y: 0 }; // snelheid in x- en y-richting
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Houd speler binnen het canvas
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        this.draw();
    }
}

class Kogel {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'white');
const kogels = [];
const enemies = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (40 - 5) + 5;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = 'green';
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

let animateId;

function animate() {
    animateId = requestAnimationFrame(animate);

    c.fillStyle = 'rgba(0, 0, 0, 0.15)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    c.fillStyle = 'white';
    c.font = '20px Arial';
    c.fillText(`Shots left: ${remainingShots}`, 20, 30);

    kogels.forEach((kogel, kogelindex) => {
        kogel.update();
        if (
            kogel.x + kogel.radius < 0 ||
            kogel.x - kogel.radius > canvas.width ||
            kogel.y + kogel.radius < 0 ||
            kogel.y - kogel.radius > canvas.height
        ) {
            setTimeout(() => {
                kogels.splice(kogelindex, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance - enemy.radius - player.radius + 5 < 1) {
            cancelAnimationFrame(animateId);
        }

        kogels.forEach((kogel, kogelindex) => {
            const distance = Math.hypot(kogel.x - enemy.x, kogel.y - enemy.y);
            if (distance - enemy.radius - kogel.radius < 1) {
                setTimeout(() => {
                    enemies.splice(index, 1);
                    kogels.splice(kogelindex, 1);
                }, 0);
            }
        });
    });
}

let remainingShots = 1000;

window.addEventListener('click', (event) => {
    if (remainingShots > 0) {
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
        const speed = 4;
        const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
        kogels.push(new Kogel(x, y, 5, 'white', velocity));

        remainingShots--;
    } else {
        console.log('No shots remaining!');
    }
});

// Beweeg de speler met pijltjestoetsen
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.ArrowUp = true;
            player.velocity.y = -player.speed;
            break;
        case 'ArrowDown':
            keys.ArrowDown = true;
            player.velocity.y = player.speed;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft = true;
            player.velocity.x = -player.speed;
            break;
        case 'ArrowRight':
            keys.ArrowRight = true;
            player.velocity.x = player.speed;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.ArrowUp = false;
            if (!keys.ArrowDown) player.velocity.y = 0;
            break;
        case 'ArrowDown':
            keys.ArrowDown = false;
            if (!keys.ArrowUp) player.velocity.y = 0;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft = false;
            if (!keys.ArrowRight) player.velocity.x = 0;
            break;
        case 'ArrowRight':
            keys.ArrowRight = false;
            if (!keys.ArrowLeft) player.velocity.x = 0;
            break;
    }
});

animate();
spawnEnemies();
