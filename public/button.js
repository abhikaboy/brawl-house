let buttons = [];
class Button{
    constructor(l,r,t,b,func){
        this.left = l;
        this.right = r;
        this.top = t;
        this.bottom = b;
        this.hovering;
        this.func = func;
        this.clickedBefore = false;
        buttons.push(this);
    }
    checkHover(){
        this.hovering = (mouseX > this.left && mouseX < this.right && mouseY < this.bottom && mouseY > this.top) ? true:false;
    }
    clicked(){
        if(mouseIsPressed && this.hovering && this.clickedBefore == false){
            this.func();
            this.clickedBefore = true;
        } else if(!mouseIsPressed || !this.hovering){
            this.clickedBefore = false;
        }
    }
}
let resetButtons = function(){
    buttons = [];
    selectors = [];
}
//270