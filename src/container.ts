import { init, Group, ElementEvent, Text, ZRenderType } from 'zrender'
import { DEFAULT_THEME } from './constant'
import { VertexStatus, VertexType } from './constant/vertex'
import Graph from './graph'
import { RenderType, TTheme } from './type'
import { IContainer, IGraph, IVertexButtonProps, IVertexModel, IVertexProps } from './interface'
import VertexModel from './model/Vertex'

class Container implements IContainer {
    private render: ZRenderType
    private theme: TTheme
    private graph: IGraph
    private layer: RenderType
    private active: IVertexModel

    private handleClick(evt: ElementEvent) {
        if (!evt.target && this.active) {
            this.active.setStatus(VertexStatus.NONE)
        }
    }

    constructor(container: HTMLElement, width?: number, height?: number) {
        this.render = init(container, { width, height, renderer: 'svg' })
        this.graph = new Graph()
        this.layer = new Group({ draggable: true, x: 0, y: 0 })
        this.theme = Object.assign({}, DEFAULT_THEME)

        this.render.add(this.layer)

        this.render.on('click', (evt) => this.handleClick(evt))
    }

    setActive(model: IVertexModel): void {
        this.active = model
    }

    /**
     * 设置主题颜色
     * @param theme 主题配置
     */
    settingTheme(theme: TTheme) {
        this.theme = theme
    }

    /**
     * 添加一个顶点
     *
     * @param type 顶点类型
     * @param subType 顶点子类型
     * @param attribute 顶点属性
     * @returns 顶点ID
     */
    addVertex(type: VertexType, attribute?: IVertexProps, buttons?: IVertexButtonProps): string {
        let v = new VertexModel(type, attribute, this.theme)
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

    createIcon(fontFamily: string, text: string, x: number = 12, y: number = 12): Text {
        let icon = new Text({ style: { fontFamily, text, x, y, align: 'center', verticalAlign: 'middle', fontSize: 16 } })
        return icon
    }

    update(id: string) {}
}

export default Container
