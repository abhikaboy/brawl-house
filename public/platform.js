let platforms = [];
class Platform{
    constructor(l,r,t,b,name){
        this.l = l;
        this.r = r;
        this.t = t;
        this.b = b;
        this.width = this.r - this.l;
        this.height = this.b - this.t;
        this.name = name;
        platforms.push(this);
    }
    checkCollisionSquare(x,y,size,speed){
        let collision = new Collision();
        collision.set("none",false);
        // > means below < means above 
        // bottom is below the top, top is above the top
        if(y+size/2 > this.t && y-size/2 <= this.t){ // if the bottom is below the top say we collide and above the bottom
            if(x+size/2 > this.l && x-size/2 < this.r){
                collision.set("bottom",true);
            }
        } else if(y-size/2 < this.b && y+size/2 > this.b){ // if the top is above the bottom say we collide AND below the top 
            if(x+size/2 > this.l && x-size/2 < this.r){
                collision.set("top",true);
            }
        } 
        if(x+size/2 > this.l && x-size/2 < this.l-size+speed && y+size/2 > this.t && y-size/2 <= this.t){ // if the right is more right than the left say we collide
            collision.set("right",true);
        } else if(x-size/2 < this.r && x+size/2 > this.r+size-speed && y+size/2 > this.t && y-size/2 <= this.t){
            collision.set("left",true);
        }
        return collision;
    }
    checkCollisionCircle(x,y,size,velocity){
        
    }
}
let floor = new Platform(0,screen.width,screen.height*.9,screen.height+500,"Floor");
let leftPlat = new Platform(0.1*screen.width,0.4125*screen.width,screen.height*.55,screen.height*.64,"Left");
let rightPlat = new Platform(0.58125*screen.width,0.89675*screen.width,screen.height*.55,screen.height*.64,"Right");
let topPlat = new Platform(0.348*screen.width,0.646*screen.width,screen.height*0.256,screen.height*0.344,"Top");