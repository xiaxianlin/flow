const flow = new Flow(document.getElementById('container'), window.innerWidth, window.innerHeight)
console.log(flow)

let actionIcon = flow.createIcon('iconfont', '\ue7b8')
let worlfowIcon = flow.createIcon('iconfont', '\ue800')

flow.addVertex('process', { x: 100, y: 100, text: '测试01', icon: actionIcon })
flow.addVertex('process', { x: 100, y: 300, text: '测试02', icon: worlfowIcon })
