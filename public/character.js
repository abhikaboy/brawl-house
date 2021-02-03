let character;
let characterSprites = [];
let characterNames = ["Archer", "Ember", "Shadow", "Necromancer", "Valor"];
let graves = [];
let entities = [];
let isCharacterSelected = false;
let attackId = 0;
let baseJump = -13.25;
let idealTime = 16.6667;
class Character {
	constructor() {
		this.mass;
		this.acceleration = createVector(0, 0);
		this.velocity = createVector(0, 0);
		this.velocities = [];
		this.position = createVector(200, 0);
		this.forces = [];
		this.netForce = createVector(0, 0);
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
		this.size = createVector(128 * scaleX, 128 * scaleY);
		this.ghost;
		this.moveright;
		this.moveleft;
		this.staminaRegenAmount = 5;

		this.removeYVelPos;
		this.removeYVelNeg;
		this.removeXVelPos;
		this.removeXVelNeg;

		this.dirBlocked;
		this.jumpPower = baseJump * 2;
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
		this.weaponPos = createVector(0, 0);
		this.weaponSpriteSize;

		this.attacksRecieved = [];
		this.bodyType;
		this.weaponRotation;
		this.grappling = false;
		this.lastPlatformHit;
		this.lookingForLastPlatform = false;

		this.dead = false;
		this.graveDropChance = 1;
		this.knockbackForces = [];

		this.stamina = 100;
		this.startStaminaRegen();
	}
	die() {
		entities.splice(entities.indexOf(this), 1);
		if (this.name == "Skeleton") {
			if (random() < this.graveDropChance) {
				graves[graves.length] = new Grave(
					this.position.x,
					this.position.y,
					this.name,
				);
				entities.push(graves[graves.length - 1]);
			}
		}
	}
	applyStatusEffect(effect) {
		if (effect != "basic" && effect != "none") {
			this.statusEffects.push(effect);
		}
	}
	basicAttack() {
		//"doing the basic attack!");
		if (this.basicAttacking == false && this.stamina >= 35) {
			this.basicAttacking = true;
			attackId++;
			this.stamina -= 35;
		}
	}

