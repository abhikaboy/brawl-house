let character; 
let characterSprites = [];
let characterNames = ["Archer","Ember","Necromancer","Shadow","Yassuo"];
let entities = [];
let isCharacterSelected = false;
let attackId = 0;
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

        this.hasWeapon = false;
        this.basicAnimation = [];
        this.basicAnimationFrame = 0;
        this.basicAttacking = false;
        this.basicAttackFrameCount = 8;
        this.weaponPos = createVector(0,0);

        this.attacksRecieved = [];
        this.bodyType;
    }
    applyStatusEffect(effect){
        if(effect != "basic" && effect != "none"){
            this.statusEffects.push(effect);
        }
    }
    basicAttack(){
        console.log("doing the basic attack!");
        if(this.basicAttacking == false){
            this.basicAttacking = true;
            attackId++;
        }
    }
    takeDamage(dmg){
        this.hp -= dmg;
    }
    processSquareAttack(x,y,dmg,enemyScaleX,enemyScaleY,sizeX,sizeY,type,atckId){
        let scaleFactorX = scaleX/enemyScaleX;
        let scaleFactorY = scaleY/enemyScaleY;
        if(this.attacksRecieved.includes(atckId)){
        } else {
            let result = this.detectAttackRecievedSqaure(x,y,scaleFactorX,scaleFactorY,sizeX,sizeY);
            if(result){
                this.takeDamage(dmg);
                console.log("HIT");
                this.applyStatusEffect(type);
                this.attacksRecieved.push(atckId);
            }
        }

    }
    processCircleAttack(radius,dmg,x,y,enemyScaleX,enemyScaleY,type,atckID){
        let scaleFactorX = scaleX/enemyScaleX;
        let scaleFactorY = scaleY/enemyScaleY;
        // push attack id into attacks recieved
        if(this.attacksRecieved.includes(atckID)){
            console.log("we already got this attack!");
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
        console.log("sending a square attack")
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
        if(this.jumpsLeft > 0){
            this.velocity.y = this.jumpPower;
            this.jumpsLeft--;
        }
    }
    dodge(){
        this.dodging = true;
        this.stillDodging = true;
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
    // potential collision system. Find out the angle of the particle the the center of the player. 
    // do trig to say "okay at this angle you have to be at least ___ distance." If you in that distance then like do da damage
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
            let collision = platform.checkCollisionSquare(this.position.x,this.position.y,this.size.y,this.speed);
            let res = collision.state;
            this.dirBlocked = "none";
            if(res){ // down is positive
                switch(collision.direction){
                    case "bottom":
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
            this.velocity.x = this.speed*-1
        } else {
            //this.velocity.x = 0;
        }
    }
    resetForces(){
        this.forces = [];
    }
    getSendableData(){
        let data = {x:this.position.x,opacity:this.opacity,y:this.position.y,name:this.name,sprite:this.spriteIndex,scale:scaleX};
        return data;
    }
    // apply enemy status defect function or something 
    updatePosition(){
        this.netForce.x = 0;
        this.netForce.y = 0;
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
        let scaledVel = createVector(scaledVelX,scaledVelY);
        this.position.add(scaledVel);
        this.constrainEdges();
    }
}
class Archer extends Character{
    constructor(){
        super();
        this.name = "Archer";
        this.buttonIndex = 0;
        this.mass = .75; 
        this.basehp = 100; //100
        this.basespeed = 7;
        this.basepower = 10; 
        this.baseresistance = 2; 
        this.spriteIndex = 0;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.bodyType = "square";
    }
    show(){
        textSize(35);
        fill(255,255,255);
        text(this.name,this.position.x,this.position.y-this.size.y/1.5);
        textAlign(CENTER, CENTER);
        tint(this.opacity,255);
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);
        tint(255,255);
    }
    sendCharacterData(){
        socket.emit("enemy-char-data",{percentHealth:(this.hp/this.maxHealth),room:roomId});
    }
}
class Ember extends Character{
    constructor(){
        super();
        this.name = "Ember";
        this.buttonIndex = 2;
        this.mass = 1; 
        this.basehp = 125;
        this.basespeed = 5;
        this.basepower = 20; 
        this.baseresistance = 2; 
        this.spriteIndex = 1;
        this.sprite = characterSprites[this.spriteIndex];
        this.ghost = false;
        this.weaponSprite = 0;
        this.hasWeapon = true;
        this.basicAttackFrameCount = 8;
        this.basicAttacking = false;
        for(let i = 0; i < this.basicAttackFrameCount;i++){
            let img = weaponSprites[this.weaponSprite].get(i*40,0,40,40);
            this.basicAnimation.push(img);
        }
        this.bodyType = "square";
        this.fireburst = new FireBurst();
        this.hotstreak = new HotStreak();
    }
    show(){
        textSize(35);
        fill(255,255,255);
        textAlign(CENTER, CENTER);
        text(this.name,this.position.x,this.position.y-this.size.y/1.5);
        tint(this.opacity,255);
        image(this.sprite,this.position.x,this.position.y,128*scaleX,128*scaleY);
        tint(255,255);
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
        rotate(90-angleToCursor);
        if(this.position.x > mouseX){
            scale(1,-1);
        }
        image(this.basicAnimation[this.basicAnimationFrame],0,0,40*scaleX*5,40*scaleY*5);
        pop();
        if(this.basicAttacking){
            if(frameCount % 2 == 0){
                this.sendSquareAttack(this.weaponPos.x,this.weaponPos.y,5,40*scaleX*4,40*scaleY*5,"basic",attackId);
                this.basicAnimationFrame++;
            }
            if(this.basicAnimationFrame == this.basicAttackFrameCount){
                this.basicAnimationFrame = 0;
                this.basicAttacking = false;
            }
        }

        this.updateAbilityOne();
        this.updateAbilityTwo();
    }
    sendCharacterData(){
        let health = this.hp/this.maxHealth
        socket.emit("enemy-char-data",{percentHealth: health,room:roomId});
    }
    executeAbilityOne(){
        if(!this.fireburst.active){
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
        if(!this.hotstreak.active){
            this.hotstreak = new HotStreak();
            this.hotstreak.activate(this.dirBlocked,this.position.x,this.position.y+this.size.y/2);
            this.freeMove = false;
        } else{
            this.freeMove = true;
        }
    }
    updateAbilityTwo(){
        if(this.hotstreak.active){
            console.log("Active Hot Streak");
            console.log(this.hotstreak.duration);
            this.hotstreak.update(this.position.x,this.position.y);
        }
    }
}