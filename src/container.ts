import * as zrender from 'zrender'
import Graph from './model/graph'
import Vertex from './model/Vertex'
import Edge from './model/edge'
import Group from './model/group'
import { ITheme, IVertexAttribute } from './interface'
import { VertexType } from './constant/vertex'
import { DEFAULT_THEME } from './constant'
import { Text } from 'zrender'

class Container {
    private render: zrender.ZRenderType = null
    private graph: Graph = null
    private theme: ITheme = null

    constructor(container: HTMLElement, width?: number, height?: number) {
        this.render = zrender.init(container, { width, height, renderer: 'svg' })
        this.graph = new Graph()
        this.theme = Object.assign({}, DEFAULT_THEME)
    }

    /**
     * 设置主题颜色
     * @param theme 主题配置
     */
    settingTheme(theme: ITheme) {
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
    addVertex(type: VertexType, attribute?: IVertexAttribute): string {
        let v = new Vertex(type, attribute, this.theme)
        // 入图
        this.graph.addVertex(v)
        // 获取视图
        let view = v.getView().render()
        // 渲染视图
        this.render.add(view)
        return v.id
    }

    createIcon(fontFamily: string, text: string, x: number = 16, y: number = 16): Text {
        return new Text({ style: { fontFamily, text, x, y, align: 'center', verticalAlign: 'middle', fontSize: 16 } })
    }

    update(id: string) {}
}

export default Container
