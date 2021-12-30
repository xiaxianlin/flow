import { BoundingRect, ElementEvent } from 'zrender'
import { GraphEvent, Position } from './constant/graph'
import { VertexStatus, VertexType } from './constant/vertex'
import { RenderType, TEvent, TEventHandler, TEvents, TPosition, TStyle, TTheme, TVertexButtonProp, TVertextShape } from './type'

export interface IGraph {
    addVertex(v: IVertexModel): void
    removeVertex(v: IVertexModel): void
    getVertex(id: string): IVertexModel
    addEdge(e: IEdgeModel): void
    removeEdge(e: IEdgeModel): void
    getEdge(id: string): IEdgeModel
    allVertices(): IVertexModel[]
}

export interface IContainer {
    setActive(model: IVertexModel): void
    setDragTarget(model: IVertexModel, evt: ElementEvent): void
    settingTheme(theme: TTheme): void
    addVertex(type: VertexType, shape?: TVertextShape, buttons?: TVertexButtonProp[]): string
    addGroupItem(id: string, shape?: TVertextShape, buttons?: TVertexButtonProp[]): void
    on(name: GraphEvent, fn: TEventHandler): void
    off(name: GraphEvent): void
    fire(name: GraphEvent, ...args: any[]): void
}

export interface IModel {
    render(): RenderType
    setContainer(container: IContainer): void
}

export interface IVertexModel extends IModel {
    id: string
    type: VertexType
    isGroup: boolean

    setStatus(status: VertexStatus): void
    setButtons(buttons: TVertexButtonProp[]): void
    setShape(shape: TVertextShape): void
    setGroup(group: IVertexModel): void
    setType(type: VertexType): void
    setZ(z: number): void

    getShape(): TVertextShape
    getGroup(): IVertexModel
    getView(): RenderType
    getBoundingRect(): BoundingRect
    getConnectorPosition(pos: Position): TPosition

    addEdge(edge: IEdgeModel): void
    removeEdge(edge: IEdgeModel): void

    add(child: IVertexModel): void
    remove(child: IVertexModel): void
    inView(): boolean
}

export interface IEdgeModel extends IModel {
    setSource(source: IVertexModel, connectorPosition: Position): void
    setTarget(target: IVertexModel, connectorPosition: Position): void

    getSource(): [IVertexModel, Position]
    getTarget(): [IVertexModel, Position]
}

export interface IView {
    setModel(model: IModel): void
    setEvents(events: TEvent[]): void
    setStyle(style: TStyle): void
    setShape(shape: TVertextShape): void

    getView(): RenderType

    update(): void
    render(): RenderType
}

export interface IVertexView extends IView {
    setButtons(buttons: TVertexButtonProp[]): void
    setButtonStyle(style: TStyle): void
    setZ(z: number): void

    getButtons(): TVertexButtonProp[]

    showButtonLayer(): void
    hideButtonLayer(): void

    add(view: RenderType): void
    remove(view: RenderType): void
}

export interface IProcessView extends IVertexView {
    setInnerButtonStyle(style: TStyle): void
}
export interface IEventView extends IVertexView {}
export interface IConfluenceView extends IVertexView {}
export interface IGroupView extends IVertexView {
    setGroupHeaderStyle(style: TStyle): void
    setGroupButtonStyle(style: TStyle): void
}
export interface IGroupItemView extends IVertexView {
    setInnerButtonStyle(style: TStyle): void
}

export interface IEdgeView extends IView {
    setPoints(points: number[][]): void
}
