function initBullet(wp) {
    var bullet = level.__addChildBox({
        __effect: 'tail',
        __img: 'circle1',
        __size: [28, 28],
        __ofs: [wp.x, wp.y, -20],
        __physics: {
            __isStatic: false,
            __friction: 130,
            __frictionAir: 0.2,
            __frictionStatic: 500,
            __restitution: 10,
            __density: 4,
            __bodyType: 1
        }
    }).update();
    if (bullet.__ph_body) {
        ph_Body.setVelocity(bullet.__ph_body, rubber.__velocity);
    }
    controller.__breaks = 0;
}

bullet.__damage = (body) => {
    return ((controller.__breaks) ? 1 : -1) * floor(
        ph_Body.getVelocity(body).__length());
}

BUS.__addEventListener(
    __ON_BULLET_OUT, e => {
        if (bullet && bullet.__ph_body) {
            levelData.__changeScore(bullet.__damage(bullet.__ph_body))
            bullet.__removeFromParent();
        }
    }
);