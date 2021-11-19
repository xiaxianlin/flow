import { Rect, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, V_RADIUS } from '../constant'
import { VertexPropType } from '../constant/vertex'
import { IGroupItemView, IVertexModel, IVertexProps } from '../interface'
import { cutText } from '../logic/vertex'
import { TStyle, TUnionStyle } from '../type'
import BaseView from './base'

class GroupItemView extends BaseView implements IGroupItemView {
    protected model: IVertexModel

    protected initEvents() {
        this.view.on('click', (evt) => this.handleClick(evt))
        this.view.on('dbclick', (evt) => this.handleDBClick(evt))
    }

    update(type: VertexPropType, value: IVertexProps | TUnionStyle): void {
        if (type === VertexPropType.ATTRIBUTE) {
            let { x, y } = value as IVertexProps
            this.view.attr({ x, y })
        }
    }

    renderText() {
        let { text, width, height } = this.attribute
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
        let { color } = this.style
        let { icon } = this.attribute
        if (!icon) return
        icon = new Text({ style: { ...icon.style, fill: color } })
        this.view.add(icon)
    }

    renderBackground() {
        let { width, height } = this.attribute
        let { border, background } = this.style
        this.background = new Rect({
            shape: { x: 0, y: 0, r: V_RADIUS, width, height },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    render(styles?: TStyle[]) {
        this.renderBackground()
        this.renderTypeIcon()
        this.renderText()
        return this.view
    }
}

export default GroupItemView
