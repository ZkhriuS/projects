var BREAK_STEP = 50;

function Block(node, needBreaks, hp, dmgMax) {
    this.__node = node;
    this.__body = node.__ph_body;
    this.__needBreaks = needBreaks;
    this.__hp = hp;
    this.__body.__onCollision = (speed) => {
        var dmg = calculateDamage(speed, dmgMax);
        if (dmg && this.__hp) {
            breakBlock(this, dmg);
        }
    }
}

function parts(block, bx, by) {
    for (var x = 0; x < block.__sz.x; x += BREAK_STEP)
        for (y = 0; y < block.__sz.y; y += BREAK_STEP) {
            addBreakBlock(bx + x, by + y, new Vector2(
                block.__v.x + randomFloat(-10, 10),
                block.__v.y + randomFloat(-8, 3)
            ));
        }
}

function initCollision(body, node, hp, dmgMax) {
    body.__hp = hp;
    body.__onCollision = (speed) => {
        var dmg = calculateDamage(speed, dmgMax);
        bullet.__shot_breaks++;
        if (dmg && body.__hp) {
            // consoleLog('damage', dmg);
            body.__hp = mmax(0, body.__hp - dmg);
            if (!body.__hp && !windowManager.__hasOpenedWindow()) {
                body.__onCollision = 0;
                looperPost(a => {
                    removeBlock(node);
                    score += dmg;
                    BUS.__post(__ON_SCORE_CHANGED);
                });
            }
        }
    }
}

function breakBlock(block, dmg) {

    controller.__breaks++;
    block.__hp = mmax(0, block.__hp - dmg);

    if (!block.__hp && !windowManager.__hasOpenedWindow()) {

        block.__body.__onCollision = 0;

        looperPost(a => {
            block.__sz = block.__node.__size;
            block.__v = block.__body.velocity;
            levelData.__removeBlock(block);
            if (block.__needBreaks) {
                breakSound(1);
                parts(block
                    , block.__node.__x - block.__sz.x / 2
                    , block.__node.__y - block.__sz.y / 2); // parameters
                levelData.__changeScore(dmg);
                levelData.__checkGoal();
            } else {
                breakSound(0.5);
            }
        })
    }
}

function addBreakBlock(x, y, velocity) {
    var break_block = new Block(level.__addChildBox({
        __img: 'break_' + randomInt(1, 9),
        __ofs: [x, y, -20],
        __rotate: randomInt(0, 360),
        __physics: {
            __isStatic: false,
            __friction: 10,
            __frictionAir: 1,
            __frictionStatic: 50,
            __restitution: 0,
            __density: 1,
            __bodyType: 1
        }
    }), 0, BREAK_BLOCK_HP, floor(velocity.__length));
    looperPost(a => {
        if (break_block.__body) {
            ph_Body.setVelocity(break_block.__body, v);
            _setTimeout(() => {
                if (!break_block.__destructed) {
                    levelData.__removeBlock(break_block);
                }
            }, randomFloat(5, 10));
        }
    });
}

function breakSound(chance) {
    if (random() > (1 - chance) && !windowManager.__hasOpenedWindow()) {
        playSound('break_' + randomInt(1, 4), 0, 0, 0.5);
    }
}