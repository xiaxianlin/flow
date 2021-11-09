const flow = new Flow(document.getElementById('container'), window.innerWidth, window.innerHeight)
console.log(flow)

let actionIcon = flow.createIcon('iconfont', '\ue7b8')
let worlfowIcon = flow.createIcon('iconfont', '\ue800')
let manualIcon = flow.createIcon('iconfont', '\ue981')
let taskIcon = flow.createIcon('iconfont', '\ue96d')
let groupIcon = flow.createIcon('iconfont', '\uea87')

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

flow.addVertex('process', { x: 100, y: 100, text: '测试01', icon: actionIcon }, quickButtons)
flow.addVertex('process', { x: 100, y: 300, text: 'echo执行目标为节点输出', icon: worlfowIcon }, quickButtons)
flow.addVertex('process', { x: 300, y: 300, text: '执行目标为节点输出执行目标为节点输出执行目标为节点输出', icon: manualIcon }, quickButtons)
