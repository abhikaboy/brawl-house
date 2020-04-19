let character; 
let characterSprites = [];
let characterNames = ["Archer","Ember","Shadow","Necromancer","Valor"];
let graves = [];
let entities = [];
let isCharacterSelected = false;
let attackId = 0;
let idealTime = 16.6667;
class Character{
    constructor(){
        this.mass; 
        this.acceleration = createVector(0,0);
        this.velocity = createVector(0,0);
        this.velocities = [];
        this.position = createVector(200,0);
        this.forces = [];
        this.netForce = createVector(0,0);
        this.maxJumps = 1;
        this.jumpsLeft = this.maxJumps;
        this.airborne; 
        this.hp;
        this.maxHealth;
        this.speed;
        this.power; 
        this.statusEffects = []; 
        this.abilities;
        this.resistance;
        this.direction; 
        this.name;
        this.displayName; 
        this.buttonIndex;
        this.sprite;
        this.size = createVector(128*scaleX,128*scaleY);
        this.ghost;
        this.moveright;
        this.moveleft;

        this.removeYVelPos;
        this.removeYVelNeg;
        this.removeXVelPos;
        this.removeXVelNeg;

        this.dirBlocked; 
        this.jumpPower = -16.25;
        this.dodging = false;
        this.stillDodging = false;
        this.lastMove;
        this.freeMove = true;
        this.opacity = 255;

        this.basehp;
        this.basespeed;
        this.basepower;
        this.baseresistance;
        this.abilities = [];
        this.friction = 1;

        this.weaponAnimationFrame = 0;
        this.hasWeapon = false;
        this.basicAnimation = [];
        this.basicAttacking = false;
        this.basicAttackFrameCount = 8;
        this.weaponPos = createVector(0,0);
        this.weaponSpriteSize;

        this.attacksRecieved = [];
        this.bodyType;
        this.weaponRotation;
        this.grappling = false;
        this.lastPlatformHit;
        this.lookingForLastPlatform = false;

        this.dead = false;
        this.graveDropChance = 1;
    }
    die(){
        entities.splice(entities.indexOf(this),1);
        if(this.name == "Skeleton"){
            if(random() < this.graveDropChance){
                graves[graves.length] = new Grave(this.position.x,this.position.y,this.name);
                entities.push(graves[graves.length -1]);
            }
        }
    }
    applyStatusEffect(effect){
        if(effect != "basic" && effect != "none"){
            this.statusEffects.push(effect);
        }
    }
    basicAttack(){
        //"doing the basic attack!");
        if(this.basicAttacking == false){
            this.basicAttacking = true;
            attackId++;
        }
    }

    takeDamage(dmg){
        if(!this.stillDodging){
            this.hp -= dmg;
            socket.emit("damage-marker",{x:this.position.x+random(-this.size.x,this.size.x),y:this.position.y+random(-this.size.y,0),dmg:dmg,room:roomId,scaleX:scaleX,scaleY:scaleY,alpha:255});
        } else{
            console.log("DODGED!!!!!");
        }
    }
    heal(amount){
        this.hp += amount;
        consol.log("HEALING");
    }
    processSquareAttack(x,y,dmg,enemyScaleX,enemyScaleY,sizeX,sizeY,type,atckId){
        let scaleFactorX = scaleX/enemyScaleX;
        let scaleFactorY = scaleY/enemyScaleY;
        if(this.attacksRecieved.includes(atckId)){
        } else {
            let result = this.detectAttackRecievedSqaure(x,y,scaleFactorX,scaleFactorY,sizeX,sizeY);
            if(result){
                this.takeDamage(dmg);
                //"HIT");
                if(type == "Lifesteal"){
                    socket.emit("enemy-heal",{amount:dmg/2,room:roomId});
                } else if(type == "Bat Lifesteal"){
                    socket.emit("bat-heal",{amount:dmg/2,room:roomId});
                } else {
                    this.applyStatusEffect(type);
                }
                this.attacksRecieved.push(atckId);
            }
        }

    }
    processCircleAttack(radius,dmg,x,y,enemyScaleX,enemyScaleY,type,atckID){
        let scaleFactorX = scaleX/enemyScaleX;
        let scaleFactorY = scaleY/enemyScaleY;
        // push attack id into attacks recieved
        if(this.attacksRecieved.includes(atckID)){
            //"we already got this attack!");
        } else {
            let result = this.detectAttackRecievedCircle(x,y,scaleFactorX,scaleFactorY,radius);
            if(result){
                this.takeDamage(dmg);
                this.applyStatusEffect(type);
                this.attacksRecieved.push(atckID);
            }       
        }
    }
    sendSquareAttack(x,y,dmg,sizeX,sizeY,type,attackId){
        socket.emit("new-square-attack",{x:x,y:y,dmg:dmg,scaleX:scaleX,scaleY:scaleY,sizeX:sizeX,sizeY:sizeY,type:type,room:roomId,attackId:attackId});
    }
    sendCircleAttack(radius,dmg,x,y,type,atkId){
        socket.emit("new-circle-attack",{x:x,y:y,dmg:dmg,scaleX:scaleX,scaleY:scaleY,radius:radius,type:type,room:roomId,attackId:atkId});
    }
    detectAttackRecievedSqaure(x,y,scaleFactorX,scaleFactorY,sizeX,sizeY){
        x = x*scaleFactorX;
        y = y*scaleFactorY; 
        let rightIncomming = x + sizeX/2;
        let leftIncomming = x - sizeX/2;
        let topIncomming = y - sizeY/2;
        let bottomIncomming = y + sizeY/2;

        let rightBody = this.position.x + this.size.x/2;
        let leftBody = this.position.x - this.size.x/2;
        let topBody = this.position.y - this.size.y/2;
        let bottomBody = this.position.y + this.size.y/2;

        if(rightIncomming > leftBody && leftIncomming < rightBody && topIncomming < topBody && bottomIncomming  > topBody){
            return true;  
        } 
        else if(leftIncomming < rightBody && rightIncomming > leftBody && topIncomming < topBody && bottomIncomming  > topBody){
            return true; 
        }
        else if(topIncomming < topBody && bottomIncomming  > topBody && rightIncomming > leftBody && leftIncomming < rightBody){
            return true; 
        }
        else if(topIncomming < bottomBody && bottomIncomming > bottomBody && rightIncomming > leftBody && leftIncomming < rightBody){
            return true; 
        }
        else if(x > leftBody && x < rightBody && y < bottomBody && y > topBody){
            return true; 
        } else {
            return false; 
        }

    }
    detectAttackRecievedCircle(x,y,scaleFactorX,scaleFactorY,radius){
        x = x*scaleFactorX;
        y = y*scaleFactorY; 
        let distance = dist(x,y,this.position.x,this.position.y)
        if(distance + radius <= this.size.x){
            return true;
        } else if(distance - radius <= this.size.x){
            return true;
        } else{
            return false; 
        }
    }

