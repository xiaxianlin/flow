import { Rect, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, V_RADIUS } from '../constant'
import { IProcessView, IVertexModel } from '../interface'
import { cutText } from '../logic/vertex'
import { TStyle, TVertextShape } from '../type'
import BaseView from './base'

class ProcessView extends BaseView implements IProcessView {
    protected model: IVertexModel
    protected innerButtonStyle: TStyle

    setInnerButtonStyle(style: TStyle): void {
        this.innerButtonStyle = style
    }

    renderText() {
        let { text, width, height } = this.shape
        let lines = cutText(text, FONT_SIZE, width - 40)
        let tStyle: TextStyleProps = { x: width / 2, fill: this.style.color, align: 'center', verticalAlign: 'middle', fontSize: FONT_SIZE }

        let len = lines.length
        let lineHeight = 18
        // 行起始位置
        let start = height / 2 - (len > 1 ? 9 : 0)
        this.text = lines.map((line, index) => {
            // 最多只显示2行
            if (index > 1) return
            // 超出2行，第2行添加省略号
            if (index == 1 && len > 2) {
                line = line.substring(0, line.length - 1) + '...'
            }
            let t = new Text({ style: { y: start + index * lineHeight, text: line, ...tStyle } })
            this.view.add(t)
            return t
        })
    }

    renderTypeIcon() {
        let { color } = this.style
        let { icon } = this.shape
        if (!icon) return
        icon = new Text({ style: { ...icon.style, fill: color } })
        this.view.add(icon)
    }

    renderBackground() {
        let { width, height } = this.shape
        let { border, background } = this.style
        this.background = new Rect({
            shape: { x: 0, y: 0, r: V_RADIUS, width, height },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    render() {
        this.renderBackground()
        this.renderTypeIcon()
        this.renderText()
        this.renderConnectors()
        this.renderOuterButtons()
        return this.view
    }
}

export default ProcessView