	takeDamage(dmg) {
		if (!this.stillDodging) {
			let realDmg = (1 - this.resistance / 100) * dmg;
			realDmg = realDmg.toFixed(1);
			this.hp -= realDmg;
			socket.emit("damage-marker", {
				x: this.position.x + random(-this.size.x, this.size.x),
				y: this.position.y + random(-this.size.y, 0),
				dmg: realDmg,
				room: roomId,
				scaleX: scaleX,
				scaleY: scaleY,
				alpha: 255,
			});
		} else {
			console.log("DODGED!!!!!");
		}
	}
	heal(amount) {
		this.hp += amount;
		consol.log("HEALING");
	}
	processSquareAttack(
		x,
		y,
		dmg,
		enemyScaleX,
		enemyScaleY,
		sizeX,
		sizeY,
		type,
		atckId,
	) {
		let scaleFactorX = scaleX / enemyScaleX;
		let scaleFactorY = scaleY / enemyScaleY;
		if (this.attacksRecieved.includes(atckId)) {
		} else {
			let result = this.detectAttackRecievedSqaure(
				x,
				y,
				scaleFactorX,
				scaleFactorY,
				sizeX,
				sizeY,
			);
			if (result) {
				this.takeDamage(dmg);
				this.addKnockback(
					this.calculateKnockback(
						x * scaleFactorX,
						y * scaleFactorY,
						dmg,
						this.position.x,
						this.position.y,
					),
				);
				if (type == "Lifesteal") {
					socket.emit("enemy-heal", { amount: dmg, room: roomId });
				} else if (type == "Bat Lifesteal") {
					socket.emit("bat-heal", { amount: dmg / 2, room: roomId });
				} else {
					this.applyStatusEffect(type);
				}
				this.attacksRecieved.push(atckId);
			}
		}
	}
	processCircleAttack(
		radius,
		dmg,
		x,
		y,
		enemyScaleX,
		enemyScaleY,
		type,
		atckID,
	) {
		let scaleFactorX = scaleX / enemyScaleX;
		let scaleFactorY = scaleY / enemyScaleY;
		// push attack id into attacks recieved
		if (this.attacksRecieved.includes(atckID)) {
			//"we already got this attack!");
		} else {
			let result = this.detectAttackRecievedCircle(
				x,
				y,
				scaleFactorX,
				scaleFactorY,
				radius,
			);
			if (result) {
				this.takeDamage(dmg);
				this.applyStatusEffect(type);
				this.attacksRecieved.push(atckID);
			}
		}
	}
	sendSquareAttack(x, y, dmg, sizeX, sizeY, type, attackId, knockback) {
		console.log("SENDING A SQUARE ATTACK");
		socket.emit("new-square-attack", {
			x: x,
			y: y,
			dmg: dmg,
			scaleX: scaleX,
			scaleY: scaleY,
			sizeX: sizeX,
			sizeY: sizeY,
			type: type,
			room: roomId,
			attackId: attackId,
			knockback: knockback,
		});
	}
	sendCircleAttack(radius, dmg, x, y, type, atkId) {
		socket.emit("new-circle-attack", {
			x: x,
			y: y,
			dmg: dmg,
			scaleX: scaleX,
			scaleY: scaleY,
			radius: radius,
			type: type,
			room: roomId,
			attackId: atkId,
		});
	}
	detectAttackRecievedSqaure(x, y, scaleFactorX, scaleFactorY, sizeX, sizeY) {
		x = x * scaleFactorX;
		y = y * scaleFactorY;
		let rightIncomming = x + sizeX / 2;
		let leftIncomming = x - sizeX / 2;
		let topIncomming = y - sizeY / 2;
		let bottomIncomming = y + sizeY / 2;

		let rightBody = this.position.x + this.size.x / 2;
		let leftBody = this.position.x - this.size.x / 2;
		let topBody = this.position.y - this.size.y / 2;
		let bottomBody = this.position.y + this.size.y / 2;

		if (
			rightIncomming > leftBody &&
			leftIncomming < rightBody &&
			topIncomming < topBody &&
			bottomIncomming > topBody
		) {
			return true;
		} else if (
			leftIncomming < rightBody &&
			rightIncomming > leftBody &&
			topIncomming < topBody &&
			bottomIncomming > topBody
		) {
			return true;
		} else if (
			topIncomming < topBody &&
			bottomIncomming > topBody &&
			rightIncomming > leftBody &&
			leftIncomming < rightBody
		) {
			return true;
		} else if (
			topIncomming < bottomBody &&
			bottomIncomming > bottomBody &&
			rightIncomming > leftBody &&
			leftIncomming < rightBody
		) {
			return true;
		} else if (
			x > leftBody &&
			x < rightBody &&
			y < bottomBody &&
			y > topBody
		) {
			return true;
		} else {
			return false;
		}
	}
	detectAttackRecievedCircle(x, y, scaleFactorX, scaleFactorY, radius) {
		x = x * scaleFactorX;
		y = y * scaleFactorY;
		let distance = dist(x, y, this.position.x, this.position.y);
		if (distance + radius <= this.size.x) {
			return true;
		} else if (distance - radius <= this.size.x) {
			return true;
		} else {
			return false;
		}
	}

