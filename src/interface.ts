import { ElementEvent } from 'zrender'
import { VertexStatus, VertexType } from './constant/vertex'
import { RenderType, TEvent, TEvents, TStyle, TTheme, TVertexButtonProp, TVertextShape } from './type'

export interface IGraph {
    /**
     * 入图
     * @param v 顶点模型
     */
    addVertex(v: IVertexModel): void
    /**
     * 出图
     * @param v 顶点模型
     */
    removeVertex(v: IVertexModel): void
    /**
     * 获取顶点模型
     * @param id
     */
    getVertex(id: string): IVertexModel
    /**
     * 添加边
     * @param e 边模型
     */
    addEdge(e: IEdgeModel): void
    /**
     * 删除边
     * @param e 边模型
     */
    removeEdge(e: IEdgeModel): void
    /**
     * 获取边
     */
    getEdge(id: string): IEdgeModel

    allVertices(): IVertexModel[]
}

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

export interface IModel {
    /**
     * 渲染顶点
     */
    render(): RenderType
    /**
     * 设置顶点模型的容器
     * @param container 容器
     */
    setContainer(container: IContainer): void
}

export interface IVertexModel extends IModel {
    id: string
    isGroup: boolean
    /**
     * 设置状态
     * @param status 状态
     */
    setStatus(status: VertexStatus): void
    /**
     * 设置按钮
     * @param buttons 按钮集合
     */
    setButtons(buttons: TVertexButtonProp[]): void
    /**
     * 设置图形信息
     * @param shape 图形信息
     */
    setShape(shape: TVertextShape): void
    /**
     * 设置顶点的分组模型
     * @param group 分组模型
     */
    setGroup(group: IVertexModel): void
    /**
     * 设置模型类型
     * @param type 模型类型
     */
    setType(type: VertexType): void
    /**
     * 设置z值
     * @param z 层级
     */
    setZ(z: number): void
    /**
     * 获取顶点的shape信息
     */
    getShape(): TVertextShape
    /**
     * 获取顶点的分组对象
     */
    getGroup(): IVertexModel
    /**
     * 获取视图对象
     */
    getView(): RenderType
    /**
     * 添加子元素
     * @param child 子元素
     */
    add(child: IVertexModel): void
    /**
     * 删除子元素
     * @param child 子元素
     */
    remove(child: IVertexModel): void
    /**
     * 判断元素是否在父元素视图内
     */
    inView(): boolean
}

export interface IEdgeModel extends IModel {}

export interface IView {
    /**
     * 设置视图所在的顶点模型
     * @param model 顶点模型
     */
    setModel(model: IModel): void
    /**
     * 设置事件
     * @param events 事件集合
     */
    setEvents(events: TEvent[]): void
    /**
     * 设置按钮
     * @param buttons 按钮信息
     */
    setButtons(buttons: TVertexButtonProp[]): void
    /**
     * 设置样式信息
     * @param style 样式信息
     */
    setStyle(style: TStyle): void
    /**
     * 设置图形信息
     * @param shape 图形信息
     */
    setShape(shape: TVertextShape): void
    /**
     * 设置按钮样式信息
     * @param style 样式信息
     */
    setButtonStyle(style: TStyle): void
    /**
     * 设置z值
     * @param z 层级
     */
    setZ(z: number): void
    /**
     * 获取视图
     */
    getView(): RenderType
    /**
     * 获取按钮
     */
    getButtons(): TVertexButtonProp[]
    /**
     * 显示按钮层
     */
    showButtonLayer(): void
    /**
     * 隐藏按钮层
     */
    hideButtonLayer(): void
    /**
     * 添加子视图
     * @param view 子视图
     */
    add(view: RenderType): void
    /**
     * 删除子视图
     * @param view 子视图
     */
    remove(view: RenderType): void
    /**
     * 更新视图
     */
    update(): void
    /**
     * 渲染视图
     */
    render(): RenderType
}
export interface IProcessView extends IView {
    /**
     * 设置内部按钮样式
     * @param style 样式信息
     */
    setInnerButtonStyle(style: TStyle): void
}
export interface IEventView extends IView {}
export interface IConfluenceView extends IView {}
export interface IGroupView extends IView {
    /**
     * 设置分组头部样式
     * @param style 样式信息
     */
    setGroupHeaderStyle(style: TStyle): void
    /**
     * 设置分组按钮样式
     * @param style 样式信息
     */
    setGroupButtonStyle(style: TStyle): void
}
export interface IGroupItemView extends IView {
    /**
     * 设置分组项视图内部按钮样式
     * @param style 样式信息
     */
    setInnerButtonStyle(style: TStyle): void
}
