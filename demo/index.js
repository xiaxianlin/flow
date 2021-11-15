const flow = new Flow(document.getElementById('container'), window.innerWidth, window.innerHeight)
console.log(flow)

let actionIcon = Flow.createIcon('iconfont', '\ue7b8')
let worlfowIcon = Flow.createIcon('iconfont', '\ue800')
let manualIcon = Flow.createIcon('iconfont', '\ue981')
let taskIcon = Flow.createIcon('iconfont', '\ue96d')
let groupIcon = Flow.createIcon('iconfont', '\uea87')
let autoIcon = Flow.createIcon('iconfont', '\ueb34')

let quickButtons = {
    type: 'outer',
    buttons: [
        {
            icon: taskIcon,
            handler: () => {
                console.log('create task')
            },
        },
        {
            icon: manualIcon,
            handler: () => {
                console.log('create manual')
            },
        },
        {
            icon: groupIcon,
            handler: () => {
                console.log('create group')
            },
        },
    ],
}

flow.addVertex('event', { x: 500, y: 100, text: '开始' }, quickButtons)
flow.addVertex('event', { x: 500, y: 300, text: '结束' }, quickButtons)

flow.addVertex('process', { x: 100, y: 100, text: '测试01', icon: actionIcon }, quickButtons)
flow.addVertex('process', { x: 100, y: 300, text: 'echo执行目标为节点输出', icon: worlfowIcon }, quickButtons)
flow.addVertex('process', { x: 300, y: 300, text: '执行目标为节点输出执行目标为节点输出执行目标为节点输出', icon: manualIcon }, quickButtons)

flow.addVertex('confluence', { x: 800, y: 200 }, quickButtons)

flow.addVertex('group', { x: 800, y: 600, text: '任务分组_1', icon: autoIcon }, quickButtons)
