Vue.component('ib-root', {
    props: ['initialcommands', 'runner'],
    data: function () {
        return {
            mode: 'editing', // pause, playing, editing
            commands: this.initialcommands || [],
            acceptCommands: ['M','B','R','L','J0','?J0'],
        }
    },
    methods: {
        setCommands: function (arr) {
            this.commands = arr;
        },
        addCommand: function (data) {
            console.log(data)
            this.commands.splice(data.idx, 0, data.content);
        },
        removeCommand: function (data) {
            this.commands.splice(data.idx, 1);
        },
        run: function () {
            this.mode = 'playing';
            this.runner.loadScript(this.commands);
            this.runner.runScript();
        },
        pause: function () {
            this.mode = 'pause';
            this.runner.pause();
        },
        edit: function () {
            this.mode = 'editing';
        },
        attachRunner: function (runner) {
            this.runner = runner;
        }
    },
    template: `
        <div>
            <div class="ib-editor-container" v-if="mode === 'editing'">
                <ib-editor :commands="commands"
                           :acceptCommands="acceptCommands"
                           @addCommand="addCommand"
                           @removeCommand="removeCommand"
                ></ib-editor>
                <button @click="run">Run</button>
            </div>
            <div class="ib-runner-container" v-if="mode !== 'editing'">
                <div>
                    <button @click="run" v-if="mode === 'pause'">Run</button>
                    <button @click="edit" v-if="mode === 'pause'">Edit</button>
                    <button @click="pause" v-if="mode === 'playing'">Pause</button>
                </div>
                <ib-runner v-bind:commands="commands"
                           :runner="runner"
                ></ib-runner>
            </div>
        </div>
    `
});

