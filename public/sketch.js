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
let weaponSpritesAnimations = [];
let entitySpritesAnimations = [];
let arrow;
let grapple;
let blueWindSlice;

let damageMarkers = [];
// have a 2d array, first layer is the sprite sheet the second is the frames
let animationFrames = [8]
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
    for(let i=0; i<4;i++){
        weaponSprites.push(loadImage("/Web Assets/Character/Weapons/basic" +i+".png"));
    }
    for(let i = 0; i < 7; i++){
        weaponSprites.push(loadImage("/Web Assets/Character/Weapons/ability" +i+".png"));
    }

    arrow = loadImage("/Web Assets/Character/Weapons/Archer Arrow.png");
    hook = loadImage("/Web Assets/Character/Weapons/Hook.png");
    windSlice = loadImage("/Web Assets/Character/Weapons/Wind Slice.png");
    blueWindSlice = loadImage("/Web Assets/Character/Weapons/Blue Wind Slice.png");
    // grapple = loadImage("/Web Assets/Character/Weapons/Grapple.png")
    entitySprites = characterSprites; // for now
    entitySprites.push(loadImage("/Web Assets/Character/Creatures/Skeleton Walking.png"));
    entitySprites.push(loadImage("/Web Assets/Character/Creatures/Skeleton Basic.png"));
    entitySprites.push(loadImage("/Web Assets/Character/Creatures/Grave.png"));
    entitySprites.push(loadImage("/Web Assets/Character/Creatures/Bat Flying.png"));
}

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

