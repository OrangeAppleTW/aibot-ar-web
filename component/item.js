/**
 * 物品
 * 自動觸發：傳送訊息「找到 X 物品啦！」
 * 主動觸發：傳送訊息「取得 X 物品」、將物品新增到背包中
 * 
 * 取得、放下、數量
 * 
 */
AFRAME.registerComponent('item', {   
    schema: {
        name: { type: 'string', default: 'undefined' },
        count: { type: 'number', default: 1 },
    },
    
    init: function () {
        this.el.active = this.active.bind(this);
        this.el.pickup = this.pickup.bind(this);
        this.el.drop = this.drop.bind(this);

        // 元素頭上的數字
        let el = document.createElement('a-text');
        el.setAttribute('value', this.data.count);
        el.setAttribute('position', '0 1 0');
        el.setAttribute('color', '#fff');
        el.setAttribute('scale', '5 5 5');
        el.setAttribute('align', 'center');
        this.el.appendChild(el);
    },
    
    active: function (sys) {
        sys.emit('message', `找到${this.data.name}物品！`);
    },
    
    pickup: function (sys) {
        this.data.count -= 1;
        if (this.data.count <= 0) {
            this.el.parentElement.removeChild(this.el);
            // its suck need rewrite
            let pos = sys.playerPos;
            sys.grid[pos.x][pos.z] = undefined;
        }

        sys.emit('message', `取得${this.data.name}物品`);
        sys.backpack.push({
            name: this.data.name,
            color: 'orange',
        });

        this.el.querySelector('a-text').setAttribute('value', this.data.count);
    },

    drop: function (sys) {
        let obj = sys.backpack.pop();
        if (this.data.name === obj.name) {
            this.data.count += 1;
            this.el.querySelector('a-text').setAttribute('value', this.data.count);
        } else {
            sys.emit('message', '不同物品不能放置在相同的格子內！');
            sys.emit('execFail');
        }
    },
});