	show() {}
	applyFriction() {
		if (this.velocity.x >= -1 || this.velocity.x <= 1) {
			if (
				this.dirBlocked == "only negative Y" ||
				this.dirBlocked == "only positive Y" ||
				this.dirBlocked == "none"
			) {
				let friction = this.friction;
				if (this.velocity.x > 0) {
					friction = this.friction * -1;
				} else {
					friction = this.friction;
				}
				if (this.velocity.x >= -1 && this.velocity.x <= 1) {
					this.velocity.x = 0;
					friction = 0;
				}
				let frictionVector = createVector(friction * this.mass, 0);
				this.applyForce(frictionVector);
			}
		}
	}
	jump() {
		if (this.jumpsLeft > 0 && !this.grappling && this.stamina >= 20) {
			this.velocity.y = this.jumpPower;
			this.jumpsLeft--;
			this.stamina -= 15;
		}
	}
	dodge() {
		if (!this.grappling && this.stamina >= 50) {
			this.dodging = true;
			this.stillDodging = true;
			this.stamina -= 50;
		}
	}
	startStaminaRegen() {
		setTimeout(() => {
			this.stamina += this.staminaRegenAmount;
			this.stamina = constrain(this.stamina, 0, 100);
			this.startStaminaRegen();
		}, 125);
	}
	checkPlatformCollisions(platform) {
		let collided = platform.checkCollisionSquare();
		if (collided) {
			this.applyForce(platform.getReturnForce);
		}
	}
	parseStats(hp, speed, power, resistance) {
		let ret = [];
		ret.push(hp);
		ret.push(speed / 15);
		ret.push(power / 4);
		ret.push(resistance / 2.5);
		return ret;
	}
	setStats(stats) {
		this.hp = this.basehp + stats[0];
		this.maxHealth = this.hp;
		this.speed = this.basespeed + stats[1];
		this.power = this.basepower + stats[2];
		this.resistance = this.baseresistance + stats[3];
	}
	sendDamagePacket(dmg, type) {
		socket.emit("damagePacket", { damage: dmg, type: type });
	}
	addVelocity(newVelocity) {
		this.velocities.push(newVelocity);
	}
	applyForce(force) {
		this.forces.push(force);
	}
	calculateKnockback(x, y, dmg, posx, posy) {
		let deltaX = x - posx;
		let deltaY = y - posy;
		let forceVector = createVector(-deltaX, -deltaY);
		forceVector.normalize();
		forceVector.mult(
			Math.pow(dmg + 1, 0.5) /
				Math.pow(this.knockbackForces.length + 1, 3),
		);
		console.log(forceVector);
		return forceVector;
	}
	addKnockback(force) {
		this.knockbackForces.push(force);
		setTimeout(() => {
			this.knockbackForces.splice(this.knockbackForces.indexOf(force), 1);
		}, 500);
	}
	applyKnockback() {
		for (let i = 0; i < this.knockbackForces.length; i++) {
			this.applyForce(this.knockbackForces[i]);
			console.log("APPLYING A FORCE");
		}
	}
	constrainEdges() {
		this.position.x = constrain(
			this.position.x,
			this.size.x / 2,
			screen.width - this.size.x / 2,
		);
		this.position.y = constrain(
			this.position.y,
			this.size.y / 2,
			screen.height + this.size.y / 2,
		);
	}
	exertForce(angle) {
		let exertedForce = createVector(
			this.netForce.x * sin(angle),
			this.netForce.y * cos(angle),
		);
		return exertedForce;
	}
	collisionHandle(platforms) {
		for (let i = 0; i < platforms.length; i++) {
			let platform = platforms[i];
			let collision = platform.checkCollisionSquare(
				this.position.x,
				this.position.y,
				this.size,
				this.speed,
			);
			let res = collision.state;
			this.dirBlocked = "none";
			if (res) {
				// down is positive
				if (
					platform.name != "Floor" &&
					collision.direction != "bottom" &&
					this.lookingForLastPlatform
				) {
					this.lastPlatformHit = platform;
				}
				switch (collision.direction) {
					case "bottom":
						this.dirBlocked = "only negative Y";
						this.jumpsLeft = this.maxJumps;
						break;
					case "within":
						this.dirBlocked = "only negative Y";
						this.jumpsLeft = this.maxJumps;
						break;
					case "top":
						this.dirBlocked = "only positive Y";
						break;
					case "left":
						this.dirBlocked = "only positive X";
						this.jumpsLeft = this.maxJumps;
						break;
					case "right":
						this.dirBlocked = "only negative X";
						this.jumpsLeft = this.maxJumps;
						break;
				}
				break;
			}
		}
	}
	clearVelocities() {
		this.velocities = [];
	}
	moveHandle() {
		if (this.moveright) {
			this.velocity.x = this.speed;
		} else if (this.moveleft) {
			this.velocity.x = this.speed * -1;
		} else {
			//this.velocity.x = 0;
		}
	}
	resetForces() {
		this.forces = [];
	}
	getSendableData() {
		let flipWeapon = this.position.x > mouseX ? true : false;
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			sprite: this.spriteIndex,
			scale: scaleX,
			weaponSprite: this.weaponSprite,
			animationFrame: this.weaponAnimationFrame,
			weaponPosX: this.weaponPos.x,
			weaponPosY: this.weaponPos.y,
			flipWeapon: flipWeapon,
			weaponRotation: this.weaponRotation,
			weaponSpriteSize: this.weaponSpriteSize,
		};
		return data;
	}
	actualWeaponDraw() {}
	drawWeapon(animation) {
		// find the opposite, find the y to calculate the hypotenuse
		let deltaX = mouseX - this.position.x;
		let deltaY = this.position.y - mouseY;
		let hypotenuse = Math.pow(
			Math.pow(deltaX, 2) + Math.pow(deltaY, 2),
			0.5,
		);
		let angleToCursor;
		if (hypotenuse != 0) {
			angleToCursor =
				this.position.y > mouseY
					? -asin(deltaX / hypotenuse) - 180
					: asin(deltaX / hypotenuse);
		}
		push();
		deltaX = constrain(deltaX, this.size.x / -2, this.size.x / 2);
		deltaY = constrain(deltaY, this.size.y / -2, this.size.x / 2);
		this.weaponPos = createVector(
			this.position.x + deltaX,
			this.position.y + deltaY * -1,
		);
		translate(this.weaponPos.x, this.weaponPos.y);
		this.weaponRotation = 90 - angleToCursor;
		rotate(this.weaponRotation);
		if (this.position.x > mouseX) {
			scale(1, -1);
		}
		image(
			animation[this.weaponAnimationFrame],
			0,
			0,
			this.weaponSpriteSize * scaleX,
			this.weaponSpriteSize * scaleY,
		);

		pop();
	}
	basicAttackHandle() {
		if (this.basicAttacking) {
			if (frameCount % 2 == 0) {
				this.sendSquareAttack(
					this.weaponPos.x,
					this.weaponPos.y,
					5,
					this.weaponSpriteSize * scaleX * 0.8,
					this.weaponSpriteSize * scaleY,
					"basic",
					attackId,
					true,
				);
				this.weaponAnimationFrame++;
			}
			if (this.weaponAnimationFrame == this.basicAttackFrameCount) {
				this.weaponAnimationFrame = 0;
				this.basicAttacking = false;
			}
		}
	}
	drawName() {
		textSize(35);
		fill(255, 255, 255);
		textAlign(CENTER, CENTER);
		text(this.name, this.position.x, this.position.y - this.size.y / 1.5);
		rectMode(CORNER);
		fill(52);
		rect(
			this.position.x - this.size.x / 2,
			this.position.y - this.size.y,
			this.size.x,
			20,
		);
		fill(0, 255, 0);
		rect(
			this.position.x - this.size.x / 2,
			this.position.y - this.size.y,
			this.size.x * (this.stamina / 100),
			20,
		);
		fill(255);
		//text(this.stamina,this.position.x,this.position.y-this.size.y);
	}
	grappleHandle() {}
	characterVelocityChange() {}
	// apply enemy status defect function or something
	updatePosition() {
		this.netForce.x = 0;
		this.netForce.y = 0;
		this.grappleHandle();
		this.applyKnockback();
		this.applyFriction();
		for (let i = 0; i < this.forces.length; i++) {
			this.netForce.add(this.forces[i]);
		}
		if (this.freeMove) {
			this.moveHandle();
		}
		for (let i = 0; i < this.velocities.length; i++) {
			this.velocity.add(this.velocities[i]);
		}
		this.velocities = [];
		this.acceleration = createVector(
			this.netForce.x / this.mass,
			this.netForce.y / this.mass,
		);
		if (this.dodging) {
			let direction = mouseX > this.position.x ? 1 : -1;
			this.velocity.x = 30.25 * direction;
			this.dodging = false;
			this.freeMove = false;
			this.opacity = 200;
		}
		this.characterVelocityChange();
		this.velocity.add(this.acceleration);
		if (this.stillDodging && this.velocity.x > -7 && this.velocity.x < 7) {
			this.stillDodging = false;
			this.freeMove = true;
			this.opacity = 255;
		}
		if (this.dirBlocked != "none") {
			switch (this.dirBlocked) {
				case "only negative Y":
					if (this.velocity.y > 0) {
						this.velocity.y = 0;
					}
					break;
				case "only positive Y":
					if (this.velocity.y < 0) {
						this.velocity.y = 0;
					}
					break;
				case "only negative X":
					if (this.velocity.x > 0) {
						this.velocity.x = 0;
					}
					//this.velocity.y = 0;
					break;
				case "only positive X":
					if (this.velocity.x < 0) {
						this.velocity.x = 0;
					}
					//this.velocity.y = 0;
					break;
			}
		}
		let scaledVelX = this.velocity.x * scaleX;
		let scaledVelY = this.velocity.y * scaleY;
		let finalVel = createVector(scaledVelX, scaledVelY);
		this.position.add(finalVel);
		this.constrainEdges();
		if (this.dead) {
			this.die();
		}
	}
}