    show(){

    }    
    applyFriction(){
        if(this.velocity.x >= -1 || this.velocity.x <= 1){
            if(this.dirBlocked == "only negative Y" || this.dirBlocked == "only positive Y" || this.dirBlocked == "none"){
                let friction = this.friction;
                if(this.velocity.x > 0){
                    friction = this.friction *-1;
                } else {
                    friction = this.friction;
                }
                if(this.velocity.x >= -1 && this.velocity.x <= 1){
                    this.velocity.x = 0;
                    friction = 0;
                }
                let frictionVector = createVector(friction*this.mass,0);
                this.applyForce(frictionVector);
            }
        }
    }
    jump(){
        if(this.jumpsLeft > 0 && !this.grappling){
            this.velocity.y = this.jumpPower;
            this.jumpsLeft--;
        }
    }
    dodge(){
        if(!this.grappling){
            this.dodging = true;
            this.stillDodging = true;
        }
    }
    checkPlatformCollisions(platform){
        let collided = platform.checkCollisionSquare();
        if(collided){
            this.applyForce(platform.getReturnForce);
        }
    }
    parseStats(hp,speed,power,resistance){
        let ret = [];
        ret.push(hp);
        ret.push((speed/20));
        ret.push((power/4));
        ret.push((resistance/2.5));
        return ret;
    }
    setStats(stats){
        this.hp = this.basehp + stats[0];
        this.maxHealth = this.hp;
        this.speed = this.basespeed + stats[1];
        this.power = this.basepower + stats[2]; 
        this.resistance = this.baseresistance + stats[3]; 
    }
    sendDamagePacket(dmg,type){
        socket.emit("damagePacket",{damage:dmg,type:type})
    }
    addVelocity(newVelocity){
        this.velocities.push(newVelocity);
    }
    applyForce(force){
        this.forces.push(force);
    }
    constrainEdges(){
        this.position.x = constrain(this.position.x,this.size.x/2,screen.width-this.size.x/2);
        this.position.y = constrain(this.position.y,this.size.y/2,screen.height+this.size.y/2);
    }
    exertForce(angle){
        let exertedForce = createVector(this.netForce.x*sin(angle),this.netForce.y*cos(angle));
        return exertedForce
    }
    collisionHandle(platforms){
        for(let i = 0; i < platforms.length; i++){
            let platform = platforms[i];
            let collision = platform.checkCollisionSquare(this.position.x,this.position.y,this.size,this.speed);
            let res = collision.state;
            this.dirBlocked = "none";
            if(res){ // down is positive
                if(platform.name != "Floor" && collision.direction != "bottom" && this.lookingForLastPlatform){
                    this.lastPlatformHit = platform;
                }
                switch(collision.direction){
                    case "bottom":
                        this.dirBlocked = "only negative Y"
                        this.jumpsLeft = this.maxJumps;
                        break;
                    case "within":
                        this.dirBlocked = "only negative Y"
                        this.jumpsLeft = this.maxJumps;
                        break;
                    case "top":
                        this.dirBlocked = "only positive Y"
                        break;
                    case "left":
                        this.dirBlocked = "only positive X"
                        this.jumpsLeft = this.maxJumps;
                        break;
                    case "right":
                        this.dirBlocked = "only negative X"
                        this.jumpsLeft = this.maxJumps;
                        break;
                }
                break;
            }
        }
    }
    clearVelocities(){
        this.velocities = [];
    }
    moveHandle(){
        if(this.moveright){
            this.velocity.x = this.speed;
        } else if (this.moveleft){
            this.velocity.x = this.speed*-1;
        } else {
            //this.velocity.x = 0;
        }
    }
    resetForces(){
        this.forces = [];
    }
    getSendableData(){
        let flipWeapon = (this.position.x > mouseX) ? true:false;
        let data = {x:this.position.x,opacity:this.opacity,y:this.position.y,name:this.name,sprite:this.spriteIndex,scale:scaleX,
        weaponSprite:this.weaponSprite,animationFrame:this.weaponAnimationFrame,weaponPosX:this.weaponPos.x,weaponPosY:this.weaponPos.y,
        flipWeapon:flipWeapon,weaponRotation:this.weaponRotation,weaponSpriteSize:this.weaponSpriteSize};
        return data;
    }
    actualWeaponDraw(){
        
    }
    drawWeapon(animation){
        // find the opposite, find the y to calculate the hypotenuse 
        let deltaX = (mouseX - this.position.x);
        let deltaY = ( this.position.y - mouseY);
        let hypotenuse = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2),0.5);
        let angleToCursor;
        if(hypotenuse != 0){
            angleToCursor = (this.position.y > mouseY) ? -asin(deltaX / hypotenuse)-180:asin(deltaX / hypotenuse);
        }
        push();
        deltaX = constrain(deltaX,this.size.x/-2,this.size.x/2);
        deltaY = constrain(deltaY,this.size.y/-4,this.size.x/4);
        this.weaponPos = createVector(this.position.x+(deltaX),this.position.y+(deltaY*-1))
        translate(this.weaponPos.x,this.weaponPos.y);
        this.weaponRotation = 90-angleToCursor;
        rotate(this.weaponRotation);
        if(this.position.x > mouseX){
            scale(1,-1);
        }
        image(animation[this.weaponAnimationFrame],0,0,this.weaponSpriteSize*scaleX,this.weaponSpriteSize*scaleY);
        
        pop();
    }
    basicAttackHandle(){
        if(this.basicAttacking){
            if(frameCount % 2 == 0){
                this.sendSquareAttack(this.weaponPos.x,this.weaponPos.y,5,this.weaponSpriteSize*scaleX*0.8,this.weaponSpriteSize*scaleY,"basic",attackId);
                this.weaponAnimationFrame++;
            }
            if(this.weaponAnimationFrame == this.basicAttackFrameCount){
                this.weaponAnimationFrame = 0;
                this.basicAttacking = false;
            }
        }
    }
    drawName(){
        textSize(35);
        fill(255,255,255);
        textAlign(CENTER, CENTER);
        text(this.name,this.position.x,this.position.y-this.size.y/1.5);
    }
    grappleHandle(){

    }
    characterVelocityChange(){

    }
    // apply enemy status defect function or something 
    updatePosition(){
        this.netForce.x = 0;
        this.netForce.y = 0;
        this.grappleHandle();
        this.applyFriction();
        for(let i = 0; i < this.forces.length; i++){
            this.netForce.add(this.forces[i]);
        }
        if(this.freeMove){
            this.moveHandle();
        }
        for(let i = 0; i < this.velocities.length;i++){
            this.velocity.add(this.velocities[i]);
        }
        this.velocities = [];
        this.acceleration = createVector(this.netForce.x/this.mass,this.netForce.y/this.mass);
        if(this.dodging){
            let direction = (mouseX>this.position.x) ? 1:-1;
            this.velocity.x = 31.25*direction;
            this.dodging = false;
            this.freeMove = false;
            this.opacity = 200;
        }
        this.characterVelocityChange();
        this.velocity.add(this.acceleration);
        if(this.stillDodging && this.velocity.x > -1 && this.velocity.x < 1){
            this.stillDodging = false;
            this.freeMove = true;
            this.opacity = 255;
        }
        if(this.dirBlocked != "none"){
            switch(this.dirBlocked){
                case "only negative Y":
                    if(this.velocity.y > 0){
                        this.velocity.y = 0;
                    }
                    break;
                case "only positive Y":
                    if(this.velocity.y < 0){
                        this.velocity.y = 0;
                    }
                    break;
                case "only negative X":
                    if(this.velocity.x > 0){
                        this.velocity.x = 0;
                    }
                    //this.velocity.y = 0;
                    break;
                case "only positive X":
                    if(this.velocity.x < 0){
                        this.velocity.x = 0;
                    }
                    //this.velocity.y = 0;
                    break;
            }
        }
        let scaledVelX = this.velocity.x * scaleX;
        let scaledVelY = this.velocity.y * scaleY;
        let finalVel = createVector(scaledVelX,scaledVelY);
        this.position.add(finalVel);
        this.constrainEdges();
        if(this.dead){
            this.die();
        }
    }
}
class Archer extends Character{
    constructor(){
        super();
        this.name = "Archer";
        this.buttonIndex = 2;
        this.mass = .75; 
        this.basehp = 100; //100
        this.basespeed = 10;
        this.basepower = 10; 
        this.baseresistance = 2; 
        this.spriteIndex = 0;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSprite = 1;
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];
        this.shootingAnimation = weaponSpritesAnimations[basicAttacks];
        this.grappleSprite = weaponSpritesAnimations[basicAttacks+1];
        this.artemisbowSprite = weaponSpritesAnimations[basicAttacks+2];
        this.arrowShoot = new ArrowShoot();
        this.multiShot = new MultiShot();
        this.grapple = new Grapple();
        this.artimesBow = new ArtemisBow();

