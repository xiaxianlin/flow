import { IGraph } from './interface'
import EdgeModel from './model/edge'
import GroupModel from './model/Group'
import VertexModel from './model/Vertex'

class Graph implements IGraph {
    private x: number = 0
    private y: number = 0
    private scale: number = 1
    private vertices: Map<string, VertexModel> = new Map<string, VertexModel>()
    private edges: Map<string, EdgeModel> = new Map<string, EdgeModel>()
    private groups: Map<string, GroupModel> = new Map<string, GroupModel>()

    addVertex(v: VertexModel, groupId?: string) {
        this.vertices.set(v.id, v)
    }

    addGroup(g: GroupModel) {}

    addEdge(e: EdgeModel) {}
}

export default Graph
