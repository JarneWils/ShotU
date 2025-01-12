const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scoreEl = document.getElementById('scoreEl')

class Player {
    constructor(x ,y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Kogel {
    constructor(x ,y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x ,y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 30, 'white')
const kogels = []
const enemies = []
const restartButton = document.getElementById('restart');
const alertContainer = document.getElementById('container');
const finalScore = document.getElementById('finalScoreEl');

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (40 - 5) + 5
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {x:Math.cos(angle), y:Math.sin(angle)}

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animateId
let score = 0
function animate() {
    animateId = requestAnimationFrame(animate);
    c.fillStyle = 'hsl(0, 0.00%, 10%)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();

    // Toon resterende kogels
    updateShotsDisplay();  // Update het aantal kogels buiten de canvas

    kogels.forEach((kogel, kogelindex) => {
        kogel.update();
        // Verwijder kogels die buiten het scherm zijn
        if (kogel.x + kogel.radius < 0 ||
            kogel.x - kogel.radius > canvas.width ||
            kogel.y + kogel.radius < 0 ||
            kogel.y - kogel.radius > canvas.height) {
                setTimeout(() => {
                    kogels.splice(kogelindex, 1)
                }, 0)
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        // Game over wanneer de speler raakt
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (distance - enemy.radius - player.radius + 5 < 1) {
            cancelAnimationFrame(animateId)
            alertContainer.style.display = 'flex';
            finalScore.innerHTML = score
        }

        kogels.forEach((kogel, kogelindex) => {
            // Kogel raakt vijand
            const distance = Math.hypot(kogel.x - enemy.x, kogel.y - enemy.y);
            if (distance - enemy.radius - kogel.radius < 1) {
                setTimeout(() => {
                    enemies.splice(index, 1);
                    kogels.splice(kogelindex, 1);
                    // score verhogen
            score += 1;
            scoreEl.innerHTML = score
                }, 0);
            }
        });
    });
}

let remainingShots = 1000; // Aantal kogels dat je mag schieten

// Functie om het aantal kogels in de HTML te updaten
function updateShotsDisplay() {
    const shotsLeftElement = document.getElementById('shots-left');
    shotsLeftElement.innerText = remainingShots;
}

window.addEventListener('click', (event) => {
    if (remainingShots > 0) { // Controleer of je nog kogels over hebt
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
        const speed = 4;
        const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
        kogels.push(new Kogel(x, y, 5, 'white', velocity));

        remainingShots--; // Verminder het aantal kogels
        console.log(`Remaining shots: ${remainingShots}`); // Optioneel: Laat in de console zien hoeveel kogels je nog hebt
    } else {
        console.log('No shots remaining!'); // Optioneel: Meld dat je geen kogels meer hebt
    }
});

restartButton.addEventListener('click', () => {
    alertContainer.style.display = 'none'; // Verberg de alert-container
    location.reload();
});

animate()
spawnEnemies()
