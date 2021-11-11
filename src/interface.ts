import { VertexButtonType, VertexStatus } from './constant/vertex'
import { RenderText, RenderType, TButton, TEvent, TStyle } from './type'

export interface IContainer {
    setActive(model: IVertexModel): void
}

export interface IGraph {
    addVertex(v: IVertexModel): void
}

export interface IModel {
    render(): RenderType
    setContainer(container: IContainer): void
}

export interface IVertexModel extends IModel {
    setStatus(status: VertexStatus): void
}

export interface IEdgeModel extends IModel {}

export interface IView {
    setModel(model: IModel): void
    setStyle(style: TStyle): void
    setButtons(buttons: IVertexButtonProps): void
    setEvents(events: TEvent[]): void
    render(styles?: TStyle[]): RenderType
    showButtonLayer(): void
    hideButtonLayer(): void
}

export interface IProcessView extends IView {}
export interface IEventView extends IView {}
export interface IConfluenceView extends IView {}

export interface IVertexProps {
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    icon?: RenderText
}

export interface IVertexButtonProps {
    type: VertexButtonType
    buttons: TButton[]
}