Vue.component('ib-editor', {
    props: ['commands', 'acceptCommands'],
    data: function () {
        return {
            dragging: false,
            selected: undefined,
            cursorPos: {
                top: 0,
                left: 0,
            },
            mouseOn: 0,
        }
    },
    mounted: function () {

        let alwaysFollow = (clientX, clientY) => {
            let b = this.$el.getBoundingClientRect();
            this.cursorPos.top = (clientY - b.y - 25) + 'px';
            this.cursorPos.left = (clientX - b.x - 25) + 'px';
        }

        let stopDragging = (ev) => {
            if (this.dragging && this.mouseOn != -1) {
                let data = {
                    idx: this.mouseOn,
                    content: this.selected,
                }
                this.$emit('addCommand', data);
            }
            this.selected = '';
            this.dragging = false;
        }

        // 拖曳的方塊跟著滑鼠走
        document.addEventListener('mousemove', (e) => {
            alwaysFollow(e.clientX, e.clientY);
        });
        document.addEventListener('touchmove', (e) => {
            alwaysFollow(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });

        document.addEventListener('mouseup', stopDragging);

        document.addEventListener('touchend', stopDragging);
    },
    methods: {

        startDragging: function (ev) {
            this.dragging = true;
            this.selected = ev.content;
            if (ev.index) {
                this.$emit('removeCommand', { idx: ev.index });
            }
        },

        changeContent: function (data) {
            this.$emit('removeCommand', { idx: data.index });
            this.$emit('addCommand', { idx: data.index, content: data.content });
        },

        touchmove: function (ev) {
            this.moving(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
        },

        mousemove: function (e) {
            this.moving(e.x, e.y);
        },

        moving: function (clientX, clientY) {
            clientY += this.$refs.commands.scrollTop;
            let b = this.$refs.commands.getBoundingClientRect();
            let x = Math.floor((clientX - b.x)/60);
            let y = Math.floor((clientY - b.y)/80);
            let row = Math.floor(b.width/60);
            // 超出編輯區方開時不做任何動作
            if (x < 0 || y < 0 || x > row || y > this.commands.length/row) this.mouseOn = -1;
            else this.mouseOn = y*row + x;
        },
    },
    template: `
        <div class="ib-editor" @touchmove="touchmove" @mousemove="mousemove">
            <div ref="commands" :style="{overflowY: dragging ? 'hidden' : 'scroll' }">
                <template v-for="(cmd, idx) in commands">
                    <ib-command v-if="dragging && idx === mouseOn"></ib-command
                    ><ib-command @startDragging="startDragging"
                                 @changeContent="changeContent"
                                 :index="idx"
                                 :content="cmd"
                    ></ib-command>
                </template>
                
                <ib-command class="fake-command" :content="selected" :style="cursorPos" v-if="dragging">
                </ib-command>
            </div>
            <div>
                <ib-command v-for="(cmd, idx) in acceptCommands"
                            @startDragging="startDragging"
                            :content="cmd"
                ></ib-command>
                <ib-dropdown :list="['apple', 'banna', 'orange']"></ib-dropdown>
            </div>
        </div>
    `
});

Vue.component('ib-runner', {
    props: ['commands', 'runner'],
    data: function () {
        return {
            offsetWidth: 0
        }
    },
    mounted: function () {
        this.offsetWidth = this.$el.offsetWidth
    },
    computed: {
        offset: function () {
            let offset = runner.idx*60 - this.offsetWidth + 35;
            return '-' + (offset > 0 ? offset : 0) + 'px';
        }
    },
    template: `
        <div class="ib-runner">
            <div class="ib-runner-scroll" :style="{left: offset}">
                <ib-command v-for="(cmd, idx) in commands"
                            :index="idx"
                            :content="cmd"
                            :class="{active: idx===runner.idx - 1}"
                ></ib-command>
            </div>
        </div>
    `
});

Vue.component('ib-command', {
    props: ['index', 'content'],
    data: function () {
        return {
            isDragging: false,
            setTimeoutID: undefined,
        }
    },
    methods: {
        mousedown: function (index, content) { 
            this.$emit('startDragging', {index: index, content: content});
        }, 

        // 長按 0.2 秒鐘才進入拖曳模式
        touchstart: function (index, content) {
            this.setTimeoutID = setTimeout(() => {
                this.$emit('startDragging', {index: index, content: content});
            }, 200);
        },
        touchmove: function () {
            clearTimeout(this.setTimeoutID);
        },
        touchend: function () {
            this.isDragging = false;
            clearTimeout(this.setTimeoutID);
        },

        click: function () {
            if (this.content[0] === 'J') {
                let target = prompt('跳到？指令');
                this.$emit('changeContent', { index: this.index, content: 'J' + target })
            }
            if (this.content.indexOf('?J') !== -1) {
                let target1 = prompt('存在？物品');    
                let target2 = prompt('跳到？指令');
                this.$emit('changeContent', { index: this.index, content: target1 + '?J' + target2 })
            }
        },
    },
    template: `
        <div class="command"
            @touchstart="touchstart(index, content)"
            @touchmove="touchmove"
            @touchend="touchend"
            @mousedown="mousedown(index, content)"
            
            @click="click"
        >
            <span>{{index}}</span>
            <div class="command-icon">
                <i class="fas fa-arrow-up" v-if="content === 'M'"></i>
                <i class="fas fa-arrow-down" v-else-if="content === 'B'"></i>
                <i class="fas fa-undo-alt" v-else-if="content === 'L'"></i>
                <i class="fas fa-redo-alt" v-else-if="content === 'R'"></i>
                <i class="fas fa-plus" v-else-if="content === '+'"></i>
                <i class="fas fa-minus" v-else-if="content === '-'"></i>
                <span v-else span>{{content || '&nbsp'}}</span>
            </div>
        </div>
    `
});

Vue.component('ib-dropdown', {
    props: ['list'],

    data: function () {
        return {
            style: {
                top: '0px',
                left: '0px'
            }
        }
    },

    methods: {
        click: function (ev) {
            console.log('click: ' + ev);
        }
    },

    template: `
        <div class="dropdown" :style="style">
            <div>
                <div v-for="item in list" @click="click(item)">
                    {{item}}
                </div>
            </div>
        </div>
    `
})