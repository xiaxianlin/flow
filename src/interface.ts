import { Group, Text } from 'zrender'
import { VertexButtonType } from './constant/vertex'

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
        button?: {
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

export interface IVertexProps {
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    icon?: Text
}

export type TButton = {
    icon: Text
    handler: (...args: any[]) => void
}

export interface IVertexButtonProps {
    type: VertexButtonType
    buttons: TButton[]
}

export interface IEdge {}

export interface IView {
    setButtons(buttons: IVertexButtonProps): void
    render(): Group
}
