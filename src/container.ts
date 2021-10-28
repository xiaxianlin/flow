import * as zrender from 'zrender/src/zrender'
import CanvasPainter from 'zrender/src/canvas/Painter'
import Graph from './model/graph'
import { Group } from 'zrender'
import Vertex from './model/Vertex'
import Edge from './model/edge'

class Container {
    private render: zrender.ZRenderType = null
    private graph: Graph = null

    constructor(container: HTMLElement, width?: number, height?: number) {
        zrender.registerPainter('canvas', CanvasPainter)
        this.render = zrender.init(container, { width, height })
        this.graph = new Graph(this.render)
    }

    init() {}

    addVertex(v: Vertex) {}

    addGroup(g: Group) {}

    addEdge(e: Edge) {}

    delete(id: string) {}

    draw() {}

    update() {}
}

export default Container
