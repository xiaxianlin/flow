const flow = new Flow(document.getElementById('container'), window.innerWidth, window.innerHeight)
console.log(flow)

flow.addVertex('process', 1, { text: '测试' })
