const config = { 
    type: Phaser.AUTO,
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

function preload() {
    this.load.image('plane', 'plane.png');
    this.load.image('cloud', 'cloud.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    plane = this.physics.add.sprite(100, 300, 'plane');
    plane.setCollideWorldBounds(true);
    bullets = this.physics.add.group();
    clouds = this.physics.add.group();
    
    this.input.keyboard.on('keydown-UP', () => plane.setVelocityY(-200));
    this.input.keyboard.on('keydown-DOWN', () => plane.setVelocityY(200));
    this.input.keyboard.on('keydown-SPACE', shoot, this);
    
    questionText = this.add.text(10, 10, '', { fontSize: '20px', fill: '#000' });
    generateQuestion();
}

function shoot() {
    if (gameOver) return;
    let bullet = bullets.create(plane.x + 50, plane.y, 'bullet');
    bullet.setVelocityX(300);
}

function generateQuestion() {
    const num1 = Phaser.Math.Between(1, 10);
    const num2 = Phaser.Math.Between(1, 10);
    question = { num1, num2, correctAnswer: num1 + num2 };
    questionText.setText(${num1} + ${num2} = ?);
    
    let answers = [question.correctAnswer, question.correctAnswer + 2, question.correctAnswer - 2];
    Phaser.Utils.Array.Shuffle(answers);
    
    clouds.clear(true, true);
    answers.forEach((answer, i) => {
        let cloud = clouds.create(800, 150 + i * 150, 'cloud');
        cloud.answer = answer;
        cloud.setVelocityX(-100);
        this.add.text(cloud.x, cloud.y, answer, { fontSize: '20px', fill: '#000' });
    });
}

function update() {
    if (gameOver) return;
    bullets.children.each((bullet) => {
        if (bullet.x > 800) bullet.destroy();
    });
    
    this.physics.overlap(bullets, clouds, hitCloud, null, this);
}

function hitCloud(bullet, cloud) {
    bullet.destroy();
    if (cloud.answer === question.correctAnswer) {
        generateQuestion();
    } else {
        gameOver = true;
        this.add.text(300, 250, 'GAME OVER', { fontSize: '40px', fill: '#f00' });
    }
}