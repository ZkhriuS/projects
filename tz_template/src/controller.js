
//обработка действий игрока

var MIN_SHOT_DEG = -75
    , MAX_SHOT_DEG = 30
    , controller = {

        //натянутая резинка придаёт импульс снежку
        __pull(pullData) {
            rubber.__parent.__rotate = -pullData.__angle;
            arrow.__x = rubber.cropx = -pullData.__strength;
            this.__velocity = pullData.__velocity;
            level.__setAliasesData({
                strength: {
                    __text: floor(pullData.__strength)
                }
            });
        },

        __shot() {
            levelData.__score.__total += levelData.__big_blocks * BIG_BLOCK_HP;
            this.__shots++;
            BUS.__post(__ON_SHOT);
        }

    };

//игрок растягивает мышкой объект
function MousePull(obj, vmouse) {

    var dv = vmouse.sub(obj.__worldPosition.__clone())
        , sz = obj.__size;

    //величина натяжения ограничена областью объекта
    this.__strength = clamp(dv.__length(), 0, mmin(sz.x, sz.y) / 2);

    //можно ограничить броски в некоторых направлениях
    this.__angle = clamp(
        (dv.__angle() - PI) * RAD2DEG
        , MIN_SHOT_DEG
        , MAX_SHOT_DEG
    );

    //результирующая скорость с учётом ограничений
    this.__velocity = (new Vector2(
        this.__strength * Math.cos(this.__angle * DEG2RAD)
        , this.__strength * Math.sin(this.__angle * DEG2RAD)
    )).__multiplyScalar(0.2);

}