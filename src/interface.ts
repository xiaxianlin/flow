import { ElementEvent } from 'zrender'
import { VertexStatus } from './constant/vertex'
import { RenderType, TEvent, TEvents, TStyle, TVertexButtonProp, TVertextShape } from './type'

export interface IContainer {
    setActive(model: IVertexModel): void
    setDragTarget(model: IVertexModel, evt: ElementEvent): void
    on(events: TEvents): void
}

export interface IGraph {
    addVertex(v: IVertexModel): void
    getVertex(id: string): IVertexModel
}

export interface IModel {
    render(): RenderType
    setContainer(container: IContainer): void
}
export interface IVertexModel extends IModel {
    id: string
    isGroup: boolean

    setStatus(status: VertexStatus): void
    setButtons(buttons: TVertexButtonProp[]): void
    setShape(shape: TVertextShape): void
    setGroup(group: IVertexModel): void

    getShape(): TVertextShape
    getGroup(): IVertexModel
    getView(): RenderType

    add(child: IVertexModel): void
    remove(child: IVertexModel): void

    /**
     * 判断元素是否在父元素视图内
     */
    inView(): boolean
}
export interface IEdgeModel extends IModel {}

export interface IView {
    setModel(model: IModel): void
    setStyle(style: TStyle): void
    setShape(shape: TVertextShape): void
    setButtonStyle(style: TStyle): void
    setEvents(events: TEvent[]): void
    setButtons(buttons: TVertexButtonProp[]): void

    getView(): RenderType

    showButtonLayer(): void
    hideButtonLayer(): void

    add(view: RenderType): void
    render(): RenderType
    update(): void
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
