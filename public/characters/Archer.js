class Archer extends Character {
	constructor() {
		super();
		this.name = "Archer";
		this.buttonIndex = 2;
		this.mass = 1;
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
		this.grappleSprite = weaponSpritesAnimations[basicAttacks + 1];
		this.artemisbowSprite = weaponSpritesAnimations[basicAttacks + 2];
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
	basicAttack() {
		if (
			!this.basicAttacking &&
			!this.shooting &&
			this.weaponAnimationFrame < 3 &&
			!this.multishooting &&
			!this.holdingArtemisBow &&
			this.stamina > 35
		) {
			this.basicAttacking = true;
			this.stamina -= 35;
			attackId++;
		}
	}
	getSendableData() {
		let flipWeapon = this.position.x > mouseX ? true : false;
		let weaponNow;
		if (this.shooting || this.multishooting) {
			weaponNow = basicAttacks;
		} else if (this.holdingGrapple) {
			weaponNow = basicAttacks + 1;
		} else if (this.holdingArtemisBow) {
			weaponNow = basicAttacks + 2;
		} else {
			weaponNow = this.weaponSprite;
		}
		let data = {
			x: this.position.x,
			opacity: this.opacity,
			y: this.position.y,
			name: this.name,
			sprite: this.spriteIndex,
			scale: scaleX,
			weaponSprite: weaponNow,
			animationFrame: this.weaponAnimationFrame,
			weaponPosX: this.weaponPos.x,
			weaponPosY: this.weaponPos.y,
			flipWeapon: flipWeapon,
			weaponRotation: this.weaponRotation,
			weaponSpriteSize: this.weaponSpriteSize,
		};
		return data;
	}
	show() {
		this.drawName();
		tint(this.opacity, 255);
		image(
			this.sprite,
			this.position.x,
			this.position.y,
			128 * scaleX,
			128 * scaleY,
		);

		if (
			!this.shooting &&
			!this.holdingGrapple &&
			!this.multishooting &&
			!this.holdingArtemisBow
		) {
			this.drawWeapon(this.basicAnimation);
		} else if (this.shooting || this.multishooting) {
			this.drawWeapon(this.shootingAnimation);
		} else if (this.holdingGrapple) {
			this.weaponAnimationFrame = 0;
			this.drawWeapon(this.grappleSprite);
		} else if (this.holdingArtemisBow) {
			this.weaponAnimationFrame = 0;
			this.drawWeapon(this.artemisbowSprite);
		}

		this.basicAttackHandle();
		tint(255, 255);
		this.updateAbilityOne();
		this.updateAbilityTwo();
		this.updateAbilityThree();
		this.updateAbilityFour();
	}
	sendCharacterData() {
		socket.emit("enemy-char-data", {
			percentHealth: this.hp / this.maxHealth,
			room: roomId,
		});
	}
	executeAbilityOne() {
		if (
			!this.arrowShoot.active &&
			this.arrowShoot.currentcooldown <= 0 &&
			!this.basicAttacking
		) {
			this.shooting = true;
			this.arrowShoot.active = true;
			this.weaponAnimationFrame = 0;
		} else {
		}
	}
	updateAbilityOne() {
		if (this.arrowShoot.active) {
			if (
				this.weaponAnimationFrame < 5 &&
				this.shooting &&
				frameCount % 3 == 0
			) {
				this.weaponAnimationFrame++;
				this.shooting = true;
			} else if (this.weaponAnimationFrame == 5 && this.shooting) {
				this.arrowShoot = new ArrowShoot();
				this.arrowShoot.activate(this.position.x, this.position.y);
				this.shooting = false;
				this.weaponAnimationFrame = 0;
			} else if (this.shooting == false) {
				this.arrowShoot.update();
			}
		} else {
			//this.shooting = false;
		}
	}
	executeAbilityTwo() {
		if (
			!this.multiShot.active &&
			this.multiShot.currentcooldown <= 0 &&
			!this.basicAttacking
		) {
			this.multishooting = true;
			this.multiShot.active = true;
			this.weaponAnimationFrame = 0;
		}
	}
	updateAbilityTwo() {
		if (this.multiShot.active) {
			if (
				this.weaponAnimationFrame < 5 &&
				this.multishooting &&
				frameCount % 3 == 0
			) {
				this.weaponAnimationFrame++;
				this.multishooting = true;
			} else if (this.weaponAnimationFrame == 5 && this.multishooting) {
				this.multiShot = new MultiShot();
				this.multiShot.activate(this.position.x, this.position.y);
				this.multishooting = false;
			} else if (this.multishooting == false) {
				this.multiShot.update();
				this.multishooting = false;
				this.weaponAnimationFrame = 0;
			}
		} else {
			//this.shooting = false;
		}
	}
	executeAbilityThree() {
		if (
			!this.grapple.active &&
			this.grapple.currentcooldown <= 0 &&
			!this.basicAttacking
		) {
			this.holdingGrapple = true;
			this.grapple = new Grapple();
			this.grapple.active = true;
			this.weaponAnimationFrame = 0;
			this.grapple.activate(this.position.x, this.position.y);
			this.grapple.decay();
		}
	}
	// do force for a certain amout of time
	updateAbilityThree() {
		if (this.grapple.active) {
			this.grapple.update();
		}
	}
	executeAbilityFour() {
		if (
			!this.artimesBow.active &&
			this.artimesBow.currentcooldown <= 0 &&
			!this.basicAttacking &&
			!this.holdingGrapple
		) {
			this.holdingArtemisBow = true;
			this.artimesBow = new ArtemisBow();
			this.artimesBow.active = true;
			this.weaponAnimationFrame = 0;
			this.artimesBow.activate();
			this.artimesBow.decay();
		} else if (this.artimesBow.active && this.artimesBow.duration > 0) {
			this.artimesBow.shoot(this.position.x, this.position.y);
		}
	}
	updateAbilityFour() {
		if (this.artimesBow.active) {
			this.artimesBow.update();
		}
		if (this.artimesBow.duration <= 0) {
			this.artimesBow.active = false;
			this.holdingArtemisBow = false;
		}
	}
	grappleHandle() {
		if (this.grappling) {
			this.applyForce(this.grapple.getForce());
			//"APPLYING FORCE");
		}
		if (!this.hookLastAttached && this.grapple.attached) {
			//"LATCHED");
			this.grappling = true;
			setTimeout(() => {
				this.grappling = false;
				this.holdingGrapple = false;
				this.grapple.active = false;
			}, 300);
		}
		if (!this.grapple.active) {
			this.grappling = false;
			this.holdingGrapple = false;
		}
		this.hookLastAttached = this.grapple.attached;
	}
}