        this.shooting = false;
        this.multishooting = false;
        this.holdingGrapple = false;
        this.hookLastAttached = false;
        this.holdingArtemisBow = false;
    }
    basicAttack(){
        if(!this.basicAttacking && !this.shooting && this.weaponAnimationFrame < 3 && !this.multishooting && !this.holdingArtemisBow){
            this.basicAttacking = true;
            attackId++;
        }
    }
    getSendableData(){
        let flipWeapon = (this.position.x > mouseX) ? true:false;
        let weaponNow;
        if(this.shooting || this.multishooting){
            weaponNow = basicAttacks; 
        } else if(this.holdingGrapple){
            weaponNow = basicAttacks+1;
        } else if (this.holdingArtemisBow){
            weaponNow = basicAttacks+2;
        } else {
            weaponNow = this.weaponSprite;
        }
        let data = {x:this.position.x,opacity:this.opacity,y:this.position.y,name:this.name,sprite:this.spriteIndex,scale:scaleX,
        weaponSprite:weaponNow,animationFrame:this.weaponAnimationFrame,weaponPosX:this.weaponPos.x,weaponPosY:this.weaponPos.y,
        flipWeapon:flipWeapon,weaponRotation:this.weaponRotation,weaponSpriteSize:this.weaponSpriteSize};
        return data;
    }
    show(){
        this.drawName();
        tint(this.opacity,255);
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);

        if(!this.shooting && !this.holdingGrapple && !this.multishooting && !this.holdingArtemisBow){
            this.drawWeapon(this.basicAnimation);
        } else if(this.shooting || this.multishooting){
            this.drawWeapon(this.shootingAnimation);
        } else if(this.holdingGrapple){
            this.weaponAnimationFrame = 0;
            this.drawWeapon(this.grappleSprite);
        } else if(this.holdingArtemisBow){
            this.weaponAnimationFrame = 0;
            this.drawWeapon(this.artemisbowSprite);
        }

        this.basicAttackHandle();
        tint(255,255);
        this.updateAbilityOne();
        this.updateAbilityTwo();
        this.updateAbilityThree();
        this.updateAbilityFour();
    }
    sendCharacterData(){
        socket.emit("enemy-char-data",{percentHealth:(this.hp/this.maxHealth),room:roomId});
    }
    executeAbilityOne(){
        if(!this.arrowShoot.active && this.arrowShoot.currentcooldown <= 0 && !this.basicAttacking){
            this.shooting = true;
            this.arrowShoot.active = true;
            this.weaponAnimationFrame = 0;
        } else {
        }
    }
    updateAbilityOne(){
        if(this.arrowShoot.active){
            if(this.weaponAnimationFrame < 5 && this.shooting && frameCount % 3 == 0){
                this.weaponAnimationFrame++;
                this.shooting = true;
            } else if(this.weaponAnimationFrame == 5 && this.shooting){
                this.arrowShoot = new ArrowShoot();
                this.arrowShoot.activate(this.position.x,this.position.y);
                this.shooting = false;
                this.weaponAnimationFrame = 0;
            } else if(this.shooting == false){
                this.arrowShoot.update();
            }
        } else {
            //this.shooting = false;
        }
    }
    executeAbilityTwo(){
        if(!this.multiShot.active && this.multiShot.currentcooldown <= 0 && !this.basicAttacking){
            this.multishooting = true;
            this.multiShot.active = true;
            this.weaponAnimationFrame = 0;
        }
    }
    updateAbilityTwo(){
        if(this.multiShot.active){
            if(this.weaponAnimationFrame < 5 && this.multishooting && frameCount % 3 == 0){
                this.weaponAnimationFrame++;
                this.multishooting = true;
            } else if(this.weaponAnimationFrame == 5 && this.multishooting){
                this.multiShot = new MultiShot();
                this.multiShot.activate(this.position.x,this.position.y);
                this.multishooting = false;
            } else if(this.multishooting == false){
                this.multiShot.update();
                this.multishooting = false;
                this.weaponAnimationFrame = 0;
            }
        } else {
            //this.shooting = false;
        }
    }
    executeAbilityThree(){
        if(!this.grapple.active && this.grapple.currentcooldown <= 0 && !this.basicAttacking){
            this.holdingGrapple = true;
            this.grapple = new Grapple();
            this.grapple.active = true;
            this.weaponAnimationFrame = 0;
            this.grapple.activate(this.position.x,this.position.y);
            this.grapple.decay();
        }
    }
    // do force for a certain amout of time 
    updateAbilityThree(){
        if(this.grapple.active){
            this.grapple.update();
        }
    }
    executeAbilityFour(){
        if(!this.artimesBow.active && this.artimesBow.currentcooldown <= 0 && !this.basicAttacking && !this.holdingGrapple){
            this.holdingArtemisBow = true;
            this.artimesBow = new ArtemisBow();
            this.artimesBow.active = true;
            this.weaponAnimationFrame = 0;
            this.artimesBow.activate();
            this.artimesBow.decay();
        } else if(this.artimesBow.active && this.artimesBow.duration > 0){
            this.artimesBow.shoot(this.position.x,this.position.y);
        }
    }
    updateAbilityFour(){
        if(this.artimesBow.active){
            this.artimesBow.update();
        } 
        if(this.artimesBow.duration <= 0){
            this.artimesBow.active = false;
            this.holdingArtemisBow = false;
        }
    }
    grappleHandle(){
        if(this.grappling){
            this.applyForce(this.grapple.getForce());
            //"APPLYING FORCE");
        }
        if(!this.hookLastAttached && this.grapple.attached){
            //"LATCHED");
            this.grappling = true;
            setTimeout(() => {
                this.grappling = false;
                this.holdingGrapple = false;
                this.grapple.active = false;
            },300)
        }
        if(!this.grapple.active){
            this.grappling = false;
            this.holdingGrapple = false;
        }
        this.hookLastAttached = this.grapple.attached;
    }
}
class Ember extends Character{
    constructor(){
        super();
        this.name = "Ember";
        this.buttonIndex = 0;
        this.fire = 0;
        this.mass = 1; 
        this.basehp = 125;
        this.basespeed = 8;
        this.basepower = 20; 
        this.baseresistance = 2; 
        this.spriteIndex = 1;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.weaponSprite = 0;
        this.hasWeapon = true;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.weaponSpriteSize = 200;
        this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];
        this.bodyType = "square";
        this.maxFire = 100;
        this.executePassive();
        this.fireburst = new FireBurst();
        this.hotstreak = new HotStreak();
        this.firetrap = new FireTrap();
        this.shieloffire = new ShieldOfFire();
        this.firetrapDuration = 7;
    }
    show(){
        this.updateAbilityFour();
        this.drawName();

        tint(this.opacity,255);
        fill(52);
        rect(this.position.x-this.size.x/2, this.position.y - this.size.x,this.maxFire,20);
        fill(255,30,30);
        rect(this.position.x-this.size.x/2, this.position.y - this.size.x,this.fire,20);        
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);
        tint(255,255);

        this.drawWeapon(this.basicAnimation);
        this.basicAttackHandle();

        this.updateAbilityOne();
        this.updateAbilityTwo();
        this.updateAbilityThree();
    }
    sendCharacterData(){
        let health = this.hp/this.maxHealth
        socket.emit("enemy-char-data",{percentHealth: health,room:roomId});
    }
    executeAbilityOne(){
        if(!this.fireburst.active && this.fire > 20){
            this.fire -= 20;
            this.fireburst = new FireBurst();
            this.fireburst.activate(this.position.x,this.position.y);
        }
    }
    updateAbilityOne(){
        if(this.fireburst.active){
            this.fireburst.update();
        }
    }
    executeAbilityTwo(){
        if(!this.hotstreak.active && this.fire > 30){
            this.fire -= 30;
            this.hotstreak = new HotStreak();
            this.hotstreak.activate(this.dirBlocked,this.position.x,this.position.y+this.size.y/2);
            this.freeMove = false;
        } else{
            this.freeMove = true;
        }
    }
    updateAbilityTwo(){
       // if(this.hotstreak.active){
            this.hotstreak.update(this.position.x,this.position.y+this.size.y/2);
       // }
    }
    executeAbilityThree(){
        if(!this.firetrap.active && this.fire > 40){
            this.fire -= 40;
            this.firetrap = new FireTrap(this.position.x-this.size.x/2,this.position.y+this.size.y/4,7,5);
            this.firetrap.place();
        } else if(this.firetrap.active && !this.firetrap.activated && this.firetrap.duration < this.firetrapDuration-1){
            this.firetrap.activate();
        } 
    }
    updateAbilityThree(){
        if(this.firetrap.active){
            this.firetrap.update();
        }
    }
    executeAbilityFour(){
        if(this.fire > 5){
            let sizeX = this.size.x * 3;
            let sizeY = this.size.y * 3;
            let totalSize = createVector(sizeX,sizeY);
            this.shieloffire.activate(this.position.x,this.position.y,totalSize);
        }
    }
    updateAbilityFour(){
        if(this.fire > 5){
            this.shieloffire.update();
            if(this.shieloffire.active){
                this.fire -= 0.5;
            }
        } else {
            this.shieloffire.disable();
        }
    }
    executePassive(){
        setTimeout(() => {
            this.fire++;
            this.fire = constrain(this.fire,0,this.maxFire);
            this.executePassive();
        },200)
    }

}
class Necromancer extends Character{
    constructor(){
        super();
        this.name = "Necromancer";
        this.buttonIndex = 1;
        this.mass = .75; 
        this.basehp = 100; //100
        this.basespeed = 7;
        this.basepower = 10; 
        this.baseresistance = 2; 
        this.spriteIndex = 2;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSprite = 2;
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];

