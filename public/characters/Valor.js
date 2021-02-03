class Valor extends Character {
	constructor() {
		super();
		this.name = "Valor";
		this.buttonIndex = 1;
		this.mass = 1;
		this.basehp = 80; //100
		this.basespeed = 9;
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
		this.windBlessing = new WindBlessing();
		this.jumpPower = baseJump * 1.9;
		this.windSliceSpeed = 40;
		this.powered = false;
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
		tint(255, 255);

		this.drawWeapon(this.basicAnimation);
		this.basicAttackHandle();

		this.updateAbilityOne();
		this.updateAbilityTwo();
		this.updateAbilityThree();
	}
	startParticleChain() {
		setTimeout(() => {
			if (this.powered) {
				this.startParticleChain();
				particles.push(
					new Particle(this.position.x, this.position.y, "up"),
				);
				socket.emit("new-particle", {
					x: this.position.x,
					y: this.position.y,
					dir: "up",
					room: roomId,
				});
			}
		}, 100);
	}
	sendCharacterData() {
		let health = this.hp / this.maxHealth;
		socket.emit("enemy-char-data", { percentHealth: health, room: roomId });
	}
	basicAttack() {
		if (this.basicAttacking == false && this.stamina >= 35) {
			this.stamina -= 35;
			this.basicAttacking = true;
			attackId++;
			this.currentAttack = attackId;
			console.log("Basic Attack ID " + attackId);
			let deltaX = (mouseX - this.position.x) / 1;
			let deltaY = (this.position.y - mouseY) / -1;
			let dirVector = createVector(deltaX, deltaY);
			dirVector.normalize();
			dirVector.mult(this.windSliceSpeed);
			this.windAttack = new WindAttack(
				this.position.x,
				this.position.y,
				dirVector,
				2,
			);
			if (this.powered) {
				this.windAttack.powerup();
			}
		}
	}
	characterVelocityChange() {
		console.log(this.slashDash.dashing);
		if (this.slashDash.dashing) {
			this.velocity = this.slashDash.getVelocity();
			console.log("character change velocity thing, dashing");
		}
		if (this.slam.slamming) {
			this.velocity = this.slam.getVelocity();
			this.slam.reachedBottom =
				this.dirBlocked == "only negative Y" ? true : false;
		}
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
					this.currentAttack,
					true,
				);
				this.weaponAnimationFrame =
					random() > 0.5
						? this.weaponAnimationFrame + 1
						: this.weaponAnimationFrame + 2;
			}
			if (this.weaponAnimationFrame >= this.basicAttackFrameCount) {
				this.weaponAnimationFrame = 0;
				this.basicAttacking = false;
			}
			this.windAttack.update();
		}
	}
	executeAbilityOne() {
		if (
			!this.slashDash.active &&
			this.slashDash.currentcooldown <= 0 &&
			this.stamina >= 20
		) {
			this.slashDash = new SlashDash();
			this.stamina -= 20;
		}
		if (!this.slashDash.isDone && this.stamina >= 20) {
			this.slashDash.activate(this.position.x, this.position.y);
			this.stamina -= 20;
		}
	}
	updateAbilityOne() {
		this.slashDash.update();
	}
	executeAbilityTwo() {
		if (
			!this.slam.active &&
			this.slam.currentcooldown <= 0 &&
			this.dirBlocked != "only negative Y" &&
			this.stamina > 25
		) {
			this.slam = new Slam();
			this.slam.activate();
			this.stamina -= 25;
		}
	}
	updateAbilityTwo() {
		if (this.slam.active) {
			this.slam.update();
		}
	}
	executeAbilityThree() {
		if (
			!this.windBlessing.active &&
			this.windBlessing.currentcooldown <= 0
		) {
			this.windBlessing = new WindBlessing();
			this.windBlessing.activate();
			this.startParticleChain();
		}
	}
	updateAbilityThree() {
		if (this.windBlessing.active) {
			this.windBlessing.update();
		}
	}
}
