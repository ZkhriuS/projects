var rubber = {
    __pull(pullData) {
        this.__parent.__rotate = -pullData.__angle;
        this.__width = pullData.__strength;
        this.__velocity = pullData.__velocity;
    }
}