import { Rect, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, V_RADIUS } from '../constant'
import { IGroupItemView, IVertexModel } from '../interface'
import { cutText } from '../logic/vertex'
import { TStyle } from '../type'
import BaseView from './base'

class GroupItemView extends BaseView implements IGroupItemView {
    protected model: IVertexModel
    protected innerButtonStyle: TStyle

    protected initEvents() {
        this.view.on('click', (evt) => this.handleClick(evt))
        this.view.on('dbclick', (evt) => this.handleDBClick(evt))
        this.view.on('dragstart', (evt) => this.handleDragStart(evt))
        this.view.on('dragend', (evt) => this.handleDragEnd(evt))
    }

    setInnerButtonStyle(style: TStyle): void {
        this.innerButtonStyle = style
    }

    renderText() {
        let { text, width, height } = this.shape
        if (!text) return

        let lines = cutText(text, FONT_SIZE, width - 40)
        let tStyle: TextStyleProps = { x: width / 2, y: height / 2, fill: this.style.color, align: 'center', verticalAlign: 'middle', fontSize: FONT_SIZE }
        this.text = lines.map((line) => {
            let t = new Text({
                style: {
                    text: lines.length > 1 ? line.substring(0, line.length - 1) + '...' : line,
                    ...tStyle,
                },
            })
            this.view.add(t)
            return t
        })
    }

    renderTypeIcon() {
        let { icon } = this.shape
        if (!icon) return

        icon = new Text({ style: { ...icon.style, fill: this.style.color } })
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
        return this.view
    }
}

export default GroupItemView
