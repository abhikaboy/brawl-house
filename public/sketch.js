let socket = io.connect();
let scene = "menu";
let socketId;
let roomId;
let rot = 1;
let enemyEntities = [];
let enemyProjectiles = [];
let healthbar;
let entitySprites = [];
let weaponSprites = [];
let deltaTime;
let time;
let timeLastFrame;
function preload(){
    selectScreen = loadImage("/Web Assets/Character Selection/Character Selection Screen.jpg");
    statScreen = loadImage("/Web Assets/Character Selection/Stat Pick.jpg");
    statScreenReady = loadImage("/Web Assets/Character Selection/Stat Pick Ready.jpg");
    healthbar = loadImage("/Web Assets/Maps/healthbar.jpg");
    for(let i=0; i< 5;i++){
        characterSelected.push(loadImage("/Web Assets/Character Selected/Character Selected " + i + ".png"));
    }
    for(let i=0; i< 5;i++){
        characterSprites.push(loadImage("/Web Assets/Character/" + characterNames[i] + ".png"));
    }
    for(let i=0; i<2;i++){
        weaponSprites.push(loadImage("/Web Assets/Character/Weapons/basic" +i+".png"));
    }
    entitySprites = characterSprites; // for now
}

/* When the openFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function setup(){
    // openFullscreen();
    angleMode(DEGREES); 
    let canvas = createCanvas(screen.width,screen.height);
}

function draw(){
    rot += 1;
    switch(scene){
        case "menu": 
            background(0);
            selectHandle();
            if(!menuMade){
                makeMenu();
                console.log("we just made the menu!");
                menuMade = true;
            }
            break;
        case "match-making":
            resetButtons();
            makeWaitingScreen();
            break;
        case "character-select":
            resetButtons();
            makeCharacterSelect();
            selectHandleNoParticle();
            menuMade = false;
            break;
        case "character-waiting":
            resetButtons();
            makeWaitingCharacterScreen();
            selectHandleLocked();
            break;
        case "skill-select":
            background(0);
            if(!menuMade){
                resetButtons(); 
                makeStatSelectScreen();
                menuMade = true;
            } else{
                drawStatSelectScreen();
                selectHandleStatReady();
            }
            timeLastFrame = Date.now();
            break;
        case "skill-waiting":
            break;
        case "gameplay":
            // time = Date.now();
            // deltaTime = time - timeLastFrame; 
            // timeLastFrame = time;     
            for(let i = 0; i < entities.length; i++){
                entities[i].resetForces();
            }
            drawGameplayScreen();
            let gravity = createVector(0,character.mass*0.5);
            character.applyForce(gravity);
            for(let i = 0; i < entities.length; i++){
                entities[i].clearVelocities();
                entities[i].collisionHandle(platforms);
                entities[i].show();
                entities[i].updatePosition();
            }
            character.sendCharacterData();
            for(let i = 0; i < enemyEntities.length; i++){
                textSize(35);
                fill(255);
                let x = enemyEntities[i].x * (scaleX/enemyEntities[i].scale);
                let y = enemyEntities[i].y * (scaleY/enemyEntities[i].scale);
                text(enemyEntities[i].name,x,y-100);
                tint(enemyEntities[i].opacity,255);
                image(entitySprites[enemyEntities[i].sprite],x,y,128*scaleX,128*scaleY);
                tint(255,255);
            }
            for(let i = 0; i < enemyProjectiles.length; i++){
                console.log("Updating The Enemy Projectiles")
                switch(enemyProjectiles[i].name){
                    case "Fireball":
                        fill(enemyProjectiles[i].r,enemyProjectiles[i].g,enemyProjectiles[i].b,enemyProjectiles[i].alpha);
                        ellipse(enemyProjectiles[i].x,enemyProjectiles[i].y,enemyProjectiles[i].radius*2,enemyProjectiles[i].radius*2);
                }
            }
            sendAllEntities();
            sendAllProjectiles();
            let healthbarWidth = character.hp/character.maxHealth;
            if(currentHPWidth > healthbarWidth*(screen.width*0.486)){
                currentHPWidth -= (currentHPWidth-(healthbarWidth*(screen.width*0.486)))/10;
            }
            imageMode(CORNER);
            image(healthbar,0,0,currentHPWidth,(0.143)*screen.height);
            image(healthbar,(screen.width*0.515),0,(screen.width*0.486)*enemyPercentHealth,(0.143)*screen.height);
            imageMode(CENTER);

            fill(255);
            textSize(25);
            text(getFrameRate(),500,100);    
            break;
    }
    particles.forEach(particleHandle);

}
let currentHPWidth = screen.width*0.486;
socket.on("success",(data)=>{
    console.log("We have successfully connected to the server");
    console.log("Socket id: " + data.id);
    socketId = data.id;
})
socket.on("foundEnemy", (data)=>{
    console.log(data);
    console.log("We found an enemy!!");
    let back = document.getElementById("charSelect");
    back.style.display = "block";
    back.style.width = screen.width + "px";
    back.style.height = screen.height + "px";
    scene = "character-select";
    roomId = data.roomId;
    socket.emit('leave-waiting', {roomId:roomId});
    socket.emit('remove-from-queue', {});
})
let enemySelectedIndex;
let enemyCharacterSelected = false;
let enemyLocked = false;
socket.on("enemy-character-selected",(data)=>{
    console.log("the enemy has selected a character");
    console.log(data.index);
    enemyCharacterSelected = true; 
    enemySelectedIndex = data.index;
})
socket.on("enemyLocked", (data)=>{
    enemyLocked = true; 
    console.log("Okay so basically the enemy locked their character");
    if(isCharacterLocked){
        goToSkillSelect();
    }
})
socket.on("enemy-ready-to-play", (data)=>{
    enemyReadyToPlay = true; 
    console.log("the enemy said he was ready in room" + data.room);
    if(readyToPlay){
        console.log("The enemy is finally ready");
        scene = "gameplay"; // ;) finally
        menuMade = false;
        makeGameplayScreen();
    } else {
        console.log("but i wasn't ready!");
        startGameCountdown();
    }
})
socket.on("enemy-entity-packet",(data)=>{
    enemyEntities = data.entities;
})
let enemyPercentHealth;
socket.on("enemy-char-data", (data) => {
    data = data.data;
    enemyPercentHealth = data.percentHealth;
})
socket.on("enemy-square-attack", (data) => {
    data = data.data;
    for(let i = 0; i < entities.length; i++){
        console.log(data.attackId);
        entities[i].processSquareAttack(data.x,data.y,data.dmg,data.scaleX,data.scaleY,data.sizeX,data.sizeY,data.type,data.attackId);
    }
})
socket.on("enemy-circle-attack", (data) => {
    data = data.data;
    for(let i = 0; i < entities.length; i++){
        console.log("processing an attack");
        entities[i].processCircleAttack(data.radius,data.dmg,data.x,data.y,data.scaleX,data.type,data.attackId);
    }
})
socket.on("enemy-projectile-packet", (data) => {
    data = data.data;
    enemyProjectiles = data.projectiles;
    console.log(enemyProjectiles);
})

