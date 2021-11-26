import { IGraph } from './interface'
import EdgeModel from './entity/edge'
import VertexModel from './entity/Vertex'

class Graph implements IGraph {
    private x: number = 0
    private y: number = 0
    private scale: number = 1
    private vertices: Map<string, VertexModel> = new Map<string, VertexModel>()
    private edges: Map<string, EdgeModel> = new Map<string, EdgeModel>()

    addVertex(v: VertexModel, groupId?: string) {
        this.vertices.set(v.id, v)
    }

    getVertex(id: string) {
        return this.vertices.get(id)
    }

    addEdge(e: EdgeModel) {}
}

export default Graph
