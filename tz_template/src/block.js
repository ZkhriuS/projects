
//блок

var BREAK_STEP = 50;

function Block(node, needBreaks, hp, dmgMax) {
    this.__node = node;
    this.__body = node.__ph_body;
    this.__needBreaks = needBreaks;
    this.__hp = hp;

    //обработка столкновений
    this.__body.__onCollision = (speed) => {
        var dmg = calculateDamage(speed, dmgMax);
        if (dmg && this.__hp) {
            controller.__breaks++;
            this.__hp = mmax(0, this.__hp - dmg);
            if (!this.__hp && !windowManager.__hasOpenedWindow()) {
                this.__body.__onCollision = 0;
                looperPost(a => {
                    levelData.__removeBlock(this);
                })
                levelData.__changeScore(dmg);
            }
        }
    };

    //разбиваем блок на кусочки
    this.__breakBlock = () => {
        breakSound(1);

        var sz = this.__node.__size
            , v = this.__body.velocity
            , bx = this.__node.__x - sz.x / 2
            , by = this.__node.__y - sz.y / 2;

        for (var x = 0; x < sz.x; x += BREAK_STEP) {
            for (var y = 0; y < sz.y; y += BREAK_STEP) {
                addBreakBlock(bx + x, by + y, new Vector2(
                    v.x + randomFloat(-10, 10),
                    v.y + randomFloat(-8, 3)
                ));
            }
        }
    };
}


function addBreakBlock(x, y, velocity) {
    var break_node = level.__addChildBox({
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
    });
    looperPost(a => {
        if (break_node.__ph_body) {
            ph_Body.setVelocity(break_node.__ph_body, velocity);
            setTimeout(() => {
                if (break_node.__ph_body) {
                    var break_block = new Block(break_node, 0, BREAK_BLOCK_HP, velocity.__length());
                    levelData.__addBlock(break_block);
                    _setTimeout(() => {
                        if (!break_block.__node.__destructed) {
                            levelData.__removeBlock(break_block);
                        }
                    }, randomFloat(5, 10));
                }
            }, 1)
        }
    });
}

//при разрушении звук играет с некоторой вероятностью
function breakSound(chance) {
    if (random() < chance && !windowManager.__hasOpenedWindow()) {
        playSound('break_' + randomInt(1, 4), 0, 0, 0.5);
    }
}