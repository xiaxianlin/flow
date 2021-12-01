import { IEdgeModel, IGraph, IVertexModel } from './interface'
import EdgeModel from './model/edge'
import VertexModel from './model/Vertex'

class Graph implements IGraph {
    private x: number = 0
    private y: number = 0
    private scale: number = 1
    private vertices: Map<string, VertexModel> = new Map<string, VertexModel>()
    private edges: Map<string, EdgeModel> = new Map<string, EdgeModel>()

    addVertex(v: VertexModel, groupId?: string) {
        this.vertices.set(v.id, v)
    }

    removeVertex(v: IVertexModel): void {
        throw new Error('Method not implemented.')
    }

    getVertex(id: string) {
        return this.vertices.get(id)
    }

    addEdge(e: EdgeModel) {}

    removeEdge(e: IEdgeModel): void {
        throw new Error('Method not implemented.')
    }
    getEdge(id: string): IEdgeModel {
        throw new Error('Method not implemented.')
    }
}

export default Graph
