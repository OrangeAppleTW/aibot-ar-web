/**
 * 初始化網格平面
 * 提供方法操控網格上的物件
 * 初始化關卡
 * 操控角色
 */
AFRAME.registerComponent('grid', {

    schema: {
        row: { type: 'number', default: 5 }, // 長 x 個格子
        col: { type: 'number' , default: 5 }, // 高 z 個格子
        offsetX: { type: 'number', default: 0 },
        offsetZ: { type: 'number', default: 0 },
    },

    init: function () {
        // 每次完成指令後執行，判斷是否完成關卡
        this.checker = undefined;

        // 存放網格上的物件
        this.grid = {}

        // 事件監聽
        this.eventPool = {
            execFail: [], // 指令執行失敗
            execDone: [], // 指令執行完成
            success: [], // 完成關卡
            message: [], // 遊戲訊息
        }

        // 角色索蒐集到的物品
        this.backpack = [];

        // 可被蒐集的物品名稱
        this.items = [];

        this.resetEl();
    },

    resetEl: function () {

        // 操控的角色
        this.player = this.el.querySelector('[player]');
        let pos = this.player.getAttribute('pos');
        this.playerPos = {
            x: Number(pos.split(' ')[0]),
            z: Number(pos.split(' ')[1]),
        }

        this.html = this.el.cloneNode(true);

        setTimeout(()=> {
            this.createGrid(); // 初始化地板
            this.initialPos(); // 初始化物品的位置
            
            this.addEvent('execDone', () => {
                if (this.checker) this.checker();
            });
    
            this.el.querySelectorAll('[item]').forEach((el) => {
                let attr = el.getAttribute('item')
                if (attr['name']) this.items.push(attr['name']);
            });
        }, 300);

        
    },

    // 初始化網格地板
    createGrid: function () {
        
        let row = this.data.row;
        let col = this.data.col;
        let offsetX = this.data.offsetX;
        let offsetZ = this.data.offsetZ;

        // 網格線水平於 Y 軸
        for (let i = 0; i <= row; i++) {
            this.el.setAttribute(`line__row_${i}`, `start: ${i + offsetX} 0.01 ${0 + offsetZ}; end: ${i + offsetX} 0.01 ${-col + offsetZ}; color: #555;`);
        }
        // 網格線水平於 X 軸
        for (let i = 0; i <= col; i++) {
            this.el.setAttribute(`line__col_${i}`, `start: ${0 + offsetX} 0.01 ${-i + offsetZ}; end: ${row + offsetX} 0.01 ${-i + offsetZ}; color: #555;`);
        }
        // 網格的方塊面
        for (let x = 0; x < row; x++) {
            for (let y = 0; y < col; y++) {
                // let box = document.createElement('a-box');
                // box.setAttribute('position', `${x + 0.5 + offsetX} 0 ${-y - 0.5 + offsetZ}`);
                // box.setAttribute('color', (x + y)%2 === 0 ? '#333' : '#222');
                // box.setAttribute('height', 0.02);
                // this.el.parentElement.appendChild(box);
            }
            // 初始化 grid 物件，用來存放物品
            this.grid[x] = {};
        }
    },

    // 將網格內的物件放置到正確的座標
    initialPos: function () {
        let instance = this;
        this.el.querySelectorAll('[pos]').forEach((el) => {
            this.initialPosOf(el);
        });
    },

    initialPosOf: function (el) {
        let pos = el.getAttribute('pos');
        let x = Number(pos.split(' ')[0]);
        let z = Number(pos.split(' ')[1]);
        let toward = Number(pos.split(' ')[2]) || 0;
        el.setAttribute('position', `${x + 0.5} 0.5 ${-z - 0.5}`);
        el.setAttribute('rotation', `0 ${toward} 0`);
        // 玩家角色不會儲存在 grid 中
        if (el !== this.player) this.grid[x][z] = el;
    },

    // Runner 執行指令的介面操控 player
    exec: function (cmd, data) {
        if (cmd === 'stepForward') return this.stepForward(1);
        if (cmd === 'stepBack') return this.stepForward(-1);
        if (cmd === 'turnRight') return this.turnRight();
        if (cmd === 'turnLeft') return this.turnLeft();
        if (cmd === 'check') return this.check(data);
        if (cmd === 'pickup') return this.pickup();
        if (cmd === 'drop') return this.drop();

        console.error(`exec: \`${cmd}\` not accepted`);
    },

    stepForward: function (step) {
        let offsetX = 0;
        let offsetZ = 0;
        let rotationY = this.player.components.rotation.data.y;
        rotationY = rotationY%360;
        if (rotationY < 0) rotationY += 360;
        if (rotationY === 0) offsetZ = step; // 向下移動
        if (rotationY === 90) offsetX = -step; // 向左移動
        if (rotationY=== 180) offsetZ = -step; // 向上移動
        if (rotationY=== 270) offsetX = step; // 向右移動

        console.log(rotationY)

        this.playerPos.x += offsetX;
        this.playerPos.z += offsetZ;
        // 移動超出邊界，發出指令錯誤訊息
        if (this.playerPos.x < 0 || this.playerPos.x > this.data.row - 1 || 
            this.playerPos.z < 0 || this.playerPos.z > this.data.col - 1 ){
            this.emit('execFail');
        }

        this.trigger(this.playerPos.x, this.playerPos.z, 'beforeActive');
        this.positionAnimate(this.player, offsetX, offsetZ, () => {
            this.trigger(this.playerPos.x, this.playerPos.z, 'active');
            this.emit('execDone');
        });
    },

    turnRight: function () {
        this.rotationYAnimate(this.player, -90, ()=> this.emit('execDone'));
    },

    turnLeft: function () {
        this.rotationYAnimate(this.player, 90, ()=> this.emit('execDone'));
    },

    // player 角色旋轉的動畫
    rotationYAnimate: function (target, offsetRotationY, callback) {
        let el = document.createElement('a-animation');
        let rot = target.components.rotation.data;
        el.setAttribute('attribute','rotation');
        el.setAttribute('dur','300');
        el.setAttribute('to',`${rot.x} ${rot.y + offsetRotationY} ${rot.z}`);
        target.appendChild(el);

        el.addEventListener('animationend', () => {
            callback();
            target.removeChild(el);
        });
    },
    
    // player 角色移動的動畫
    positionAnimate: function (target, offsetX, offsetZ, callback) {
        let el = document.createElement('a-animation');
        let pos = target.object3D.position;
        el.setAttribute('attribute','position');
        el.setAttribute('dur','300');
        el.setAttribute('to',`${pos.x + offsetX} ${pos.y} ${pos.z - offsetZ}`);
        target.appendChild(el);

        el.addEventListener('animationend', () => {
            target.removeChild(el);
            if (callback) callback();
        });
    },

    check: function (item) {
        let pos = this.playerPos;
        if (this.grid[pos.x] && this.grid[pos.x][pos.z]) {
            return this.grid[pos.x][pos.z].components.item.data.name === item;
        }
        return false;
    },

    pickup: function () {
        setTimeout(()=>{
            this.trigger(this.playerPos.x, this.playerPos.z, 'pickup');
            this.emit('execDone');
        },300);
    },

    drop: function () {
        let pos = this.playerPos;
        let obj = this.backpack[this.backpack.length - 1];

        if (this.grid[pos.x] && this.grid[pos.x][pos.z]) {
            this.trigger(this.playerPos.x, this.playerPos.z, 'drop');
        } else {
            let el = document.createElement('a-entity');
            el.setAttribute('pos', `${this.playerPos.x} ${this.playerPos.z}`);
            el.setAttribute('item', `name: ${obj.name}`);
            el.setAttribute('geometry', 'primitive: box');
            el.setAttribute('id', 'test');
            el.setAttribute('material', `color: ${obj.color}`);
            this.el.appendChild(el);
            this.initialPosOf(el);
            this.backpack.pop();
        }

        setTimeout(() => {
            this.emit('execDone');
        }, 300);
    },

    // 觸發執行 x,y 格子上物品的函式
    trigger: function (x, z, method) {
        if (this.grid[x] === undefined || this.grid[x][z] === undefined) return;
        if (typeof this.grid[x][z][method] === 'function') this.grid[x][z][method](this);
    },

    // 執行指令後動畫完成回傳事件
    // 內容有成功 or 失敗 or 繼續
    // 給 runner 監聽
    // fail 玩家指令執行失敗，撞到石頭等等
    // done 完成一個指令，下一個指令
    // success 完成關卡
    // message 顯示文字，「獲取黃色鑰匙」、「打開寶箱」、「傳送到 XX 位置」
    addEvent: function (eventName, func) {
        this.eventPool[eventName].push(func);
    },

    // 觸發事件
    emit: function (eventName, data) {
        this.eventPool[eventName].forEach((func) => func(data));
    },

    // 重置遊戲關卡
    // 刪除所有元素再新增回去，這樣方便展示開始動畫
    reset: function () {
        this.backpack = [];
        this.el.innerHTML = '';
        while (this.html.childNodes.length > 0) {
            this.el.appendChild(this.html.childNodes[0]);
        }
        this.resetEl();
    },

    // 設定獲勝判斷函式
    setChecker: function (func) {
        this.checker = func;
    },
});