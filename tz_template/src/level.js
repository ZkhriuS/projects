
//инициализация стартовых параметров уровня
var levelData = {

    //номер уровня
    __number: 1,

    //счёт уровня
    __score: {

        __reset() {
            this.__current = 0;
            this.__total = 0;
        },

        __calculate() {
            return this.__current / this.__total * 100;
        }
    },

    //ледяные блоки
    __blocks: [],

    //нужно пройти уровень не хуже, чем на [процент]% для 1/2/3 звёзд
    __goals: {
        1: [40, 60, 80],
        2: [40, 60, 80],
        3: [40, 60, 80],
    },

    __win: {
        __phrase: ["YOU WIN!", "NICE!", "AWESOME!", "INCREDIBLE!"],
        __set(g) {
            this.__stars = 0;
            for (var i = 0; i < g.length; i++) {
                this.__stars += (levelData.__score.__calculate() > g[i]);
            }
        },
        __congratulate() {
            return this.__phrase[this.__stars];
        }
    },

    __initLevel() {

        this.__score.__reset();
        this.__big_blocks = 0;
        controller.__shots = 0;
        return scene
            .__addChildBox('level_' + this.__number)
            .__setAliasesData(layout);

    },

    //расчёт очков броска в зависимости от попадания в цель
    __changeScore(dscore) {

        if (controller.__breaks) this.__score.__current += dscore;

        if (level) {
            level.__setAliasesData({
                score_text: {
                    __text: levelData.__score.__current
                }
            });
        }

    },

    __addBlock(block) {

        if (block.__needBreaks) this.__big_blocks++;
        this.__blocks.push(block);

    },

    __removeBlock(block) {

        removeFromArray(block, this.__blocks);
        block.__node.__removeFromParent();

        looperPostOne(awakeBlocks);

        if (block.__needBreaks) {

            //разбиваем большие блоки
            this.__big_blocks--;
            block.__breakBlock();
            this.__checkGoal();

        } else {
            breakSound(0.5);
        }

    },

    //для победы нужно разбить все большие блоки
    __checkGoal() {

        if (this.__big_blocks == 0) {
            setTimeout(() => {
                this.__win.__set(this.__goals[this.__number]);
                show_win();
            }, 1)
        }

    },

    __showStars(stars) {
        for (var i = 0; i < stars.length; i++) {
            stars[i].__visible = (this.__win.__stars > i);
        }
    }
}

function awakeBlocks() {

    $each(levelData.__blocks, b => {
        b.__node.__ph_awake();
    });

}

//инициализация больших блоков
function initBlock(node) {

    var body = node.__ph_body;
    if (body && !body.isStatic) {
        levelData.__addBlock(new Block(node, 1, BIG_BLOCK_HP, 100));
    }

}

//общая структура уровней
var layout = {
    rubber(node) {
        rubber = node;
        rubber.__parent.__visible = 0;
    },

    arrow(node) {
        arrow = node;
    },

    userInputArea: {
        __dragDist: 1,
        __drag(x, y, dx, dy) {
            var mp = new MousePull(this, new Vector2(x, y));
            controller.__pull(mp);
        },
        __dragStart() {
            rubber.__killAllAnimations();
            rubber.__parent.__visible = 1;
        },
        __dragEnd() {
            playSound('punch');

            // отпускаем резинку
            rubber.__anim({
                cropx: 0
            }, 0.4, 0, easeElasticO);

            initBullet(this.__worldPosition);

            setTimeout(() => {
                rubber.__parent.__visible = 0;
            }, 0.4)
        }
    },

    retry: {
        __onTap() {
            BUS.__post(__ON_RETRY);
        },
        __onTapHighlight: 1
    }
}
