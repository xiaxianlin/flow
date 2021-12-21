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
    setButtons(buttons: TVertexButtonProp[]): void
    setStyle(style: TStyle): void
    setShape(shape: TVertextShape): void
    setButtonStyle(style: TStyle): void
    setZ(z: number): void

    getView(): RenderType
    getButtons(): TVertexButtonProp[]

    showButtonLayer(): void
    hideButtonLayer(): void

    add(view: RenderType): void
    remove(view: RenderType): void
    update(): void
    render(): RenderType
}
export interface IProcessView extends IView {
    setInnerButtonStyle(style: TStyle): void
}
export interface IEventView extends IView {}
export interface IConfluenceView extends IView {}
export interface IGroupView extends IView {
    setGroupHeaderStyle(style: TStyle): void
    setGroupButtonStyle(style: TStyle): void
}
export interface IGroupItemView extends IView {
    setInnerButtonStyle(style: TStyle): void
}
