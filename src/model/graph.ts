import * as zrender from 'zrender/src/zrender'
import Edge from './edge'
import Group from './Group'
import Vertex from './Vertex'

class Graph {
    private render: zrender.ZRenderType = null

    private x: number = 0
    private y: number = 0
    private scale: number = 1
    private vertices: Vertex[] = []
    private edges: Edge[] = []
    private groups: Group[] = []

    constructor(render: zrender.ZRenderType) {
        this.render = render
    }
}

export default Graph
