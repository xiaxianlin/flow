import { Group, Rect, Text } from 'zrender'
import { V_RADIUS } from '../constant'
import { VertexType } from '../constant/vertex'
import { ITheme, IVertexAttribute, IView } from '../interface'

class Process implements IView {
    private group: Group
    private attribute: IVertexAttribute
    private theme: ITheme

    constructor(type: VertexType, attribute: IVertexAttribute, theme: ITheme) {
        this.group = new Group()
        this.attribute = attribute
        this.theme = theme
    }

    text() {
        let { text, width, height } = this.attribute
        let { vertex } = this.theme
        // 单行文本
        if (typeof text === 'string') {
            let view = new Text({
                style: { x: width / 2, y: height / 2, text, fill: vertex.text, align: 'center', verticalAlign: 'middle' },
            })
            this.group.add(view)
        }
    }

    icon() {}

    connectors() {}

    background() {
        let { width, height } = this.attribute
        let { border, background } = this.theme.vertex
        let view = new Rect({
            shape: { x: 0, y: 0, r: V_RADIUS, width, height },
            style: { stroke: border, fill: background },
        })
        this.group.add(view)
    }

    render() {
        this.background()
        this.text()
        return this.group
    }
}

export default Process
