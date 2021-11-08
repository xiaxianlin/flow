import { Circle, Group, Rect, Text } from 'zrender'
import { V_RADIUS } from '../constant'
import { VertexType } from '../constant/vertex'
import { ITheme, IVertexAttribute } from '../interface'
import BaseView from './base'

class Process extends BaseView {
    private background: Rect
    private text: Text
    private icon: Text

    setText() {
        let { text, width, height } = this.attribute
        let { vertex } = this.theme
        // 单行文本
        if (typeof text === 'string') {
            this.text = new Text({
                style: { x: width / 2, y: height / 2, text, fill: vertex.text, align: 'center', verticalAlign: 'middle' },
            })
        }
        this.group.add(this.text)
    }

    setTypeIcon() {
        let { vertex } = this.theme
        let { icon } = this.attribute
        if (!icon) return
        this.icon = icon
        this.icon.attr({ style: { fill: vertex.text } })
        this.group.add(this.icon)
    }

    setBackground() {
        let { width, height } = this.attribute
        let { border, background } = this.theme.vertex
        this.background = new Rect({
            shape: { x: 0, y: 0, r: V_RADIUS, width, height },
            style: { stroke: border, fill: background },
        })
        this.group.add(this.background)
    }

    render() {
        this.setBackground()
        this.setTypeIcon()
        this.setConnectors()
        this.setText()
        return this.group
    }
}

export default Process
