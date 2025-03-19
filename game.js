const config = { 
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
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
let shotFired = false; // Variável para controlar se o tiro já foi disparado

function preload() {
    this.load.image('plane', 'plane.png');
    this.load.image('cloud', 'cloud.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    this.cameras.main.setBackgroundColor('#5DADE2'); // Fundo azul mais vibrante
    
    plane = this.physics.add.sprite(100, 300, 'plane').setScale(0.2);
    plane.setCollideWorldBounds(true);
    bullets = this.physics.add.group();
    clouds = this.physics.add.group();
    
    // Controles do teclado
    this.input.keyboard.on('keydown-UP', () => plane.setVelocityY(-200));
    this.input.keyboard.on('keydown-DOWN', () => plane.setVelocityY(200));
    this.input.keyboard.on('keydown-SPACE', shoot, this); // Disparo bloqueado por pergunta
    
    // Controles de toque
    this.input.on('pointerdown', handleTouch, this);
    
    questionText = this.add.text(400, 30, '', { 
        fontSize: '32px', 
        fill: '#fff', 
        fontStyle: 'bold', 
        stroke: '#000', 
        strokeThickness: 4,
        align: 'center'
    }).setOrigin(0.5);
    
    generateQuestion.call(this);
}

function handleTouch(pointer) {
    if (pointer.y < game.config.height / 2) {
        // Se o toque foi na parte superior da tela, sobe
        plane.setVelocityY(-200);
    } else {
        // Se foi na parte inferior, desce
        plane.setVelocityY(200);
    }

    // Toque duplo para atirar
    if (pointer.getDuration() < 200) {
        shoot();
    }
}

function shoot() {
    if (gameOver || shotFired) return;  // Bloqueia disparo se já foi disparado
    
    let bullet = bullets.create(plane.x + 50, plane.y, 'bullet').setScale(0.2);
    bullet.setVelocityX(300);
    shotFired = true; // Marca que um tiro foi disparado
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
        let cloud = clouds.create(800, 150 + i * 150, 'cloud').setScale(0.2);
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

    shotFired = false; // Permite disparar um novo tiro na próxima pergunta
}

function update() {
    if (gameOver) return;
    
    // Verifica se alguma nuvem passou do avião (saiu da tela)
    clouds.children.each((cloud) => {
        if (cloud.x < 0) {
            gameOver = true;
            
            // Adicionando o fundo escuro
            const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 1).setOrigin(0.5);
            
            // Exibindo o texto de Game Over
            this.add.text(400, 250, 'GAME OVER', { 
                fontSize: '50px', 
                fill: '#f00', 
                fontStyle: 'bold', 
                stroke: '#000', 
                strokeThickness: 6,
                align: 'center'
            }).setOrigin(0.5);
        }
    });

    // Remover balas fora da tela
    bullets.children.each((bullet) => {
        if (bullet.x > 800) bullet.destroy();
    });

    // Detectar colisões entre balas e nuvens
    this.physics.overlap(bullets, clouds, hitCloud, null, this);
    
    // Atualiza a posição do texto das nuvens
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
            if (c.text) c.text.destroy(); // Remove todos os textos
            c.destroy(); // Remove todas as nuvens
        });
        generateQuestion.call(this);
    } else {
        gameOver = true;
        
        // Adicionando o fundo escuro
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 1).setOrigin(0.5);

        // Exibindo o texto de Game Over
        this.add.text(400, 250, 'GAME OVER', { 
            fontSize: '50px', 
            fill: '#f00', 
            fontStyle: 'bold', 
            stroke: '#000', 
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
    }
}
