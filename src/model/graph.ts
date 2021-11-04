import Edge from './edge'
import Group from './Group'
import Vertex from './Vertex'

class Graph {
    private x: number = 0
    private y: number = 0
    private scale: number = 1
    private vertices: Map<string, Vertex> = new Map<string, Vertex>()
    private edges: Map<string, Edge> = new Map<string, Edge>()
    private groups: Map<string, Group> = new Map<string, Group>()

    addVertex(v: Vertex, groupId?: string) {
        this.vertices.set(v.id, v)
    }

    addGroup(g: Group) {}

    addEdge(e: Edge) {}
}

export default Graph
