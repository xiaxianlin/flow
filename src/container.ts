import { init, ZRenderType, ElementEvent, Text, Group } from 'zrender'
import { DEFAULT_THEME, V_HEIGHT, V_WIDTH } from './constant'
import { VertexStatus, VertexType } from './constant/vertex'
import Graph from './graph'
import { RenderType, TEdgeShape, TEventHandler, TEvents, TPosition, TTheme, TVertexButtonProp, TVertextShape } from './type'
import { IContainer, IGraph, IVertexModel } from './interface'
import VertexModel from './model/Vertex'
import { GraphEvent, MoveType, Position } from './constant/graph'
import { getCoveredVertices } from './logic/vertex'
import EdgeModel from './model/edge'

class Container implements IContainer {
    /**
     * 生成图标
     * @param fontFamily 字体
     * @param text 内容
     * @param x x轴
     * @param y y轴
     * @returns 返回图标视图
     */
    static createIcon(fontFamily: string, text: string, x: number = 12, y: number = 12): Text {
        let icon = new Text({ style: { fontFamily, text, x, y, align: 'center', verticalAlign: 'middle', fontSize: 16 } })
        return icon
    }

    private render: ZRenderType
    private theme: TTheme
    private graph: IGraph
    private layer: RenderType
    private events: Map<GraphEvent, TEventHandler>
    private active: IVertexModel
    private moveType: MoveType

    private dragTarget: IVertexModel
    private dragStartPosition: TPosition

    /**
     * 子元素出组
     * @param origin 元素初始位置
     */
    private outGroup(origin: TPosition) {
        // 分组子元素
        let group = this.dragTarget.getGroup()
        if (!group) return false

        let inView = this.dragTarget.inView()
        // 如果还在内部，则恢复原始位置
        if (inView) {
            let [x, y] = origin
            this.dragTarget.setShape({ x, y })
        } else {
            let gshape = group.getShape()
            let cshape = this.dragTarget.getShape()
            group.remove(this.dragTarget)
            // 修改为普通元素
            this.dragTarget.setShape({ ...cshape, x: gshape.x + cshape.x, y: gshape.y + cshape.y, width: V_WIDTH, height: V_HEIGHT })
            this.dragTarget.setGroup(null)
            this.dragTarget.setType(VertexType.PROCESS)
            // 入图
            this.graph.addVertex(this.dragTarget)
            // 渲染视图
            this.layer.add(this.dragTarget.render())
        }
        return true
    }

    private inGroup() {
        if (this.dragTarget.type !== VertexType.PROCESS) return false
        if (!this.dragTarget.getShape().groupable) return false

        let shape = this.dragTarget.getBoundingRect()
        let vertices = this.graph.allVertices().filter((v) => v !== this.dragTarget)
        let coveredGroups = getCoveredVertices(shape, vertices).filter((v) => v.type === VertexType.GROUP)
        if (coveredGroups.length === 0) return false

        // 从外层移除
        this.graph.removeVertex(this.dragTarget)
        this.layer.remove(this.dragTarget.getView())

        // 移动进组
        let group = coveredGroups[0]
        this.dragTarget.setGroup(group)
        this.dragTarget.setType(VertexType.GROUP_ITEM)
        group.add(this.dragTarget)
        return true
    }

    private handleClick(evt: ElementEvent) {
        if (!evt.target && !!this.active) {
            this.setActive(null)
        }
        this.fire(GraphEvent.CLICK, this.active)
    }

    private handleDoubleClick(evt: ElementEvent) {
        // this.fire(GraphEvent.DBCLICK, this.active)
    }

    private handleDrop(evt: ElementEvent) {
        let { offsetX, offsetY } = evt
        if (this.moveType === MoveType.DRAG) {
            let [sx, sy] = this.dragStartPosition

            // 更新元素位置
            let { x, y } = this.dragTarget.getShape()
            this.dragTarget.setShape({ x: x + offsetX - sx, y: y + offsetY - sy })
            // 入组和出组都是在方法里面判断
            this.outGroup([x, y])
            this.inGroup()
        }

        this.moveType = null
        this.dragTarget = null
    }

    private handleMoveMove(evt: ElementEvent) {}

    constructor(container: HTMLElement, width?: number, height?: number) {
        this.render = init(container, { width, height, renderer: 'react' })
        this.graph = new Graph()
        this.layer = new Group({ x: 0, y: 0 })
        this.theme = Object.assign({}, DEFAULT_THEME)
        this.events = new Map()

        this.render.add(this.layer)

        this.render.on('click', (evt) => this.handleClick(evt))
        this.render.on('dblclick', (evt) => this.handleDoubleClick(evt))
        this.render.on('drop', (evt) => this.handleDrop(evt))
        this.render.on('mousemove', (evt) => this.handleMoveMove(evt))
    }

    setActive(model: IVertexModel): void {
        if (this.active) {
            this.active.setStatus(VertexStatus.NONE)
        }
        this.active = model
    }

    setDragTarget(model: IVertexModel, evt: ElementEvent): void {
        this.moveType = MoveType.DRAG
        this.dragTarget = model
        this.dragStartPosition = [evt.offsetX, evt.offsetY]

        let fitlerModel = model
        if (this.dragTarget.getGroup()) {
            fitlerModel = this.dragTarget.getGroup()
        }
        fitlerModel.setZ(1)
        // 降低其他元素层级
        this.graph
            .allVertices()
            .filter((v) => v !== fitlerModel)
            .forEach((v) => v.setZ(0))
    }

    settingTheme(theme: TTheme): void {
        this.theme = theme
    }

    addVertex(type: VertexType, shape?: TVertextShape, buttons?: TVertexButtonProp[]): string {
        let v: IVertexModel = new VertexModel(type, shape, this.theme)
        v.setContainer(this)
        if (buttons) {
            v.setButtons(buttons)
        }
        // 入图
        this.graph.addVertex(v)
        // 渲染视图
        this.layer.add(v.render())
        return v.id
    }

    addGroupItem(id: string, shape?: TVertextShape, buttons?: TVertexButtonProp[]) {
        let v = this.graph.getVertex(id)
        if (!v.isGroup) return
        let i: IVertexModel = new VertexModel(VertexType.GROUP_ITEM, shape, this.theme)
        i.setContainer(this)
        if (buttons) {
            i.setButtons(buttons)
        }
        v.add(i)
        i.setGroup(v)
        return i.id
    }

    addEdge(startId: string, startPosition: Position, endId: string, endPosition: Position, shape: TEdgeShape) {
        let vStart = this.graph.getVertex(startId)
        let vEnd = this.graph.getVertex(endId)
        if (!vStart || !vEnd) return

        let e = new EdgeModel(shape, this.theme)
        e.setContainer(this)
        e.setSource(vStart, startPosition)
        e.setTarget(vEnd, endPosition)

        vStart.addEdge(e)
        vEnd.addEdge(e)

        this.graph.addEdge(e)
        this.layer.add(e.render())

        return e.id
    }

    on(name: GraphEvent, fn: TEventHandler): void {
        this.events.set(name, fn)
    }

    off(name: GraphEvent): void {
        this.events.delete(name)
    }

    fire(name: GraphEvent, ...args: any[]): void {
        if (!this.events.has(name)) return

        let handler = this.events.get(name)
        if (typeof handler === 'function') {
            handler(...args)
        }
    }
}

export default Container
