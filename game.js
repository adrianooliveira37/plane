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
    plugins: {
        scene: [
            { key: 'VirtualJoystick', plugin: VirtualJoystickPlugin, mapping: 'virtualJoystick' }
        ]
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
let joystick;
let startButton;

function preload() {
    this.load.image('plane', 'plane.png');
    this.load.image('cloud', 'cloud.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    startButton = document.getElementById('start-button');
    if (!startButton) {
        console.error('Erro: Botão de Start não encontrado!');
        return;
    }

    startButton.addEventListener('click', () => {
        console.log('Botão Start clicado!');
        startButton.classList.add('hidden');
        startGame.call(this);
    });
}

function startGame() {
    this.cameras.main.setBackgroundColor('#5DADE2');
    
    plane = this.physics.add.sprite(100, this.scale.height / 2, 'plane').setScale(0.2);
    plane.setCollideWorldBounds(true);
    
    bullets = this.physics.add.group();
    clouds = this.physics.add.group();
    
    console.log('Tentando criar joystick...');
    joystick = this.virtualJoystick.add(this, {
        x: 100,
        y: Math.max(100, this.scale.height - 100),
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888, 0.5),
        thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8),
        enable: true
    });
    console.log('Joystick criado:', joystick);
    
    questionText = this.add.text(this.scale.width / 2, 30, '', { 
        fontSize: '32px', 
        fill: '#fff', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 4,
        align: 'center'
    }).setOrigin(0.5);
    
    generateQuestion.call(this);
    
    this.scale.on('resize', resizeGame, this);
}

function update() {
    if (gameOver || !joystick) return;
    
    plane.setVelocityY(joystick.forceY * 200);
    
    clouds.children.each((cloud) => {
        if (cloud.x < 0) {
            gameOver = true;
            showGameOver.call(this);
        }
    });
    
    bullets.children.each((bullet) => {
        if (bullet.x > this.scale.width) bullet.destroy();
    });
    
    this.physics.overlap(bullets, clouds, hitCloud, null, this);
}

function resizeGame(gameSize) {
    let { width, height } = gameSize;
    
    if (plane) {
        plane.setY(height / 2);
    }
    
    if (questionText) {
        questionText.setX(width / 2);
    }
    
    if (joystick) {
        joystick.base.setPosition(100, Math.max(100, height - 100));
        joystick.thumb.setPosition(100, Math.max(100, height - 100));
    }
}
