export interface IFlow {
    addVertex(): void
    addEdge(): void
}

export interface IGraph {
    x: string
    y: string
    status: number
    scale: number
    vertices: IVertex[]
    edges: IEdge[]
}

export interface IVertex {}

export interface IEdge {}