class Skeleton extends Character {
	constructor(x, y) {
		super();
		this.position = createVector(x, y);
		this.name = "Skeleton";
		this.mass = 1;
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
		this.jumpPower = -26;
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
	withinRange(value, target, tolerance) {
		if (value > target - tolerance && value < target + tolerance) {
			return true;
		} else {
			return false;
		}
	}
	basicAttack() {
		//"doing the basic attack!");
		if (this.basicAttacking == false && this.stamina > 35) {
			this.currentFrame = 0;
			this.basicAttacking = true;
			attackId++;
			this.stamina -= 35;
		}
	}
	basicAttackHandle() {
		if (this.basicAttacking) {
			if (frameCount % 2 == 0) {
				this.sendSquareAttack(
					this.position.x,
					this.position.y,
					this.damage,
					this.weaponSpriteSize * scaleX * 0.8,
					this.weaponSpriteSize * scaleY,
					"basic",
					attackId,
					true,
				);
				this.currentFrame++;
			}
			if (this.currentFrame == this.basicAttackFrameCount) {
				this.currentFrame = 0;
				this.basicAttacking = false;
			}
		}
	}
	setJumpDelay() {
		setTimeout(() => {
			this.canJump = true;
		}, this.jumpDelay);
	}
	goToEnemy() {
		let enemy = enemyEntities[0];
		let toTheLeft = this.position.x < enemy.x ? true : false;
		let withinX = this.withinRange(this.position.x, enemy.x, 50);
		if (toTheLeft) {
			this.moveright = true;
			this.moveleft = false;
			//"moving right");
		} else if (withinX) {
			this.moveright = false;
			this.moveleft = false;
			//"Within X");
		} else {
			this.moveright = false;
			this.moveleft = true;
			//"moving left");
		}
	}
	pathfind() {
		let enemyLevel;
		let currentLevel;
		let enemy = enemyEntities[0];

		let toTheLeft = this.position.x < enemy.x ? true : false;
		let withinX = this.withinRange(this.position.x, enemy.x, 50);

		if (enemy.y > middleBottom) {
			enemyLevel = "Bottom";
		} else if (enemy.y > upperBottom) {
			enemyLevel = "Middle";
		} else {
			enemyLevel = "Top";
		}
		if (this.position.y > middleBottom) {
			currentLevel = "Bottom";
		} else if (this.position.y > upperBottom) {
			currentLevel = "Middle";
		} else {
			currentLevel = "Top";
		}
		if (currentLevel == enemyLevel && enemyLevel == "Bottom") {
			this.goToEnemy();
		} else if (enemyLevel == "Bottom") {
			if (currentLevel == "Top") {
				if (this.position.x > screen.width / 2) {
					this.moveright = true;
					this.moveleft = false;
				} else {
					this.moveleft = true;
					this.moveright = false;
				}
			} else {
				let platformMiddle = 0.58125 * screen.width;
				if (this.position.x > screen.width / 2) {
					let platformWidth =
						0.4125 * screen.width - 0.1 * screen.width;
					if (
						this.position.x <
						0.58125 * screen.width + platformWidth / 2
					) {
						this.moveleft = true;
						this.moveright = false;
					} else {
						this.moveleft = false;
						this.moveright = true;
					}
					// on right platform
				} else {
					// on left platform
					let platformWidth =
						0.4125 * screen.width - 0.1 * screen.width;
					if (
						this.position.x <
						0.1 * screen.width + platformWidth / 2
					) {
						this.moveleft = true;
						this.moveright = false;
					} else {
						this.moveleft = false;
						this.moveright = true;
					}
				}
			}
		}
		if (currentLevel == enemyLevel && enemyLevel == "Middle") {
			// if both of us are on the left or right platform just like go to them.
			// else travel to the other
			this.goToEnemy();
			if (
				this.position.x > 0.4125 * screen.width &&
				this.position.x < 0.58125 * screen.width &&
				this.canJump
			) {
				this.jump();
				this.canJump = false;
				this.setJumpDelay();
			}
		} else if (enemyLevel == "Middle") {
			// bottom and we have to get up
			// top and we have to get down
			if (currentLevel == "Top") {
				if (enemy.x > screen.width / 2) {
					this.moveleft = false;
					this.moveright = true;
				} else {
					this.moveleft = true;
					this.moveright = false;
				}
			}
			if (currentLevel == "Bottom") {
				// find closest jumping spot
				//let numbers = [4, 2, 5, 1, 3];
				//numbers.sort((a, b) => a - b);
				this.getToMiddle();
			}
		}
		if (currentLevel == enemyLevel && enemyLevel == "Top") {
			this.goToEnemy();
		} else if (enemyLevel == "Top") {
			if (currentLevel == "Bottom") {
				this.getToMiddle();
			} else {
				// we're in the middle

				let platformWidth = 0.4125 * screen.width - 0.1 * screen.width;
				let platformMiddle;
				if (this.position.x > screen.width / 2) {
					// we're on the right
					platformMiddle = 0.58125 * screen.width + platformWidth / 2;
					//platformMiddle + " on the right ");
				} else {
					// we're on the left
					platformMiddle = 0.1 * screen.width + platformWidth / 2;
					//platformMiddle + " on the left ");
				}
				this.goToXLocation(platformMiddle);
				if (this.withinRange(this.position.x, platformMiddle, 50)) {
					this.jump();
					this.canJump = false;
					this.setJumpDelay();
				}
			}
		}
	}
	getToMiddle() {
		let middleMove = this.position.x > screen.width / 2 ? true : false;
		let dists = [
			{
				name: "Middle",
				value: dist(screen.width / 2, 0, this.position.x, 0),
				moveLeft: middleMove,
			},
			{
				name: "Left",
				value: dist(0, 0, this.position.x, 0),
				moveLeft: true,
			},
			{
				name: "Right",
				value: dist(screen.width, 0, this.position.x, 0),
				moveLeft: false,
			},
		];
		dists.sort((a, b) => {
			return a.value - b.value;
		});
		let closestPosition = dists[0];
		//dists);
		//closestPosition.name);
		this.moveleft = closestPosition.moveLeft;
		this.moveright = !this.moveleft;
		if (this.withinRange(closestPosition.value, 0, 200 * scaleX)) {
			this.jump();
			this.canJump = false;
			this.setJumpDelay();
		}
	}
	goToXLocation(point) {
		//"going to an x location");
		if (this.position.x > point) {
			this.moveleft = true;
			this.moveright = false;
		} else {
			this.moveright = true;
			this.moveleft = false;
		}
	}
	show() {
		this.basicAttackHandle();
		this.airborne = this.dirBlocked == "none" ? true : false;
		this.drawName();
		tint(this.opacity, 255);
		if (this.basicAttacking) {
			//this.currentFrame);
			image(
				this.basicAnimation[this.currentFrame],
				this.position.x,
				this.position.y,
				160 * scaleX,
				160 * scaleY,
			);
		} else {
			//"doin da walk")
			image(
				this.walkingAnimation[this.currentFrame],
				this.position.x,
				this.position.y,
				160 * scaleX,
				160 * scaleY,
			);
		}
		//);
		tint(255, 255);
		if (this.hp <= 0) {
			this.dead = true;
		}
		if (frameCount % 3 == 0 && !this.basicAttacking) {
			this.currentFrame++;
		}
		if (this.currentFrame == 10) {
			this.currentFrame = 0;
		}
		this.pathfind();
		//dist(this.position.x,this.position.y,enemyEntities[0].x,enemyEntities[0].y));
		if (
			dist(
				this.position.x,
				this.position.y,
				enemyEntities[0].x,
				enemyEntities[0].y,
			) < 200
		) {
			this.basicAttack();
		}
	}
	getSendableData() {
		let animation = this.animationIndex;
		if (this.basicAttacking) {
			animation += 1;
		}
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			animationIndex: animation,
			scale: scaleX,
			animationFrame: this.currentFrame,
		};
		return data;
	}
}
class VampireBat extends Character {
	constructor(x, y) {
		super();
		this.position = createVector(x, y);
		this.name = "Vampire Bat";
		this.mass = 1;
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
		this.jumpPower = -26;
		this.friction = 3;
		this.damage = 2;

		this.airborne = false;
		this.attackFrame = 0;
	}
	withinRange(value, target, tolerance) {
		if (value > target - tolerance && value < target + tolerance) {
			return true;
		} else {
			return false;
		}
	}
	basicAttack() {
		//"doing the basic attack!");
		if (this.basicAttacking == false) {
			//this.currentFrame = 0;
			this.basicAttacking = true;
			attackId++;
		}
	}
	basicAttackHandle() {
		if (this.basicAttacking) {
			if (frameCount % 2 == 0) {
				this.sendSquareAttack(
					this.position.x,
					this.position.y - 50,
					this.damage,
					this.weaponSpriteSize * scaleX * 0.8,
					this.weaponSpriteSize * scaleY,
					"Bat Lifesteal",
					attackId,
					true,
				);
				this.attackFrame++;
			}
			if (this.attackFrame == this.basicAttackFrameCount) {
				this.attackFrame = 0;
				this.basicAttacking = false;
			}
		}
	}
	setJumpDelay() {
		setTimeout(() => {
			this.canJump = true;
		}, this.jumpDelay);
	}
	setJumpDelay() {
		setTimeout(() => {
			this.canJump = true;
		}, this.jumpDelay);
	}
	goToEnemy() {
		let enemy = enemyEntities[0];
		let toTheLeft = this.position.x < enemy.x ? true : false;
		let withinX = this.withinRange(this.position.x, enemy.x, 50);
		if (toTheLeft) {
			this.moveright = true;
			this.moveleft = false;
			//"moving right");
		} else if (withinX) {
			this.moveright = false;
			this.moveleft = false;
			//"Within X");
		} else {
			this.moveright = false;
			this.moveleft = true;
			//"moving left");
		}
	}
	pathfind() {
		let enemyLevel;
		let currentLevel;
		let enemy = enemyEntities[0];

		let toTheLeft = this.position.x < enemy.x ? true : false;
		let withinX = this.withinRange(this.position.x, enemy.x, 50);

		if (enemy.y > middleBottom) {
			enemyLevel = "Bottom";
		} else if (enemy.y > upperBottom) {
			enemyLevel = "Middle";
		} else {
			enemyLevel = "Top";
		}
		if (this.position.y > middleBottom) {
			currentLevel = "Bottom";
		} else if (this.position.y > upperBottom) {
			currentLevel = "Middle";
		} else {
			currentLevel = "Top";
		}
		if (currentLevel == enemyLevel && enemyLevel == "Bottom") {
			this.goToEnemy();
		} else if (enemyLevel == "Bottom") {
			if (currentLevel == "Top") {
				if (this.position.x > screen.width / 2) {
					this.moveright = true;
					this.moveleft = false;
				} else {
					this.moveleft = true;
					this.moveright = false;
				}
			} else {
				let platformMiddle = 0.58125 * screen.width;
				if (this.position.x > screen.width / 2) {
					let platformWidth =
						0.4125 * screen.width - 0.1 * screen.width;
					if (
						this.position.x <
						0.58125 * screen.width + platformWidth / 2
					) {
						this.moveleft = true;
						this.moveright = false;
					} else {
						this.moveleft = false;
						this.moveright = true;
					}
					// on right platform
				} else {
					// on left platform
					let platformWidth =
						0.4125 * screen.width - 0.1 * screen.width;
					if (
						this.position.x <
						0.1 * screen.width + platformWidth / 2
					) {
						this.moveleft = true;
						this.moveright = false;
					} else {
						this.moveleft = false;
						this.moveright = true;
					}
				}
			}
		}
		if (currentLevel == enemyLevel && enemyLevel == "Middle") {
			// if both of us are on the left or right platform just like go to them.
			// else travel to the other
			this.goToEnemy();
			if (
				this.position.x > 0.4125 * screen.width &&
				this.position.x < 0.58125 * screen.width &&
				this.canJump
			) {
				this.jump();
				this.canJump = false;
				this.setJumpDelay();
			}
		} else if (enemyLevel == "Middle") {
			// bottom and we have to get up
			// top and we have to get down
			if (currentLevel == "Top") {
				if (enemy.x > screen.width / 2) {
					this.moveleft = false;
					this.moveright = true;
				} else {
					this.moveleft = true;
					this.moveright = false;
				}
			}
			if (currentLevel == "Bottom") {
				// find closest jumping spot
				//let numbers = [4, 2, 5, 1, 3];
				//numbers.sort((a, b) => a - b);
				this.getToMiddle();
			}
		}
		if (currentLevel == enemyLevel && enemyLevel == "Top") {
			this.goToEnemy();
		} else if (enemyLevel == "Top") {
			if (currentLevel == "Bottom") {
				this.getToMiddle();
			} else {
				// we're in the middle

				let platformWidth = 0.4125 * screen.width - 0.1 * screen.width;
				let platformMiddle;
				if (this.position.x > screen.width / 2) {
					// we're on the right
					platformMiddle = 0.58125 * screen.width + platformWidth / 2;
					//platformMiddle + " on the right ");
				} else {
					// we're on the left
					platformMiddle = 0.1 * screen.width + platformWidth / 2;
					//platformMiddle + " on the left ");
				}
				this.goToXLocation(platformMiddle);
				if (this.withinRange(this.position.x, platformMiddle, 50)) {
					this.jump();
					this.canJump = false;
					this.setJumpDelay();
				}
			}
		}
	}
	getToMiddle() {
		let middleMove = this.position.x > screen.width / 2 ? true : false;
		let dists = [
			{
				name: "Middle",
				value: dist(screen.width / 2, 0, this.position.x, 0),
				moveLeft: middleMove,
			},
			{
				name: "Left",
				value: dist(0, 0, this.position.x, 0),
				moveLeft: true,
			},
			{
				name: "Right",
				value: dist(screen.width, 0, this.position.x, 0),
				moveLeft: false,
			},
		];
		dists.sort((a, b) => {
			return a.value - b.value;
		});
		let closestPosition = dists[0];
		//dists);
		//closestPosition.name);
		this.moveleft = closestPosition.moveLeft;
		this.moveright = !this.moveleft;
		if (this.withinRange(closestPosition.value, 0, 200 * scaleX)) {
			this.jump();
			this.canJump = false;
			this.setJumpDelay();
		}
	}
	goToXLocation(point) {
		//"going to an x location");
		if (this.position.x > point) {
			this.moveleft = true;
			this.moveright = false;
		} else {
			this.moveright = true;
			this.moveleft = false;
		}
	}
	show() {
		this.basicAttackHandle();
		this.airborne = this.dirBlocked == "none" ? true : false;
		this.drawName();
		tint(this.opacity, 255);
		//"doin da walk")
		image(
			this.walkingAnimation[this.currentFrame],
			this.position.x,
			this.position.y - 50,
			160 * scaleX,
			160 * scaleY,
		);
		//);
		tint(255, 255);
		if (this.hp <= 0) {
			this.dead = true;
		}
		if (frameCount % 3 == 0) {
			this.currentFrame++;
		}
		if (this.currentFrame == 5) {
			this.currentFrame = 0;
		}
		this.pathfind();
		if (
			dist(
				this.position.x,
				this.position.y,
				enemyEntities[0].x,
				enemyEntities[0].y,
			) < 200
		) {
			this.basicAttack();
		}
		this.applyForce(createVector(0, -0.1));
	}
	getSendableData() {
		let animation = this.animationIndex;
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			animationIndex: animation,
			scale: scaleX,
			animationFrame: this.currentFrame,
		};
		return data;
	}
}

class Grave extends Character {
	constructor(x, y, entity) {
		super();
		this.position = createVector(x, y);
		this.name = "Grave";
		this.mass = 0.75;
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
	processSquareAttack(
		x,
		y,
		dmg,
		enemyScaleX,
		enemyScaleY,
		sizeX,
		sizeY,
		type,
		atckId,
	) {}
	takeDamage() {
		//"lol u thought");
	}
	show() {
		image(
			this.sprite,
			this.position.x,
			this.position.y,
			160 * scaleX,
			160 * scaleY,
		);
	}
	getSendableData() {
		let animation = this.animationIndex;
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			scale: scaleX,
		};
		return data;
	}
}