let basicAttacks = 4;
function setup(){
    openFullscreen();
    angleMode(DEGREES); 
    let canvas = createCanvas(screen.width,screen.height);
    for(let i=0; i<weaponSprites.length;i++){
        let frames = 8;
        weaponSpritesAnimations[i] = [];
        console.log(weaponSpritesAnimations[0]);
        for(let j = 0; j< frames; j++){
            let frameSize = (i == 0) ? 200:160; 
            frames = (i == basicAttacks) ? 6:8; // this loads the first ability, which is the arrow charge
            if(i == basicAttacks + 1){
                frames = 1;
            }
            console.log(frameSize + " frame size");
            let img = weaponSprites[i].get(j*frameSize,0,frameSize,frameSize);
            weaponSpritesAnimations[i].push(img);
        }
        console.log(i);
    }
    for(let i = 0; i < entitySprites.length;i++){
        if(i >= 5){
            console.log("LOADING THE SKELETON WALKING");
            let frames = [0,0,0,0,0,10,8,1,5];
            entitySpritesAnimations[i] = [];
            for(let j = 0; j < frames[i]; j++){
                let frameSize = 160;
                let img = entitySprites[i].get(j*frameSize,0,frameSize,frameSize);
                entitySpritesAnimations[i].push(img);
            }
            console.log(entitySpritesAnimations);
        }
    }
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
                clearSelectors();
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
            for(let i = 0; i < entities.length; i++){
                entities[i].resetForces();
            }
            drawGameplayScreen();
            let gravity = createVector(0,character.mass*0.5);
            for(let i = 0; i < entities.length; i++){
                entities[i].applyForce(gravity);
                entities[i].clearVelocities();
                entities[i].collisionHandle(platforms);
                entities[i].show();
                entities[i].updatePosition();
            }
            character.sendCharacterData();
            for(let i = 0; i < enemyEntities.length; i++){
                let scaleFactorX = scaleX/enemyEntities[i].scale;
                let scaleFactorY= scaleY/enemyEntities[i].scale;
                textSize(35);
                fill(255);
                let x = enemyEntities[i].x * (scaleFactorX);
                let y = enemyEntities[i].y * (scaleFactorY);
                if(enemyEntities[i].name != "Grave"){
                    text(enemyEntities[i].name,x,y-100);
                }
                tint(enemyEntities[i].opacity,255);
                if(enemyEntities[i].name == "Skeleton" || enemyEntities[i].name == "Vampire Bat"){
                    image(entitySpritesAnimations[enemyEntities[i].animationIndex][enemyEntities[i].animationFrame],x,y-(50*scaleX),160*scaleX,160*scaleY)
                } else if(enemyEntities[i].name == "Grave"){
                    image(entitySpritesAnimations[7][0],x,y,160*scaleX,160*scaleY);
                } 
                else {
                    image(entitySprites[enemyEntities[i].sprite],x,y,128*scaleX,128*scaleY);
                }
                tint(255,255);

                // drawing the weapon 
                if(enemyEntities[i].name == "Skeleton" || enemyEntities[i].name == "Vampire Bat" || enemyEntities[i].name == "Grave"){

                } else {
                    push();
                    translate(enemyEntities[i].weaponPosX*scaleFactorX,enemyEntities[i].weaponPosY*scaleFactorY);
                    rotate(enemyEntities[i].weaponRotation);
                    if(enemyEntities[i].flipWeapon){
                        scale(1,-1);
                    }
                    image(weaponSpritesAnimations[enemyEntities[i].weaponSprite][enemyEntities[i].animationFrame],0,0,enemyEntities[i].weaponSpriteSize*scaleX,enemyEntities[i].weaponSpriteSize*scaleX);
                    pop();
                }
            }
            for(let i = 0; i < enemyProjectiles.length; i++){
                let scaleFactorX = scaleX/enemyProjectiles[i].scaleX;
                let scaleFactorY = scaleY/enemyProjectiles[i].scaleY;
                console.log("Updating The Enemy Projectiles")
                switch(enemyProjectiles[i].name){
                    case "Fireball":
                        fill(enemyProjectiles[i].r,enemyProjectiles[i].g,enemyProjectiles[i].b,enemyProjectiles[i].alpha);
                        ellipse(enemyProjectiles[i].x*scaleFactorX,enemyProjectiles[i].y*scaleFactorY,enemyProjectiles[i].radius*2,enemyProjectiles[i].radius*2);
                        break;
                    case "Lifesteal":
                        fill(enemyProjectiles[i].r,enemyProjectiles[i].g,enemyProjectiles[i].b,enemyProjectiles[i].alpha);
                        ellipse(enemyProjectiles[i].x*scaleFactorX,enemyProjectiles[i].y*scaleFactorY,enemyProjectiles[i].radius*2,enemyProjectiles[i].radius*2);
                        break;
                    case "Arrow":
                        push();
                        translate(enemyProjectiles[i].x*scaleFactorX,enemyProjectiles[i].y*scaleFactorY);
                        rotate(enemyProjectiles[i].rotation);
                        scale(-1,1);
                        image(arrow,0,0,enemyProjectiles[i].width*scaleFactorX,enemyProjectiles[i].height*scaleFactorX);
                        pop();
                        break;
                    case "Grapple":
                        push();
                        translate(enemyProjectiles[i].x*scaleFactorX,enemyProjectiles[i].y*scaleFactorY);
                        rotate(enemyProjectiles[i].rotation);
                        scale(-1,1);
                        image(hook,0,0,enemyProjectiles[i].width*scaleFactorX,enemyProjectiles[i].height*scaleFactorX);
                        pop();
                        stroke(255);
                        strokeWeight(3);
                        line(enemyProjectiles[i].charX*scaleFactorX,enemyProjectiles[i].charY*scaleFactorY,enemyProjectiles[i].x*scaleFactorX,enemyProjectiles[i].y*scaleFactorY);
                        noStroke();
                        break;
                    
                }
            }
            sendAllEntities();
            sendAllProjectiles();
            let healthbarWidth = character.hp/character.maxHealth;
            if(currentHPWidth > healthbarWidth*(screen.width*0.486)){
                currentHPWidth -= (currentHPWidth-(healthbarWidth*(screen.width*0.486)))/10;
                console.log("health going down");
            } else if(currentHPWidth < healthbarWidth*(screen.width*0.486)){
                console.log("less than!");
                currentHPWidth -= (currentHPWidth-(healthbarWidth*(screen.width*0.486)))/10;
            }
            imageMode(CORNER);
            image(healthbar,0,0,currentHPWidth,(0.143)*screen.height);
            image(healthbar,(screen.width*0.515),0,(screen.width*0.486)*enemyPercentHealth,(0.143)*screen.height);
            imageMode(CENTER);

            fill(255);
            textSize(30);
            text(getFrameRate(),500,100);   
            
            for(let i = 0; i < damageMarkers.length; i++){
                let scaleFactorX = scaleX / damageMarkers[i].scaleX;
                let scaleFactorY = scaleY / damageMarkers[i].scaleY;
                if(damageMarkers[i].dmg > 3){
                    fill(255,220,220,damageMarkers[i].alpha);
                } else {
                    fill(255,255,255,damageMarkers[i].alpha);
                }
                text(damageMarkers[i].dmg,damageMarkers[i].x*scaleFactorX,damageMarkers[i].y*scaleFactorY);
                damageMarkers[i].y -= 2;
                damageMarkers[i].alpha -= 10;
                if(damageMarkers[i].alpha < 0){
                    damageMarkers.splice(i,1);
                }
            }
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
})
socket.on("damage-marker", (data) => {
    data = data.data;
    damageMarkers.push(data);
})
socket.on("heal", (data) => {
    data = data.data;
    character.heal(data.amount);
    console.log("WE GOTTA HEAL!");
})
socket.on("bat-heal",(data) => {
    data = data.data;
    console.log("we were told to do the bat heal");
    for(entity of entities){
        entity.heal(data.amount);
    }
})
socket.on("new-particle", (data) => {
    data = data.data;
    particles.push(new Particle(data.x,data.y,data.dir));
})