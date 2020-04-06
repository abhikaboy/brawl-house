class Slider{
    constructor(x,y,width,height,capacity,color,label){
        this.hovering = false;
        this.value = 0;
        this.position = createVector(x,y);
        this.capacity = capacity;
        this.width = width;
        this.height = height;
        this.color = color;
        this.label = label;
    }
    show(){
        noStroke();
        fill(239);
        rect(this.position.x,this.position.y,this.width,this.height,50);
        let percentFull = this.value/this.capacity;
        colorMode(HSB,100);
        fill(this.color.h,this.color.s,this.color.b);
        rect(this.position.x,this.position.y,this.width*percentFull,this.height,50);
        ellipse(this.position.x+(this.width*percentFull),this.position.y+this.height/2,this.height*2,this.height*2);
        colorMode(RGB,255);
        textSize(35);
        text(this.value,this.position.x-50,this.position.y+this.height/2);
        textAlign(LEFT,CENTER);
        text(this.label,this.position.x+20+this.width,this.position.y+this.height/2);
        textAlign(CENTER,CENTER);
    }
    update(){
        this.hovering = (mouseX > this.position.x && mouseX < this.position.x + this.width && mouseY < this.position.y +this.height && mouseY > this.position.y) ? true:false;
        if(this.hovering && mouseIsPressed){
            let unitsIn = mouseX - this.position.x;
            this.value = Math.round((unitsIn/this.width)*this.capacity);
        }
    }
}