import { Text, Group } from 'zrender'
import { GraphEvent } from './constant/graph'
import { VertexButtonType } from './constant/vertex'

export type RenderType = Group

export type RenderText = Text

export type TPosition = [number, number]

export type TEventHandler = (...args: any[]) => void
/**
 * 按钮
 */
export type TButton = {
    icon: Text
    handler: TEventHandler
}

/**
 * 事件
 */
export type TEvent = {
    name: string
    handler: TEventHandler
}

export type TEvents = {
    [key in GraphEvent]?: (...args: any[]) => void
}

/**
 * 样式
 */
export type TStyle = {
    color?: string
    border?: string
    background?: string
}

/**
 * 主题色
 */
export type TTheme = {
    vertex?: TStyle
    vertexActive?: TStyle
    vertexButton?: TStyle
    vertexConnector?: TStyle
    edge: TStyle
    edgeActive: TStyle
    group: TStyle
    groupHeader: TStyle
    groupItem: TStyle
    groupButton: TStyle
    groupActive: TStyle
    groupActiveHeader: TStyle
}

/**
 * 顶点形状
 */
export type TVertextShape = {
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    icon?: RenderText
    groupable?: boolean
}

/**
 * 顶点按钮属性
 */
export type TVertexButtonProp = {
    type: VertexButtonType
    icon: RenderText
    handler: (...args: any[]) => void
    style?: TStyle
    activeStyle?: TStyle
}

export type TEdgeShape = {
    x?: number
    y?: number
    text?: string
}