        this.summonSkeleAnimation = weaponSpritesAnimations[basicAttacks+3];
        this.reviveGravesAnimation = weaponSpritesAnimations[basicAttacks+4];
        this.impulseAnimation = weaponSpritesAnimations[basicAttacks+5];
        this.summonBatsAnimation = weaponSpritesAnimations[basicAttacks+6];

        this.skeletonSummon = new SkeletonSummon();
        this.graveRevival = new GraveRevival();
        this.impulse = new Impulse();
        this.summonBats = new VampireSwarm();

        this.currentAnimation = 0;
    }
    getSendableData(){
        let flipWeapon = (this.position.x > mouseX) ? true:false;
        let weaponNow = this.weaponSprite;
        let data = {x:this.position.x,opacity:this.opacity,y:this.position.y,name:this.name,sprite:this.spriteIndex,scale:scaleX,
        weaponSprite:weaponNow,animationFrame:this.weaponAnimationFrame,weaponPosX:this.weaponPos.x,weaponPosY:this.weaponPos.y,
        flipWeapon:flipWeapon,weaponRotation:this.weaponRotation,weaponSpriteSize:this.weaponSpriteSize};
        return data;
    }
    show(){
        this.drawName();
        tint(this.opacity,255);
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);

        if(this.currentAnimation == 0){
            this.drawWeapon(this.basicAnimation);
        } else{
            switch(this.currentAnimation){
                case 1:
                    this.drawWeapon(this.summonSkeleAnimation);
                    break;
                case 2:
                    this.drawWeapon(this.reviveGravesAnimation);
                    break;
                case 3:
                    this.drawWeapon(this.impulseAnimation);
                    break;
                case 4:
                    this.drawWeapon(this.summonBatsAnimation);
                    break;
            }
            if(frameCount % 2 == 0 ){
                this.weaponAnimationFrame++;
            }
            if(this.weaponAnimationFrame == 7){
                this.currentAnimation = 0;
                this.weaponAnimationFrame = 0;
            }
        }

        this.basicAttackHandle();
        this.updateAbilityThree();
        tint(255,255);
    }
    sendCharacterData(){
        socket.emit("enemy-char-data",{percentHealth:(this.hp/this.maxHealth),room:roomId});
    }
    executeAbilityOne(){
        if(this.skeletonSummon.currentcooldown <= 0 && !this.basicAttacking){
            this.currentAnimation = 1;
            this.skeletonSummon.active = true;
            this.skeletonSummon.activate(mouseX,mouseY);
        }
    }
    executeAbilityTwo(){
        if(this.graveRevival.currentcooldown <= 0 && !this.basicAttacking){
            this.currentAnimation = 2;
            this.graveRevival.active = true;
            this.graveRevival.activate();
        }  
    }
    executeAbilityThree(){
        if(this.impulse.currentcooldown <= 0 && !this.basicAttacking){
            this.currentAnimation = 3;
            this.impulse.active = true;
            this.impulse.activate(this.position.x,this.position.y,createVector(this.size.x*5,this.size.y*5));
        }  
    }
    updateAbilityThree(){
        if(this.impulse.active){
            this.impulse.update();
        }
    }
    executeAbilityFour(){
        if(this.summonBats.currentcooldown <= 0 && !this.basicAttacking){
            this.currentAnimation = 4;
            this.summonBats.active = true;
            this.summonBats.activate();
        }  
    }
}
class Skeleton extends Character{
    constructor(x,y){
        super();
        this.position = createVector(x,y);
        this.name = "Skeleton";
        this.mass = .75; 
        this.hp = 15; //100
        this.maxHealth = 15;
        this.speed = 16;
        this.power = 5; 
        this.resistance = 0; 
        this.spriteIndex = 5;
        this.animationIndex = 5;
        this.sprite = entitySpritesAnimations[this.animationIndex][0];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.basicAnimation = entitySpritesAnimations[this.animationIndex + 1];
        this.walkingAnimation = entitySpritesAnimations[this.animationIndex];
        this.currentFrame = 0;
        this.alive = true;
        this.opacity = 255;
        this.freeMove = true;
        this.jumpDelay = 300;
        this.canJump = true;
        this.jumpsLeft = 2;
        this.grappling = false;
        this.jumpPower = -22;
        this.friction = 3;
        this.damage = 2;

        this.airborne = false;

        this.lockedOnX;
        this.lockedOnY;

        this.relocatingUp = false;
        this.relocatingDown = false;
        this.lookingForLastPlatform = true;

        this.rightOverride = false;
        this.leftOverride = false;

        this.currentInstruction = "none";
    }
    withinRange(value,target,tolerance){
        if(value > target - tolerance && value < target + tolerance){
            return true;
        } else {
            return false;
        }
    }
    basicAttack(){
        //"doing the basic attack!");
        if(this.basicAttacking == false){
            this.currentFrame = 0;
            this.basicAttacking = true;
            attackId++;
        }
    }
    basicAttackHandle(){
        if(this.basicAttacking){
            if(frameCount % 2 == 0){
                this.sendSquareAttack(this.position.x,this.position.y,this.damage,this.weaponSpriteSize*scaleX*0.8,this.weaponSpriteSize*scaleY,"basic",attackId);
                this.currentFrame++;
            }
            if(this.currentFrame == this.basicAttackFrameCount){
                this.currentFrame = 0;
                this.basicAttacking = false;
            }
        }
    }
    setJumpDelay(){
        setTimeout(() => {
            this.canJump = true;
        },this.jumpDelay);
    }
    goToEnemy(){
        let enemy = enemyEntities[0];
        let toTheLeft = (this.position.x < enemy.x) ? true:false; 
        let withinX = this.withinRange(this.position.x,enemy.x,50);
        if(toTheLeft){
            this.moveright = true;
            this.moveleft = false;
            //"moving right");
        } else if(withinX){
            this.moveright = false;
            this.moveleft = false;
            //"Within X");
        } else {
            this.moveright = false;
            this.moveleft = true;
            //"moving left");
        }
    }
    pathfind(){
        let enemyLevel;
        let currentLevel;
        let enemy = enemyEntities[0];

        let toTheLeft = (this.position.x < enemy.x) ? true:false; 
        let withinX = this.withinRange(this.position.x,enemy.x,50);

        if(enemy.y > middleBottom){
            enemyLevel = "Bottom";
        } else if(enemy.y > upperBottom){
            enemyLevel = "Middle";
        } else {
            enemyLevel = "Top";
        }
        if(this.position.y > middleBottom){
            currentLevel = "Bottom";
        } else if(this.position.y > upperBottom){
            currentLevel = "Middle";
        } else {
            currentLevel = "Top";
        }
        if(currentLevel  == enemyLevel && enemyLevel == "Bottom"){
            this.goToEnemy();
        } else if(enemyLevel == "Bottom"){
            if(currentLevel == "Top"){
                if(this.position.x > screen.width/2){
                    this.moveright = true;
                    this.moveleft = false;
                } else {
                    this.moveleft = true;
                    this.moveright = false;
                }
            } else {
                let platformMiddle  = 0.58125*screen.width;
                if(this.position.x > screen.width/2){
                    let platformWidth = (0.4125*screen.width) - (0.1*screen.width)
                    if(this.position.x < 0.58125*screen.width+  platformWidth/2){
                        this.moveleft = true;
                        this.moveright = false
                    } else {
                        this.moveleft = false;
                        this.moveright = true;
                    }
                    // on right platform
                } else {
                    // on left platform 
                    let platformWidth = (0.4125*screen.width) - (0.1*screen.width);
                    if(this.position.x < 0.1*screen.width+  platformWidth/2){
                        this.moveleft = true;
                        this.moveright = false
                    } else {
                        this.moveleft = false;
                        this.moveright = true;
                    }
                }
            }
        }
        if(currentLevel == enemyLevel && enemyLevel == "Middle"){
            // if both of us are on the left or right platform just like go to them.
            // else travel to the other 
            this.goToEnemy();
            if(this.position.x > 0.4125*screen.width && this.position.x < 0.58125*screen.width && this.canJump){
                this.jump();
                this.canJump = false;
                this.setJumpDelay();
            }
        } else if(enemyLevel == "Middle"){
            // bottom and we have to get up
            // top and we have to get down
            if(currentLevel == "Top"){
                if(enemy.x > screen.width/2){
                    this.moveleft = false;
                    this.moveright = true;
                } else {
                    this.moveleft = true;
                    this.moveright = false;
                }
            }
            if(currentLevel == "Bottom"){
                // find closest jumping spot
                //let numbers = [4, 2, 5, 1, 3];
                //numbers.sort((a, b) => a - b);
                this.getToMiddle();
            }
        }
        if(currentLevel == enemyLevel && enemyLevel == "Top"){
            this.goToEnemy();
        } else if(enemyLevel == "Top"){
            if(currentLevel == "Bottom"){
                this.getToMiddle();
            } else { // we're in the middle

                let platformWidth = (0.4125*screen.width) - (0.1*screen.width);
                let platformMiddle;
                if(this.position.x > screen.width/2){ // we're on the right
                    platformMiddle = (0.58125*screen.width)+(platformWidth/2);
                    //platformMiddle + " on the right ");
                } else{ // we're on the left
                    platformMiddle = (0.1*screen.width)+(platformWidth/2);
                    //platformMiddle + " on the left ");
                }
                this.goToXLocation(platformMiddle);
                if(this.withinRange(this.position.x,platformMiddle,50)){
                    this.jump();
                    this.canJump = false;
                    this.setJumpDelay();
                }

            }
        }
    }
    getToMiddle(){
        let middleMove = (this.position.x > screen.width/2) ? true:false
        let dists = [{name:"Middle", value:dist(screen.width/2,0,this.position.x,0), moveLeft:middleMove},
        {name: "Left", value: dist(0,0,this.position.x,0), moveLeft: true},
        {name: "Right", value: dist(screen.width,0,this.position.x,0), moveLeft: false}];
        dists.sort((a,b) => { return a.value-b.value});
        let closestPosition = dists[0];
        //dists);
        //closestPosition.name);
        this.moveleft = closestPosition.moveLeft;
        this.moveright = !this.moveleft;
        if(this.withinRange(closestPosition.value,0,200*scaleX)){
            this.jump();
            this.canJump = false;
            this.setJumpDelay();
        }
    }
    goToXLocation(point){
        //"going to an x location");
        if(this.position.x > point){
            this.moveleft = true;
            this.moveright = false;
        } else{
            this.moveright = true;
            this.moveleft = false;
        }
    }
    show(){
        this.basicAttackHandle();
        this.airborne = (this.dirBlocked == "none") ? true:false;
        this.drawName();
        tint(this.opacity,255);
        if(this.basicAttacking){
            //this.currentFrame);
            image(this.basicAnimation[this.currentFrame],this.position.x,this.position.y,160*scaleX,160*scaleY);
        } else {
            //"doin da walk")
            image(this.walkingAnimation[this.currentFrame],this.position.x,this.position.y,160*scaleX,160*scaleY);
        }
        //);
        tint(255,255);
        if(this.hp <= 0){
            this.dead = true;
        }
        if(frameCount % 3 == 0 && !this.basicAttacking){
            this.currentFrame++;
        }
        if(this.currentFrame == 10){
            this.currentFrame = 0;
        }
        this.pathfind();
        //dist(this.position.x,this.position.y,enemyEntities[0].x,enemyEntities[0].y));
        if(dist(this.position.x,this.position.y,enemyEntities[0].x,enemyEntities[0].y) < 200){
            this.basicAttack();
        }
    }
    getSendableData(){
        let animation = this.animationIndex;
        if(this.basicAttacking){
            animation += 1;
        }
        let data = {
            x:this.position.x,
            opacity:this.opacity,
            y:this.position.y,
            name:this.name,
            animationIndex:animation,
            scale:scaleX,
            animationFrame:this.currentFrame
    };
        return data;
    }
}
class VampireBat extends Character{
    constructor(x,y){
        super();
        this.position = createVector(x,y);
        this.name = "Vampire Bat";
        this.mass = .75; 
        this.hp = 10; //100
        this.maxHealth = 15;
        this.speed = 16;
        this.power = 5; 
        this.resistance = 0; 
        this.spriteIndex = 5;
        this.animationIndex = 8;
        this.sprite = entitySpritesAnimations[this.animationIndex][0];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.walkingAnimation = entitySpritesAnimations[this.animationIndex];
        this.currentFrame = 0;
        this.alive = true;
        this.opacity = 255;
        this.freeMove = true;

        this.jumpDelay = 300;
        this.canJump = true;
        this.jumpsLeft = 2;
        this.grappling = false;
        this.jumpPower = -22;
        this.friction = 3;
        this.damage = 2;

        this.airborne = false;
        this.attackFrame = 0;
    }
    withinRange(value,target,tolerance){
        if(value > target - tolerance && value < target + tolerance){
            return true;
        } else {
            return false;
        }
    }
    basicAttack(){
        //"doing the basic attack!");
        if(this.basicAttacking == false){
            //this.currentFrame = 0;
            this.basicAttacking = true;
            attackId++;
        }
    }
    basicAttackHandle(){
        if(this.basicAttacking){
            if(frameCount % 2 == 0){
                this.sendSquareAttack(this.position.x,this.position.y-50,this.damage,this.weaponSpriteSize*scaleX*0.8,this.weaponSpriteSize*scaleY,"Bat Lifesteal",attackId);
                this.attackFrame++;
            }
            if(this.attackFrame == this.basicAttackFrameCount){
                this.attackFrame = 0;
                this.basicAttacking = false;
            }
        }
    }
    setJumpDelay(){
        setTimeout(() => {
            this.canJump = true;
        },this.jumpDelay);
    }
    setJumpDelay(){
        setTimeout(() => {
            this.canJump = true;
        },this.jumpDelay);
    }
    goToEnemy(){
        let enemy = enemyEntities[0];
        let toTheLeft = (this.position.x < enemy.x) ? true:false; 
        let withinX = this.withinRange(this.position.x,enemy.x,50);
        if(toTheLeft){
            this.moveright = true;
            this.moveleft = false;
            //"moving right");
        } else if(withinX){
            this.moveright = false;
            this.moveleft = false;
            //"Within X");
        } else {
            this.moveright = false;
            this.moveleft = true;
            //"moving left");
        }
    }
    pathfind(){
        let enemyLevel;
        let currentLevel;
        let enemy = enemyEntities[0];

        let toTheLeft = (this.position.x < enemy.x) ? true:false; 
        let withinX = this.withinRange(this.position.x,enemy.x,50);

        if(enemy.y > middleBottom){
            enemyLevel = "Bottom";
        } else if(enemy.y > upperBottom){
            enemyLevel = "Middle";
        } else {
            enemyLevel = "Top";
        }
        if(this.position.y > middleBottom){
            currentLevel = "Bottom";
        } else if(this.position.y > upperBottom){
            currentLevel = "Middle";
        } else {
            currentLevel = "Top";
        }
        if(currentLevel  == enemyLevel && enemyLevel == "Bottom"){
            this.goToEnemy();
        } else if(enemyLevel == "Bottom"){
            if(currentLevel == "Top"){
                if(this.position.x > screen.width/2){
                    this.moveright = true;
                    this.moveleft = false;
                } else {
                    this.moveleft = true;
                    this.moveright = false;
                }
            } else {
                let platformMiddle  = 0.58125*screen.width;
                if(this.position.x > screen.width/2){
                    let platformWidth = (0.4125*screen.width) - (0.1*screen.width)
                    if(this.position.x < 0.58125*screen.width+  platformWidth/2){
                        this.moveleft = true;
                        this.moveright = false
                    } else {
                        this.moveleft = false;
                        this.moveright = true;
                    }
                    // on right platform
                } else {
                    // on left platform 
                    let platformWidth = (0.4125*screen.width) - (0.1*screen.width);
                    if(this.position.x < 0.1*screen.width+  platformWidth/2){
                        this.moveleft = true;
                        this.moveright = false
                    } else {
                        this.moveleft = false;
                        this.moveright = true;
                    }
                }
            }
        }
        if(currentLevel == enemyLevel && enemyLevel == "Middle"){
            // if both of us are on the left or right platform just like go to them.
            // else travel to the other 
            this.goToEnemy();
            if(this.position.x > 0.4125*screen.width && this.position.x < 0.58125*screen.width && this.canJump){
                this.jump();
                this.canJump = false;
                this.setJumpDelay();
            }
        } else if(enemyLevel == "Middle"){
            // bottom and we have to get up
            // top and we have to get down
            if(currentLevel == "Top"){
                if(enemy.x > screen.width/2){
                    this.moveleft = false;
                    this.moveright = true;
                } else {
                    this.moveleft = true;
                    this.moveright = false;
                }
            }
            if(currentLevel == "Bottom"){
                // find closest jumping spot
                //let numbers = [4, 2, 5, 1, 3];
                //numbers.sort((a, b) => a - b);
                this.getToMiddle();
            }
        }
        if(currentLevel == enemyLevel && enemyLevel == "Top"){
            this.goToEnemy();
        } else if(enemyLevel == "Top"){
            if(currentLevel == "Bottom"){
                this.getToMiddle();
            } else { // we're in the middle

                let platformWidth = (0.4125*screen.width) - (0.1*screen.width);
                let platformMiddle;
                if(this.position.x > screen.width/2){ // we're on the right
                    platformMiddle = (0.58125*screen.width)+(platformWidth/2);
                    //platformMiddle + " on the right ");
                } else{ // we're on the left
                    platformMiddle = (0.1*screen.width)+(platformWidth/2);
                    //platformMiddle + " on the left ");
                }
                this.goToXLocation(platformMiddle);
                if(this.withinRange(this.position.x,platformMiddle,50)){
                    this.jump();
                    this.canJump = false;
                    this.setJumpDelay();
                }

            }
        }
    }
    getToMiddle(){
        let middleMove = (this.position.x > screen.width/2) ? true:false
        let dists = [{name:"Middle", value:dist(screen.width/2,0,this.position.x,0), moveLeft:middleMove},
        {name: "Left", value: dist(0,0,this.position.x,0), moveLeft: true},
        {name: "Right", value: dist(screen.width,0,this.position.x,0), moveLeft: false}];
        dists.sort((a,b) => { return a.value-b.value});
        let closestPosition = dists[0];
        //dists);
        //closestPosition.name);
        this.moveleft = closestPosition.moveLeft;
        this.moveright = !this.moveleft;
        if(this.withinRange(closestPosition.value,0,200*scaleX)){
            this.jump();
            this.canJump = false;
            this.setJumpDelay();
        }
    }
    goToXLocation(point){
        //"going to an x location");
        if(this.position.x > point){
            this.moveleft = true;
            this.moveright = false;
        } else{
            this.moveright = true;
            this.moveleft = false;
        }
    }
    show(){
        this.basicAttackHandle();
        this.airborne = (this.dirBlocked == "none") ? true:false;
        this.drawName();
        tint(this.opacity,255);
        //"doin da walk")
        image(this.walkingAnimation[this.currentFrame],this.position.x,this.position.y-50,160*scaleX,160*scaleY);
        //);
        tint(255,255);
        if(this.hp <= 0){
            this.dead = true;
        }
        if(frameCount % 3 == 0){
            this.currentFrame++;
        }
        if(this.currentFrame == 5){
            this.currentFrame = 0;
        }
        this.pathfind();
        if(dist(this.position.x,this.position.y,enemyEntities[0].x,enemyEntities[0].y) < 200){
            this.basicAttack();
        }
        this.applyForce(createVector(0,-0.1));
    }
    getSendableData(){
        let animation = this.animationIndex;
        let data = {
            x:this.position.x,
            opacity:this.opacity,
            y:this.position.y,
            name:this.name,
            animationIndex:animation,
            scale:scaleX,
            animationFrame:this.currentFrame
    };
        return data;
    }
}
class Valor extends Character{
    constructor(){
        super();
        this.name = "Valor";
        this.buttonIndex = 1;
        this.mass = .75; 
        this.basehp = 80; //100
        this.basespeed = 7;
        this.basepower = 10; 
        this.baseresistance = 5; 
        this.spriteIndex = 4;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSprite = 3;
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];
        this.windAttack;
        this.currentAttack = 0;
        this.slashDash = new SlashDash();
        this.slam = new Slam();
    }
    show(){
        this.drawName();

        tint(this.opacity,255);
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);
        tint(255,255);

        this.drawWeapon(this.basicAnimation);
        this.basicAttackHandle();

        this.updateAbilityOne();
        this.updateAbilityTwo();
        // this.updateAbilityThree();
    }
    sendCharacterData(){
        let health = this.hp/this.maxHealth
        socket.emit("enemy-char-data",{percentHealth: health,room:roomId});
    }
    basicAttack(){
        if(this.basicAttacking == false){
            this.basicAttacking = true;
            attackId++;
            this.currentAttack = attackId;
            console.log("Basic Attack ID " + attackId);
            let deltaX = (mouseX - this.position.x)/1;
            let deltaY = (this.position.y - mouseY)/-1;
            let dirVector = createVector(deltaX,deltaY);
            dirVector.normalize();
            dirVector.mult(40);
            this.windAttack = new WindAttack(this.position.x,this.position.y,dirVector,3);
        }
    }
    characterVelocityChange(){
        console.log(this.slashDash.dashing);
        if(this.slashDash.dashing){
            this.velocity = this.slashDash.getVelocity();
            console.log("character change velocity thing, dashing");
        }
        if(this.slam.slamming){
            this.velocity = this.slam.getVelocity();
            this.slam.reachedBottom = (this.dirBlocked == "only negative Y") ? true:false;
        }
    }
    basicAttackHandle(){
        if(this.basicAttacking){
            if(frameCount % 2 == 0){
                this.sendSquareAttack(this.weaponPos.x,this.weaponPos.y,5,this.weaponSpriteSize*scaleX*0.8,this.weaponSpriteSize*scaleY,"basic",this.currentAttack);
                this.weaponAnimationFrame = (random()>0.5) ? this.weaponAnimationFrame+1:this.weaponAnimationFrame+2;
            }
            if(this.weaponAnimationFrame >= this.basicAttackFrameCount){
                this.weaponAnimationFrame = 0;
                this.basicAttacking = false;
            }
            this.windAttack.update();
        }
    }
    executeAbilityOne(){
            if(!this.slashDash.active && this.slashDash.currentcooldown <= 0){
                this.slashDash = new SlashDash();
            }
            if(!this.slashDash.isDone){
                this.slashDash.activate(this.position.x,this.position.y);
            }
    }
    updateAbilityOne(){
        this.slashDash.update();    
    }
    executeAbilityTwo(){
        if(!this.slam.active && this.slam.currentcooldown <= 0){
            this.slam = new Slam();
            this.slam.activate();
        }
    }
    updateAbilityTwo(){
        if(this.slam.active){
            this.slam.update();
        }
    }
}
class Shadow extends Character{

}
class Grave extends Character{
    constructor(x,y,entity){
        super();
        this.position = createVector(x,y);
        this.name = "Grave";
        this.mass = .75; 
        this.hp = 15; //100
        this.maxHealth = 15;
        this.speed = 16;
        this.power = 5; 
        this.resistance = 0; 
        this.spriteIndex = 5;
        this.animationIndex = 7;
        this.sprite = entitySpritesAnimations[this.animationIndex][0];
        this.ghost = false;
        this.bodyType = "square";
        this.weaponSpriteSize = 160;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        this.walkingAnimation = entitySpritesAnimations[this.animationIndex];
        this.currentFrame = 0;
        this.alive = true;
        this.opacity = 255;
        this.freeMove = true;
        this.jumpDelay = 300;
        this.canJump = true;
        this.jumpsLeft = 2;
        this.grappling = false;
        this.jumpPower = -22;
        this.friction = 3;

        this.airborne = false;

        this.entity = entity;
    }
    processSquareAttack(x,y,dmg,enemyScaleX,enemyScaleY,sizeX,sizeY,type,atckId){
    }
    takeDamage(){
        //"lol u thought");
    }
    show(){
        image(this.sprite,this.position.x,this.position.y,160*scaleX,160*scaleY);
    }
    getSendableData(){
        let animation = this.animationIndex;
        let data = {
            x:this.position.x,
            opacity:this.opacity,
            y:this.position.y,
            name:this.name,
            scale:scaleX
    };
        return data;
    }
}