const flow = new Flow(document.getElementById('container'), window.innerWidth, window.innerHeight)
console.log(flow)

let actionIcon = Flow.createIcon('iconfont', '\ue7b8')
let worlfowIcon = Flow.createIcon('iconfont', '\ue800')
let manualIcon = Flow.createIcon('iconfont', '\ue981')
let taskIcon = Flow.createIcon('iconfont', '\ue96d')
let groupIcon = Flow.createIcon('iconfont', '\uea87')
let autoIcon = Flow.createIcon('iconfont', '\ueb34')
let addIcon = Flow.createIcon('iconfont', '\ue615')
let editIcon = Flow.createIcon('iconfont', '\ue813')

let buttons = [
    { type: 'outer', icon: taskIcon, handler: () => console.log('create task') },
    { type: 'outer', icon: manualIcon, handler: () => console.log('create manual') },
    { type: 'outer', icon: groupIcon, handler: () => console.log('create group') },
]

flow.addVertex('event', { x: 500, y: 100, text: '开始' }, buttons)
flow.addVertex('event', { x: 500, y: 300, text: '结束' }, buttons)

flow.addVertex('process', { x: 100, y: 100, text: '测试01', icon: actionIcon }, buttons)
flow.addVertex('process', { x: 100, y: 300, text: 'echo执行目标为节点输出', icon: worlfowIcon }, buttons)
flow.addVertex('process', { x: 300, y: 300, text: '执行目标为节点输出执行目标为节点输出执行目标为节点输出', icon: manualIcon }, buttons)

flow.addVertex('confluence', { x: 800, y: 200 }, buttons)

let index = 1
let groupButtons = buttons.concat([
    {
        type: 'group',
        icon: addIcon,
        handler: () => {
            console.log('add group item')
            index++
            flow.addGroupItem(gid, { text: '任务' + index, icon: actionIcon })
        },
    },
    { type: 'group', icon: editIcon, handler: () => console.log('edit group') },
])

let gid = flow.addVertex('group', { x: 800, y: 300, text: '任务分组_1', icon: autoIcon }, groupButtons)

flow.addGroupItem(gid, { text: '任务1', icon: actionIcon })
