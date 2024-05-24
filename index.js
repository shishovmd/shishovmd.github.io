const funct = (start, end, time) => {
    let curr = start;
    const animation = () => {
        if (curr > end) {
            return
        }
        //код, который линейно изменяет curr в зависимости от времени
        requestAnimationFrame(animation);
    }
    animation();
};