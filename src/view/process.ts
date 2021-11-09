import { Circle, Group, Rect, Text, TextStyleProps } from 'zrender'
import { clone } from 'zrender/lib/core/util'
import { FONT_SIZE, V_RADIUS } from '../constant'
import { VertexType } from '../constant/vertex'
import { ITheme, IVertexProps } from '../interface'
import { cutText } from '../logic/vertex'
import BaseView from './base'

class Process extends BaseView {
    private background: Rect

    renderText() {
        let { text, width, height } = this.attribute
        let { vertex } = this.theme
        let lines = cutText(text, FONT_SIZE, width - 40)
        let tStyle: TextStyleProps = { x: width / 2, fill: vertex.text, align: 'center', verticalAlign: 'middle', fontSize: FONT_SIZE }

        let len = lines.length
        let lineHeight = 18
        // 行起始位置
        let start = height / 2 - (len > 1 ? 9 : 0)
        lines.forEach((line, index) => {
            // 最多只显示2行
            if (index > 1) return
            // 超出2行，第2行添加省略号
            if (index == 1 && len > 2) {
                line = line.substring(0, line.length - 1) + '...'
            }
            let t = new Text({ style: { y: start + index * lineHeight, text: line, ...tStyle } })
            this.group.add(t)
        })
    }

    renderTypeIcon() {
        let { vertex } = this.theme
        let { icon } = this.attribute
        if (!icon) return
        icon = new Text({ style: { ...icon.style, fill: vertex.text } })
        this.group.add(icon)
    }

    renderBackground() {
        let { width, height } = this.attribute
        let { border, background } = this.theme.vertex
        this.background = new Rect({
            shape: { x: 0, y: 0, r: V_RADIUS, width, height },
            style: { stroke: border, fill: background },
        })
        this.group.add(this.background)
    }

    render() {
        this.renderBackground()
        this.renderTypeIcon()
        this.renderConnectors()
        this.renderText()
        this.renderOuterButtons()
        return this.group
    }
}

export default Process
