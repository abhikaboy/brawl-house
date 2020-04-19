  
let particles = [];
class Particle { 
        constructor(x,y,dir){
            this.pos = createVector(x,y);
            this.dir = dir;
            if(this.dir == "right"){
              this.vel = createVector(random(0,10),random(0,1));
            } else if(this.dir == "down"){
              this.vel = createVector(random(0,1),random(0,10));
            } else if(this.dir == "up"){
              this.vel = createVector(random(0,1),random(0,-10));
            } else if(this.dir == "left"){
              this.vel = createVector(random(0,-10),random(0,1));
            } else if(this.dir == "up-left"){
              this.vel = createVector(random(-0,3),random(0,-20));
            }
            this.alpha = 255;
            this.size = 20;
            this.deathRate = 5;
        }
        show() {
            blendMode(SCREEN);
            fill(random(150),random(100),random(255),this.alpha);
            ellipse(this.pos.x,this.pos.y,this.size,this.size);
            blendMode(BLEND);
        }
        update(){
            this.pos.add(this.vel); 
            this.alpha -= this.deathRate;
        }
          finished() {
            return this.alpha < 0;
          }

    }
let particleHandle = function(item,index,array){
    particles[index].show();
    particles[index].update();
    if (particles[index].finished()) {
      // remove this particle
      particles.splice(index, 1);
    }    
}