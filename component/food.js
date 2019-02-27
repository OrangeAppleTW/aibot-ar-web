/**
 * 能量食物
 */
AFRAME.registerComponent('food', {
    schema: {
        color: { type: 'string', default: 'gold' },
    },

    init: function () {
        let el = document.createElement('a-box');
        el.setAttribute('color', this.data.color);
        el.setAttribute('scale', '0.3 0.3 0.3');
        el.setAttribute('rotation', '45 45 45');
        let animationEl = document.createElement('a-animation');
        animationEl.setAttribute('attribute', 'rotation');
        animationEl.setAttribute('from', '45 45 45');
        animationEl.setAttribute('to', '45 405 45');
        animationEl.setAttribute('repeat', 'indefinite');
        animationEl.setAttribute('dur', '4500');
        animationEl.setAttribute('easing', 'linear');
        el.appendChild(animationEl);
        this.el.appendChild(el);
    },
});