const config = { 
    type: Phaser.WEBGL,
    width: window.innerWidth,  // Definir largura dinâmica com base na janela
    height: window.innerHeight, // Definir altura dinâmica com base na janela
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let plane, bullets, clouds, questionText;
let question = {};
let gameOver = false;
let shotFired = false;
const moveStep = 50; // Distância que o avião se move por toque/tecla

function preload() {
    this.load.image('plane', 'plane.png');
    this.load.image('cloud', 'cloud.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    this.cameras.main.setBackgroundColor('#5DADE2'); 
    
    // Ajusta o avião com base no tamanho da tela
    plane = this.physics.add.sprite(config.width / 2, config.height - 50, 'plane').setScale(0.2);
    plane.setCollideWorldBounds(true);
    
    bullets = this.physics.add.group();
    clouds = this.physics.add.group();
    
    this.input.keyboard.on('keydown-LEFT', () => movePlane(-moveStep));
    this.input.keyboard.on('keydown-RIGHT', () => movePlane(moveStep));
    this.input.keyboard.on('keydown-SPACE', shoot, this);
    
    this.input.on('pointerdown', handleTouch, this);
    
    questionText = this.add.text(config.width / 2, 30, '', { 
        fontSize: '32px', 
        fill: '#fff', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 4,
        align: 'center'
    }).setOrigin(0.5);
    
    generateQuestion.call(this);
}

function movePlane(step) {
    let newX = Phaser.Math.Clamp(plane.x + step, 50, config.width - 50); // Mantém o avião dentro da tela
    plane.setX(newX);
}

function handleTouch(pointer) {
    let step = pointer.x < game.config.width / 2 ? -moveStep : moveStep;
    movePlane(step);
}

function shoot() {
    if (gameOver || shotFired) return;
    
    let bullet = bullets.create(plane.x, plane.y - 20, 'bullet').setScale(0.2);
    bullet.setVelocityY(-300);
    shotFired = true;
}

function generateQuestion() {
    const num1 = Phaser.Math.Between(1, 10);
    const num2 = Phaser.Math.Between(1, 10);
    question = { num1, num2, correctAnswer: num1 + num2 };
    questionText.setText(`${num1} + ${num2} = ?`);
    
    let answers = [question.correctAnswer, question.correctAnswer + 2, question.correctAnswer - 2];
    Phaser.Utils.Array.Shuffle(answers);
    
    clouds.clear(true, true);
    
    let positions = [];
    
    answers.forEach((answer) => {
        let x, y = -100;
        let validPosition = false;

        while (!validPosition) {
            x = Phaser.Math.Between(100, config.width - 100);
            validPosition = positions.every(pos => Math.abs(pos - x) > 100);
            if (validPosition) {
                positions.push(x);
            }
        }

        let cloud = clouds.create(x, y, 'cloud').setScale(0.2);
        cloud.answer = answer;
        cloud.setVelocityY(50);
        cloud.setImmovable(true);
        
        cloud.text = this.add.text(cloud.x, cloud.y, answer, { 
            fontSize: '28px', 
            fill: '#fff', 
            fontStyle: 'bold', 
            stroke: '#000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
    });

    shotFired = false;
}

function update() {
    if (gameOver) return;
    
    clouds.children.each((cloud) => {
        if (cloud.y > config.height) {
            gameOver = true;
            showGameOver.call(this);
        }
    });

    bullets.children.each((bullet) => {
        if (bullet.y < 0) bullet.destroy();
    });

    this.physics.overlap(bullets, clouds, hitCloud, null, this);
    
    clouds.children.each((cloud) => {
        if (cloud.text) {
            cloud.text.setPosition(cloud.x, cloud.y);
        }
    });
}

function hitCloud(bullet, cloud) {
    bullet.destroy();
    if (cloud.answer === question.correctAnswer) {
        clouds.children.each((c) => {
            if (c.text) c.text.destroy();
            c.destroy();
        });
        generateQuestion.call(this);
    } else {
        gameOver = true;
        showGameOver.call(this);
    }
}

function showGameOver() {
    this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x000000, 0.7);
    this.add.text(config.width / 2, config.height / 2 - 50, 'GAME OVER', { 
        fontSize: '50px', 
        fill: '#f00', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 6,
        align: 'center'
    }).setOrigin(0.5);
}
