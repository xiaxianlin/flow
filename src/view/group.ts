import { Circle, Group, Rect, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, G_HEAD_HEIGHT, G_HEIGHT, G_WIDTH, V_HEIGHT, V_RADIUS } from '../constant'
import { IGroupView, IVertexModel } from '../interface'
import { cutText } from '../logic/vertex'
import { TGroupStyle, TStyle } from '../type'
import BaseView from './base'

class GroupView extends BaseView implements IGroupView {
    protected model: IVertexModel
    protected style: TGroupStyle

    renderBackground() {
        let { border, background } = this.style
        this.background = new Rect({
            shape: { r: V_RADIUS, width: G_WIDTH, height: G_HEIGHT },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    renderHeader() {
        let { icon, text } = this.attribute
        let { color, background } = this.style.header

        let header = new Group()

        let headerBg = new Rect({
            shape: { r: V_RADIUS, width: G_WIDTH, height: G_HEAD_HEIGHT },
            style: { fill: background },
        })
        header.add(headerBg)

        if (icon) {
            icon = new Text({ style: { ...icon.style, fontSize: 18, fill: color, x: 18, y: G_HEAD_HEIGHT / 2 } })
            header.add(icon)
        }

        text = cutText(text, 14, 100)[0]
        let headerText = new Text({ style: { x: 32, y: G_HEAD_HEIGHT / 2, text, fill: color, verticalAlign: 'middle', fontSize: 14 } })
        header.add(headerText)

        this.view.add(header)
    }

    render(styles?: TStyle[]) {
        this.renderBackground()
        this.renderHeader()
        this.renderConnectors(styles[0])
        this.renderOuterButtons(styles[1])
        return this.view
    }
}

export default GroupView
