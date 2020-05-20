let projectiles = [];
class Projectile{
    constructor(x,y,dir,radius,size){
        this.position = createVector(x,y);
        this.velocity = dir;
        this.acceleration = createVector(0,0); 
        this.size = size;
        this.sprite;
        this.name;
        this.statusEffect;
        this.attackId;
        this.dmg;
        this.radius = radius;

        this.animation;
        this.animationFrame = 0;
        this.animationFrameCount = 8; 
        this.knockback = true;
        
        projectiles.push(this);

    }
    updatePosition(){
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
    }
    sendSquareAttack(attackId){
        console.log("sending a square attack");
        if(random() > 0.2 && this.name == "Fireball"){
            socket.emit("new-square-attack",{x:this.position.x,y:this.position.y,dmg:this.dmg,scaleX:scaleX, scaleY:scaleY,
                sizeX:this.size.x,sizeY:this.size.y,type:this.statusEffect,room:roomId,attackId:attackId,knockback:this.knockback});
        } else {
            socket.emit("new-square-attack",{x:this.position.x,y:this.position.y,dmg:this.dmg,scaleX:scaleX, scaleY:scaleY,
                sizeX:this.size.x,sizeY:this.size.y,type:this.statusEffect,room:roomId,attackId:attackId});           
        }
    }
    sendCircleAttack(attackId){
        if(random() > 0.5){
            socket.emit("new-circle-attack",{x:this.position.x,y:this.position.y,dmg:this.dmg,scaleX:scaleX, scaleY:scaleY,
                radius:this.radius,type:this.statusEffect,room:roomId,attackId:attackId});
        }
    }
    show(){

    }
    update(){

    }
    finished(){

    }
}
class Arrow extends Projectile{
    constructor(x,y,dir,dmg){
        super();
        this.position = createVector(x,y);
        this.castLocation = createVector(x,y);
        this.velocity = dir;
        this.acceleration = createVector(0,0.8);
        this.name = "Arrow";
        attackId++;
        this.attackId = attackId;
        this.dmg = dmg;
        this.size = createVector(26*5,8*5);
        this.duration = 1;
        this.active;
        this.rotation;
        this.flip;
        this.active = true;
    }
    show(){
        let hypotenuse = Math.pow(Math.pow(this.velocity.x,2) + Math.pow(this.velocity.y,2),0.5);
        let angle;
        if(hypotenuse != 0){
            angle = (this.position.y > this.castLocation.y) ? -asin(this.velocity.x / hypotenuse)-180:asin(this.velocity.x / hypotenuse);
        }
        this.rotation = 90+angle;
        push();
        translate(this.position.x,this.position.y);
        rotate(this.rotation);
        scale(-1,1);
        image(arrow,0,0,this.size.x*scaleX,this.size.y*scaleY);
        pop();
    }
    update(){
        if(this.active){
            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);
            this.show();
            this.sendSquareAttack(this.attackId);
            for(let i = 0; i < platforms.length; i++){
                let collision = platforms[i].checkCollisionSquare(this.position.x,this.position.y,this.size,this.velocity.x);
                if(collision.state){
                    this.duration = 0;
                    this.active = false;
                    projectiles.splice(projectiles.indexOf(this));
                }
            }
        }
    }
    getSendableData(){
        let data = {x:this.position.x, y:this.position.y,width:this.size.x,height:this.size.y,name:this.name,scaleX:scaleX,scaleY:scaleY
        ,flip:this.flip,rotation:this.rotation,castX: this.castLocation.x,castY: this.castLocation.y};
        return data;
    }
    decay(){
        setTimeout(() => {
            this.duration -= 0.1;
            if(this.duration <= 0){
                this.active = false;
                projectiles.splice(projectiles.indexOf(this));
            } else {
                this.decay();
            }
        },100)
    }
}
class ArtemisArrow extends Arrow{
    update(){
        if(this.active){
            this.position.add(this.velocity);
            this.show();
            this.sendSquareAttack(this.attackId);
        }
    }    
}
class FireBall extends Projectile{
    constructor(x,y,dir,radius,size,dmg){
        super();
        this.position = createVector(x,y);
        this.velocity = dir;
        this.acceleration = createVector(0,0); 
        this.size = size;
        this.name;
        this.radius = radius;
        this.acceleration = createVector(0,0); 
        this.statusEffect = "burn";
        this.name = "Fireball";
        attackId++;
        this.attackId = attackId;
        this.alpha = 255;
        this.dmg = dmg;
        this.r = random(100,255);
        this.g = random(20);
        this.b = 0
        
    }
    show(){
        fill(this.r,this.g,this.b,this.alpha);
        ellipse(this.position.x,this.position.y,this.radius*2,this.radius*2);
        this.alpha -= 13;
    }
    update(){
        this.updatePosition();
        this.show();
        this.sendSquareAttack(this.attackId);
    }
    finished(){
        return (this.alpha <= 10);
    }
    getSendableData(){
        let data = {r:this.r,g:this.g,b:this.b,alpha:this.alpha,x:this.position.x,
            y:this.position.y,radius:this.radius,name:this.name,scaleX:scaleX,scaleY:scaleY};
        return data;
    }
}
class GrappleHook extends Projectile{
    constructor(x,y,dir){
        super();
        this.attached = false;
        this.position = createVector(x,y);
        this.castLocation = createVector(x,y);
        this.velocity = dir;
        this.velocity.mult(40);
        this.acceleration = createVector(0,0);
        this.name = "Grapple";
        this.attackId = 0;
        this.dmg = 0;
        this.size = createVector(64,64); // figure this out later
        this.duration = 3;
        this.rotation;
        this.flip;
        this.active = true;
        this.spliced = false;
    }
    getSendableData(){
        let data = {x:this.position.x, y:this.position.y,width:this.size.x,height:this.size.y,name:this.name,scaleX:scaleX,scaleY:scaleY
            ,flip:this.flip,rotation:this.rotation,castX: this.castLocation.x,castY: this.castLocation.y,charX:character.position.x,charY:character.position.y};
            return data;
    }
    show(){
        let hypotenuse = Math.pow(Math.pow(this.velocity.x,2) + Math.pow(this.velocity.y,2),0.5);
        let angle;
        if(hypotenuse != 0){
            angle = (this.position.y > this.castLocation.y) ? -asin(this.velocity.x / hypotenuse)-180:asin(this.velocity.x / hypotenuse);
        }
        this.rotation = 90+angle;
        push();
        translate(this.position.x,this.position.y);
        rotate(this.rotation);
        scale(-1,1);
        image(hook,0,0,this.size.x*scaleX,this.size.y*scaleY);
        pop();
        stroke(255);
        strokeWeight(3);
        line(character.position.x,character.position.y,this.position.x,this.position.y);
        noStroke();
    }
    update(){
        if(this.active){
            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);
            this.show();
            for(let i = 0; i < platforms.length; i++){
                let collision = platforms[i].checkCollisionSquare(this.position.x,this.position.y,this.size,this.velocity.x);
                if(collision.state){
                    this.latch();
                }
            }
        }
        else{
            this.kill();
        }
    }
    kill(){
        if(!this.spliced){
            projectiles.splice(projectiles.indexOf(this),1);
            this.splice = true;
        }
    }
    latch(){
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);
        this.attached = true; 
    }
    getForce(){
        let deltaX = this.castLocation.x - this.position.x;
        let deltaY = this.castLocation.y - this.position.y;
        let forceVector = createVector(-deltaX,-deltaY);
        forceVector.normalize();
        forceVector.mult(4);
        forceVector.y *= 1.1;
        console.log(forceVector);
        return forceVector;
    }
    decay(){
        setTimeout(()=>{
            this.duration -= 0.25;
            if(this.duration <= 0){
                this.active = false;
            } else {
                this.decay();
            }
        },250)
    }
}
class LifeSteal extends Projectile{
    constructor(x,y,radius,size,dmg){
        super();
        this.position = createVector(x,y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0); 
        this.size = size;
        this.name;
        this.radius = radius;
        this.acceleration = createVector(0,0); 
        this.statusEffect = "Lifesteal";
        this.name = "Lifesteal";
        attackId++;
        this.attackId = attackId;
        this.alpha = 255;
        this.dmg = dmg;
        this.r = random(20);
        this.g = random(255);
        this.b = random(0,100);
    }
    show(){
        fill(this.r,this.g,this.b,this.alpha);
        ellipse(this.position.x,this.position.y,this.radius*2,this.radius*2);
        this.radius *= 0.96;
        this.alpha -= 10;
    }
    update(){
        //this.updatePosition();
        this.position.x = character.position.x;
        this.position.y = character.position.y;
        this.show();
        this.sendSquareAttack(this.attackId);
    }
    finished(){
        return (this.alpha <= 10);
    }
    getSendableData(){
        let data = {r:this.r,g:this.g,b:this.b,alpha:this.alpha,x:this.position.x,
            y:this.position.y,radius:this.radius,name:this.name,scaleX:scaleX,scaleY:scaleY};
        return data;
    }
}
class WindAttack extends Projectile{
    constructor(x,y,dir,dmg){
        super();
        this.position = createVector(x,y);
        this.castLocation = createVector(x,y);
        this.velocity = dir;
        this.name = "WindSlice";
        attackId++;
        this.attackId = attackId;
        console.log("Wind Attack ID " + this.attackId);
        this.dmg = dmg;
        this.size = createVector(160,160);
        this.duration = 0.5;
        this.active;
        this.rotation;
        this.flip;
        this.active = true;
        this.checkPlatforms = true;
        this.sprite = windSlice;
    }    
    show(){
        let hypotenuse = Math.pow(Math.pow(this.velocity.x,2) + Math.pow(this.velocity.y,2),0.5);
        let angle;
        if(hypotenuse != 0){
            angle = (this.position.y > this.castLocation.y) ? -asin(this.velocity.x / hypotenuse)-180:asin(this.velocity.x / hypotenuse);
        }
        this.rotation = 90+angle;
        push();     
        translate(this.position.x,this.position.y);
        rotate(this.rotation);
        scale(-1,1);
        image(this.sprite,0,0,this.size.x*scaleX,this.size.y*scaleY);
        pop();
    }
    powerup(){
        this.dmg += 1;
        this.sprite = blueWindSlice;
        this.velocity.mult(1.5);
    }
    update(){
        if(this.active){
            this.sendSquareAttack(this.attackId);
            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);
            this.show();
            let fakesizeX = this.size.x/4;
            let fakesizeY = this.size.y/4;
            let fakeSize = createVector(fakesizeX,fakesizeY);
            if(this.checkPlatforms){
                for(let i = 0; i < platforms.length; i++){
                    let collision = platforms[i].checkCollisionSquare(this.position.x,this.position.y,fakeSize,this.velocity.x);
                    if(collision.state){
                        this.duration = 0;
                        this.active = false;
                        projectiles.splice(projectiles.indexOf(this));
                    }
                }
            }
        }
    }
    getSendableData(){
        let data = {x:this.position.x, y:this.position.y,width:this.size.x,height:this.size.y,name:this.name,scaleX:scaleX,scaleY:scaleY
        ,flip:this.flip,rotation:this.rotation,castX: this.castLocation.x,castY: this.castLocation.y};
        return data;
    }
    decay(){
        setTimeout(() => {
            this.duration -= 0.25;
            if(this.duration <= 0){
                this.active = false;
                projectiles.splice(projectiles.indexOf(this));
            } else {
                this.decay();
            }
        },250)
    }
}
class InvisbleAttack extends Projectile{
    constructor(dmg){
        super();
        this.position = character.position;
        this.castLocation;
        this.velocity;
        this.name = "Invisible";
        attackId++;
        this.attackId = attackId;
        this.dmg = dmg;
        this.size = createVector(128*scaleX,128*scaleX);
        this.duration = 1;
        this.active;
        this.rotation;
        this.flip;
        this.active = true;
    }    
    show(){
        //shouldn't happen
    }
    getSendableData(){
        let data = {x:this.position.x, y:this.position.y,width:this.size.x,height:this.size.y,name:this.name,scaleX:scaleX,scaleY:scaleY
        ,flip:this.flip,rotation:this.rotation};
        return data;
    }
    die(){
        this.active = false;
        projectiles.splice(projectiles.indexOf(this));
    }
    update(){
        if(this.active){
            this.position = character.position;
            this.sendSquareAttack(this.attackId);
        }
    }
}
class Fire{
    constructor(x,y,duration,dmg){
        this.position = createVector(x,y);
        this.velocity = createVector(random(-2,2),random(-10,-20));
        this.fballSzie = createVector(20,20);
        this.fireballs = [];
        this.duration = duration;
        this.dmg = dmg;
        this.alive = true;
    }
    burn(){
        if(random() > 0.8){
            this.fireballs[this.fireballs.length] = new FireBall(this.position.x + random(-40,40),this.position.y,this.velocity,10,this.fballSzie,this.dmg);
        }
    }
    update(){

        if(this.alive){
            this.burn();
            for(let i = 0; i < this.fireballs.length; i++){
                let current = this.fireballs[i];
                current.update();
                if(current.finished()){
                    projectiles.splice(projectiles.indexOf(this.fireballs[i]));
                    this.fireballs.splice(i,1);
                }
            }
        }
    }
    die(){ 
        for(let i = 0; i < this.fireballs.length; i++){
            projectiles.splice(projectiles.indexOf(this.fireballs[i]));    
            this.fireballs.splice(i,1);    
        }
    }
    decay(){
        setTimeout(() => {
            if(this.duration > 0){
                this.duration -= 0.25;
                this.decay();
            } else {
                this.alive = false;
                this.die();
            }
        },250)
    }
}