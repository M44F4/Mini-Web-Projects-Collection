// This project was made after watching a course of freeCodeCamp on youtube : https://youtu.be/GFO_txvwK_c?si=Vz137ECtLT0-MbIb
const canvas = document.getElementById('board');
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = 750;
const CANVAS_HEIGHT = canvas.height = 250;
let gameSpeed = 2;
let isJumping = false;
let jumpHeight = 100; 
let jumpSpeed = 5;
let spikeSpeed = gameSpeed;
let spikeArray = [];
let spikeWidth = 100; 
let spikeHeight = 50; 
let gameOverFlag = false;

let score=0;

class Layer {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 1400;
        this.height = 250;
        this.x2 = this.width;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }
    update() {
        this.speed = gameSpeed * this.speedModifier;
        if (this.x <= -this.width) {
            this.x = this.width + this.x2 - this.speed;
        }
        if (this.x2 <= -this.width) {
            this.x2 = this.width + this.x - this.speed;
        }
        this.x = Math.floor(this.x - this.speed);
        this.x2 = Math.floor(this.x2 - this.speed);
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
}

class Ball {
    constructor(image) {
        this.x = 30;
        this.y = CANVAS_HEIGHT - 50 - 42;
        this.width = 50;
        this.height = 50;
        this.image = image;
        this.speedX = 2;
        this.speedY = 5;
        this.gravity = 0.2;
    }
    update() {
        if (isJumping) {
            this.y -= jumpSpeed;
            jumpSpeed -= 0.08; // Increased decrement to jump higher
            if (this.y >= CANVAS_HEIGHT - 50 - 42) {
                this.y = CANVAS_HEIGHT - 50 - 42;
                jumpSpeed = 5;
                isJumping = false;
            }
        }
        else{
            this.y += this.speedY;
            this.speedY += this.gravity;
            // Bounce off the ground
            if (this.y + this.height > CANVAS_HEIGHT -42) {
                this.y = CANVAS_HEIGHT -42 - this.height;
                this.speedY = -this.speedY * 0.8; // Bounce with some loss of energy
            }
        }
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Load images
Promise.all([
    loadImage('./img/layer-1.png'),
    loadImage('./img/layer-2.png'),
    loadImage('./img/layer-3.png'),
    loadImage('./img/layer-4.png'),
    loadImage('./img/layer-5.png'),
    loadImage('./img/ball.png'),
    loadImage('./img/spike1.png'),
    loadImage('./img/spike2.png'),
    loadImage('./img/spike3.png'),
    loadImage('./img/ball-dead.png')
]).then(images => {
    const [backgroundLayer1, backgroundLayer2, backgroundLayer3, backgroundLayer4, backgroundLayer5, ballImage, spike1Image, spike2Image, spike3Image,balldead] = images;

    const layer1 = new Layer(backgroundLayer1, 0.2);
    const layer2 = new Layer(backgroundLayer2, 0.4);
    const layer3 = new Layer(backgroundLayer3, 0.6);
    const layer4 = new Layer(backgroundLayer4, 0.8);
    const layer5 = new Layer(backgroundLayer5, 1);

    const ball = new Ball(ballImage);

    const gameObjects = [layer1, layer2, layer3, layer4, layer5, ball];
   
    


    function animate() {
        gameSpeed+=0.001;
        spikeSpeed+=0.001;
        if(gameOverFlag){
            ball.image=balldead;
            ball.update();
            ball.draw();
            gameOver();
            return;
        }

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        
        

        gameObjects.forEach(object => {
            object.update();
            object.draw();
        });

        // Move spikes
        spikeArray.forEach(spike => {
            spike.x -= spikeSpeed;
            ctx.drawImage(spike.img, spike.x, spike.y, spike.width, spike.height);

            // Collision detection if you consider the ball as a rectangle image
            // if (ball.x < spike.x + spike.width &&
            //     ball.x + ball.width > spike.x &&
            //     ball.y < spike.y + spike.height &&
            //     ball.y + ball.height > spike.y) {
            //     gameOver();
            // }

            //// Collision detection if you consider the ball as a circle
            let circle = { x: ball.x +(ball.width*0.5), y:ball.y +(ball.height*0.5), radius:(ball.height*0.5) };
            let rect = { x: spike.x, y: spike.y, width: spike.width, height: spike.height };
            let closestX = clamp(circle.x, rect.x, rect.x + rect.width);
            let closestY = clamp(circle.y, rect.y, rect.y + rect.height);
        
            // Calculate the distance between the circle's center and this closest point
            let distanceX = circle.x - closestX;
            let distanceY = circle.y - closestY;
            let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
            if (distanceSquared <= (circle.radius * circle.radius)){
                gameOver();
            }
        });

        ctx.fillStyle="black";
        ctx.font="20px courier";
        score++;
        ctx.fillText(score, CANVAS_WIDTH-100, 20);

        requestAnimationFrame(animate);
    }
    animate();

    // Generate spikes
    setInterval(() => {
        if (gameOverFlag) {
            return;
        }

        let spikeX = CANVAS_WIDTH;
        let spikeY = CANVAS_HEIGHT - 50 - 42;
        let spike = {
            img: null,
            x: spikeX,
            y: spikeY,
            width: spikeWidth,
            height: spikeHeight
        };

        let placespikeChance = Math.random(); // 0 - 0.9999...

        if (placespikeChance > .90) { // 10% you get spike3
            spike.img = spike3Image;
        } else if (placespikeChance > .70) { // 20% you get spike2
            spike.img = spike2Image;
        } else { // 70% you get spike1
            spike.img = spike1Image;
        }

        spikeArray.push(spike);

        if (spikeArray.length > 5) {
            spikeArray.shift(); // Remove the first element from the array so that the array doesn't constantly grow
        }
    }, 1500); // Generate spikes every 1.5 seconds
});


function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}





function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}


//EventListener
document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32 && !isJumping && !gameOverFlag) { // Space key
        isJumping = true;
        jumpSpeed = 5;
    }
    
    if ((event.keyCode === 13 || event.key === 'Enter')&& gameOverFlag ) { // Enter key
        gameOverFlag = false;
        restartGame();
    }

    
});


function gameOver() {
    gameOverFlag = true;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = '80px courier';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = '20px courier';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS ENTER TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
}

function restartGame() {
    location.reload();
}

