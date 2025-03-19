const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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

function preload() {
    this.load.image('plane', 'plane.png');
    this.load.image('cloud', 'cloud.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    // Configuração do botão de Start
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        startButton.classList.add('hidden'); // Esconde o botão
        document.getElementById('controls').classList.remove('hidden'); // Mostra os controles
        startGame.call(this); // Inicia o jogo
    });
}

function startGame() {
    this.cameras.main.setBackgroundColor('#5DADE2');
    
    // Criação do avião
    plane = this.physics.add.sprite(100, this.scale.height / 2, 'plane').setScale(0.2);
    plane.setCollideWorldBounds(true);
    
    // Criação dos grupos de balas e nuvens
    bullets = this.physics.add.group();
    clouds = this.physics.add.group();
    
    // Configuração do texto da pergunta
    questionText = this.add.text(this.scale.width / 2, 30, '', { 
        fontSize: '32px', 
        fill: '#fff', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 4,
        align: 'center'
    }).setOrigin(0.5);
    
    // Gera a primeira pergunta
    generateQuestion.call(this);

    // Configuração dos botões virtuais
    document.getElementById('btn-up').addEventListener('touchstart', () => moveUp(true));
    document.getElementById('btn-up').addEventListener('touchend', () => moveUp(false));
    document.getElementById('btn-down').addEventListener('touchstart', () => moveDown(true));
    document.getElementById('btn-down').addEventListener('touchend', () => moveDown(false));
    document.getElementById('btn-shoot').addEventListener('click', shoot);
}

function update() {
    if (gameOver) return;
    
    bullets.children.each((bullet) => {
        if (bullet.x > this.scale.width) bullet.destroy();
    });

    clouds.children.each((cloud) => {
        if (cloud.x < 0) {
            gameOver = true;
            showGameOver.call(this);
        }
    });
    
    this.physics.overlap(bullets, clouds, hitCloud, null, this);
}

function moveUp(active) {
    plane.setVelocityY(active ? -200 : 0);
}

function moveDown(active) {
    plane.setVelocityY(active ? 200 : 0);
}

function shoot() {
    if (gameOver || shotFired) return;
    
    let bullet = bullets.create(plane.x + 50, plane.y, 'bullet').setScale(0.2);
    bullet.setVelocityX(300);
    shotFired = true;
    setTimeout(() => { shotFired = false; }, 500); // Pequeno delay para evitar spam de tiros
}

function generateQuestion() {
    const num1 = Phaser.Math.Between(1, 10);
    const num2 = Phaser.Math.Between(1, 10);
    question = { num1, num2, correctAnswer: num1 + num2 };
    questionText.setText(`${num1} + ${num2} = ?`);
    
    let answers = [question.correctAnswer, question.correctAnswer + 2, question.correctAnswer - 2];
    Phaser.Utils.Array.Shuffle(answers);
    
    clouds.clear(true, true);
    
    answers.forEach((answer, i) => {
        let cloud = clouds.create(this.scale.width, 150 + i * 150, 'cloud').setScale(0.2);
        cloud.answer = answer;
        cloud.setVelocityX(-100);
        
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
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7);
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { 
        fontSize: '50px', 
        fill: '#f00', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 6,
        align: 'center'
    }).setOrigin(0.5);
}
