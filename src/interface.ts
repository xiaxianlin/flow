import { Group } from 'zrender'

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

/**
 * 主题色
 */
export interface ITheme {
    vertex: {
        text: string
        border: string
        background: string
        active?: {
            text?: string
            border?: string
            background?: string
        }
    }
    connector: {
        border: string
        background: string
    }
    edge: {
        border: string
        active?: {
            border?: string
        }
    }
    group: {
        border: string
        background: string
        header: {
            text: string
            background: string
        }
        button: {
            text: string
            background: string
        }
    }
}

export interface IModel {
    getView(): IView
}

export interface IVertex extends IModel {}

export interface IVertexAttribute {
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string | string[]
}

export interface IEdge {}

export interface IView {
    render(): Group
}
