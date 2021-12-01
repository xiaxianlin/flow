import { init, ZRenderType, ElementEvent, Text, Group } from 'zrender'
import { DEFAULT_THEME, V_HEIGHT, V_WIDTH } from './constant'
import { VertexStatus, VertexType } from './constant/vertex'
import Graph from './graph'
import { RenderType, TEvents, TPosition, TTheme, TVertexButtonProp, TVertextShape } from './type'
import { IContainer, IGraph, IVertexModel } from './interface'
import VertexModel from './model/Vertex'
import { GraphEvent, MoveType } from './constant/graph'

class Container implements IContainer {
    static createIcon(fontFamily: string, text: string, x: number = 12, y: number = 12): Text {
        let icon = new Text({ style: { fontFamily, text, x, y, align: 'center', verticalAlign: 'middle', fontSize: 16 } })
        return icon
    }

    private render: ZRenderType
    private theme: TTheme
    private graph: IGraph
    private layer: RenderType
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
        if (!group) return

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
    }

    private inGroup() {}

    private handleClick(evt: ElementEvent) {
        if (!evt.target && !!this.active) {
            this.active.setStatus(VertexStatus.NONE)
            this.active = null
        }
    }

    private handleDrop(evt: ElementEvent) {
        let { offsetX, offsetY } = evt
        if (this.moveType === MoveType.DRAG) {
            let [sx, sy] = this.dragStartPosition

            // 更新元素位置
            let { x, y } = this.dragTarget.getShape()
            this.dragTarget.setShape({ x: x + offsetX - sx, y: y + offsetY - sy })

            this.outGroup([x, y])
        }

        this.moveType = null
        this.dragTarget = null
    }

    constructor(container: HTMLElement, width?: number, height?: number) {
        this.render = init(container, { width, height, renderer: 'svg' })
        this.graph = new Graph()
        this.layer = new Group({ draggable: true, x: 0, y: 0 })
        this.theme = Object.assign({}, DEFAULT_THEME)

        this.render.add(this.layer)

        this.render.on('click', (evt) => this.handleClick(evt))
        this.render.on('drop', (evt) => this.handleDrop(evt))
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

    on(events: TEvents): void {}
}

export default Container
