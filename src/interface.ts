import { ElementEvent } from 'zrender'
import { VertexStatus, VertexType } from './constant/vertex'
import { RenderType, TEvent, TEvents, TStyle, TTheme, TVertexButtonProp, TVertextShape } from './type'

export interface IContainer {
    /**
     * 设置活跃顶点
     * @param model 顶点模型
     */
    setActive(model: IVertexModel): void
    /**
     * 设置拖拽对象
     * @param model 顶点模型
     * @param evt 事件对象
     */
    setDragTarget(model: IVertexModel, evt: ElementEvent): void
    /**
     * 设置主题颜色
     * @param theme 主题配置
     */
    settingTheme(theme: TTheme): void
    /**
     * 添加一个顶点
     * @param type 顶点类型
     * @param subType 顶点子类型
     * @param shape 顶点属性
     * @returns 顶点ID
     */
    addVertex(type: VertexType, shape?: TVertextShape, buttons?: TVertexButtonProp[]): string
    /**
     * 给分组添加一个子元素
     * @param id 分组id
     * @param shape 图形信息
     * @param buttons 按钮信息
     * @returns 子元素id
     */
    addGroupItem(id: string, shape?: TVertextShape, buttons?: TVertexButtonProp[]): void
    /**
     * 注册事件
     * @param events 事件集
     */
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
    remove(view: RenderType): void
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
