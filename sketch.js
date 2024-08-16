// Declaração de variáveis globais
let ninja, ninjaIdle, ninjaRun, ninjaJump, ninjaDead;
let ground, groundImage, invisibleGround, verticalGround;
let backgroundImg;
let ghost, ghostImage, ghostGroup;
let shooting, shootingGroup;
let score = 0;
let ghostLive = 0;

// Declara variáveis com letras MAIÚCULAS para valores constantes
const WAIT = 1;
const PLAY = 2;
const END = 0;
let gameState = WAIT;
let soundJump, soundDead, soundForce, soundLaser;

let gameOver, restart, gameOverImg, restartImg;

function preload() {
  // Carregamento de animações, imagens e sons
  backgroundImg = loadImage("./assets/fundo.jpg");
  ninjaIdle = loadAnimation("./assets/Idle0.png", "./assets/Idle1.png", "./assets/Idle2.png", "./assets/Idle3.png", "./assets/Idle4.png", "./assets/Idle5.png", "./assets/Idle6.png", "./assets/Idle7.png", "./assets/Idle8.png", "./assets/Idle9.png");
  ninjaRun = loadAnimation("../assets/Run0.png", "./assets/Run1.png","./assets/Run2.png", "./assets/Run3.png","./assets/Run4.png","./assets/Run5.png", "./assets/Run6.png", "./assets/Run7.png", "./assets/Run8.png", "./assets/Run9.png"); 
  ninjaJump = loadAnimation("./assets/Jump0.png", "./assets/Jump1.png", "./assets/Jump2.png", "./assets/Jump3.png", "./assets/Jump4.png", "./assets/Jump5.png", "./assets/Jump6.png", "./assets/Jump7.png", "./assets/Jump8.png", "../assets/Jump9.png");
  ninjaDead = loadAnimation("../assets/Dead0.png", "./assets/Dead1.png","./assets/Dead2.png", "./assets/Dead3.png", "./assets/Dead4.png", "./assets/Dead5.png", "./assets/Dead6.png", "./assets/Dead7.png", "./assets/Dead8.png", "./assets/Dead9.png");
  groundImage = loadImage("./assets/groundGrande.png");
  ghostImage = loadAnimation("./assets/ghost0.png", "./assets/ghost1.png", "./assets/ghost3.png", "./assets/ghost4.png", "./assets/ghost5.png", "./assets/ghost6.png","./assets/ghost8.png", "./assets/ghost9.png", "./assets/ghost10.png");
  gameOverImg = loadImage("./assets/gameOver.png");
  restartImg = loadImage("./assets/reset.png");
  soundDead = loadSound("./assets/dead.mp3");
  soundForce = loadSound("./assets/TheForce.mp3");
  soundJump = loadSound("./assets/jump.mp3");
  soundLaser = loadSound("./assets/laser.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Configuração do frameRate
  frameRate(60);

  // Configura o fundo
  ground = createSprite(width/2, height - height*0.1, width, height*0.5);
  ground.addImage("ground", groundImage);
  ground.scale = 0.28;

  // Cria o chão invisível e o ground vertical
  invisibleGround = createSprite(width/2, height - height*0.2, width, height*0.06);
  invisibleGround.visible = false;

  verticalGround = createSprite(0, 350, 20, 700);
  verticalGround.visible = false;

  // Cria o grupo de fantasmas e tiros
  ghostGroup = new Group();
  shootingGroup = new Group();

  // Cria o ninja
  ninja = createNinja();

  // Configura o game over e o botão de reinício
  gameOver = createSprite(width/2, height/2 - 150);
  gameOver.addImage(gameOverImg);
  gameOver.scale = 0.8;
  gameOver.visible = false;

  restart = createSprite(width/2, height/2 + 50);
  restart.addImage(restartImg);
  restart.scale = 0.6;
  restart.visible = false;
}

function createNinja() {
  var ninjaSprite = createSprite(width/2 - width*0.4, height - height*0.3, 20, 50); // Ajusta a posição inicial
  ninjaSprite.addAnimation("idle", ninjaIdle);
  ninjaSprite.addAnimation("running", ninjaRun);
  ninjaSprite.addAnimation("jumping", ninjaJump);
  ninjaSprite.addAnimation("deading", ninjaDead);
  ninjaSprite.scale = 0.28;
  ninjaSprite.setCollider("rectangle", 30, 20, 170, 480); // Configura o colisor
  return ninjaSprite;
}

function draw() {
  background(backgroundImg);

  if (keyDown("right")) {
    gameState = PLAY;
    ninja.changeAnimation("running");
  }

  if (gameState === PLAY) {
    // Som da música principal
    if (!soundForce.isPlaying()) {
      soundForce.play();
    }
    spawGhosts();

    if (keyDown("space") && ninja.y >= height*0.2) {
      console.log("o pulo é " + ninja.velocityY);
      console.log("A posição y da ninja é " + ninja.y);
      console.log("a altura do solo invisível é " + invisibleGround.y);
      ninja.velocityY = -10;
      ninja.changeAnimation("jumping");
      // Som do pulo
      if (!soundJump.isPlaying()) {
        soundJump.play();
      }
    }

    if (ninja.isTouching(invisibleGround)) {
      ninja.changeAnimation("running");
    }

    // Configura a velocidade do chão
    ground.velocityX = -(4 + 3*score/100);
    if (ground.x < 0) {
      ground.x = ground.width/8;
    }

    if (keyDown("left")) {
      spawShooting();
      if (!soundLaser.isPlaying()) {
        soundLaser.setVolume(0.25); // Definindo o volume
        soundLaser.play();
      }
    }

    shootingGroup.overlap(ghostGroup, function(shooting, ghost) {
      shooting.remove();
      ghost.remove();
      score = score + 1;
    });

    if (ghostGroup.isTouching(ninja)) {
      gameState = END;
      if (!soundDead.isPlaying()) {
        soundDead.play();
      }

      // Animação de morte antes de remover o ninja
      ninja.changeAnimation("deading");
      setTimeout(() => {
        ninja.remove(); // Remove o ninja após a animação
      }, 3000); // Duração da animação de morte
    }

    ghostGroup.overlap(verticalGround, function(ghost) {
      if (ghost.position.x <= -10) {
        ghost.remove();
        ghostLive++;
      }
    });
  }

  if (gameState === END) {
    ground.velocityX = 0;

    gameOver.visible = true;
    restart.visible = true;
  }

  if (mousePressedOver(restart)) {
    reset();
  }

  // Implementa a gravidade
  ninja.velocityY = ninja.velocityY + 0.8;

  ninja.collide(invisibleGround);
  drawSprites();
  fill("red");
  textSize(35);
  text("Dead ghosts: " + score, width - 400, height - 80);
  fill("white");
  text("Living ghosts: " + ghostLive, width - 400, height - 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function spawGhosts() {
  if (frameCount % 100 === 0) {
    ghost = createSprite(1440, 100, 40, 40);
    ghost.velocityX = -(6 + score/100);
    ghost.y = Math.round(random(100, 500));
    ghost.addAnimation("terror", ghostImage);
    ghost.scale = 0.2;
    ghost.lifetime = 400;
    ghostGroup.add(ghost);
  }
}

function spawShooting() {
  if (frameCount % 5 === 0) {
    shooting = createSprite(ninja.x, ninja.y, 8, 5);
    shooting.velocityX = 5;
    shooting.shapeColor = "black";
    shooting.lifetime = 150;
    shootingGroup.add(shooting);
  }
}

function reset() {
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  score = 0;
  ghostLive = 0;
  
  // Remove o ninja atual
  if (ninja) {
    ninja.remove();
  }

  // Cria um novo ninja
  ninja = createNinja();
}
