class Shadow extends Character {
	constructor() {
		super();
		this.name = "Shadow";
		this.buttonIndex = 1;
		this.mass = 1;
		this.basehp = 120; //100
		this.basespeed = 9;
		this.basepower = 10;
		this.baseresistance = 5;
		this.spriteIndex = 3;
		this.sprite = characterSprites[this.spriteIndex];
		this.ghost = false;
		this.bodyType = "square";
		this.weaponSprite = 4;
		this.weaponSpriteSize = 160;
		this.basicAttackFrameCount = 8;
		this.basicAttacking = false;
		this.basicAnimation = weaponSpritesAnimations[this.weaponSprite];
		this.currentAttack = 0;

		this.transitioning = false;
		this.fading = false;
		this.fadingIn = false;
		this.transitionRectHeight = 0;
		this.shadow = 10;
		this.inShadow = false;
		this.executePassive();
		this.sneak = new Sneak();
		this.blink = new Blink();
		this.shadowForm = new ShadowForm();
		this.maxShadow = 5;
	}
	executePassive() {
		setTimeout(() => {
			this.shadow += 0.15;
			this.shadow = constrain(this.shadow, 0, this.maxShadow);
			this.executePassive();
		}, 400);
	}
	takeDamage(dmg) {
		if (!this.stillDodging && !this.inShadow) {
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
	show() {
		if (this.fading) {
			let fadeAmount = 25.5;
			if (this.fadingIn) {
				this.opacity += fadeAmount;
				this.fadingIn = this.opacity >= 255 ? false : true;
			} else {
				this.opacity -= fadeAmount;
				this.fadingIn = this.opacity <= 0 ? true : false;
			}

			this.fading = this.opacity >= 255 ? false : true;
		} else if (this.transitioning) {
			if (!this.inShadow) {
				this.transitionRectHeight -= 10;
				if (this.transitionRectHeight <= 0) {
					this.transitionRectHeight = 0;
					this.transitioning = false;
				}
			} else {
				this.transitionRectHeight += 10;
				if (this.transitionRectHeight >= 300) {
					this.transitionRectHeight = 300;
					this.transitioning = false;
				}
			}
		}
		if (this.inShadow) {
			this.staminaRegenAmount = 6;
		} else {
			this.staminaRegenAmount = 5;
		}
		tint(this.opacity, 255);
		image(
			this.sprite,
			this.position.x,
			this.position.y,
			128 * scaleX,
			128 * scaleY,
		);
		this.drawWeapon(this.basicAnimation);
		fill(0, 0, 0);
		rect(
			this.position.x - this.size.x * 2,
			this.position.y - this.size.y - 20,
			this.size.x * 4,
			this.transitionRectHeight,
		);
		this.basicAttackHandle();
		this.updateAbilityOne();
		this.updateAbilityThree();
		tint(255, 255);
		fill(100, 100, 255);
		rect(
			this.position.x - this.size.x / 2,
			this.position.y - 150,
			(this.shadow / this.maxShadow) * this.size.x,
			30,
		);
		this.drawName();
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
	executeAbilityOne() {
		if (this.sneak.currentcooldown <= 0) {
			this.sneak = new Sneak();
			this.sneak.activate();
		}
	}
	executeAbilityTwo() {
		this.shadowForm.activate();
	}
	executeAbilityThree() {
		if (this.blink.currentcooldown <= 0) {
			this.blink = new Blink();
			this.blink.activate();
		}
	}
	updateAbilityOne() {
		this.sneak.update();
	}
	updateAbilityThree() {
		this.blink.update();
	}
	characterVelocityChange() {}
	basicAttack() {
		if (
			this.basicAttacking == false &&
			this.stamina >= 35 &&
			!this.inShadow
		) {
			this.stamina -= 35;
			this.basicAttacking = true;
			attackId++;
			this.currentAttack = attackId;
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
		}
	}
}
