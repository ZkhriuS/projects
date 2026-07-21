
//инициализация стартовых параметров уровня
var levelData = {

    //номер уровня
    __number: 1,

    //счёт уровня
    __score: 0,

    //ледяные блоки
    __blocks: [],

    //количество больших блоков
    __big_blocks: 0,

    //количество очков для 1/2/3 звёзд за уровень
    __star_goals: [],

    __initLevel() {

        this.__score = 0;
        controller.__shots = 0;
        return scene
            .__addChildBox('level_' + this.__number)
            .__setAliasesData(layout);

    },

    __changeScore(dscore) {

        this.__score += dscore;

        if (level) {
            level.__setAliasesData({
                score_text: {
                    __text: levelData.__score
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
                show_win();
            }, 1)
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
    },

    userInputArea: {
        __dragDist: 1,
        __drag(x, y, dx, dy) {
            var mp = new MousePull(this, new Vector2(x, y));
            controller.__pull(mp);
        },
        __dragStart() {
            rubber.__killAllAnimations();
        },
        __dragEnd() {
            playSound('punch');

            // отпускаем резинку
            rubber.__anim({
                __width: 10
            }, 0.4, 0, easeElasticO);

            initBullet(this.__worldPosition);
        }
    }
}
