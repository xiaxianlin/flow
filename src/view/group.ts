import { Circle, Group, Rect, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, G_HEAD_HEIGHT, G_HEIGHT, G_WIDTH, V_HEIGHT, V_RADIUS } from '../constant'
import { VertexButtonType } from '../constant/vertex'
import { IGroupView, IVertexButtonProp, IVertexModel } from '../interface'
import { cutText } from '../logic/vertex'
import { TGroupStyle, TStyle } from '../type'
import BaseView from './base'

class GroupView extends BaseView implements IGroupView {
    protected model: IVertexModel
    protected style: TGroupStyle
    private headerIcon: Text
    private headerText: Text
    private headerBackground: Rect

    setStyle(style: TGroupStyle): void {
        this.style = style
        this.background.attr({ style: { stroke: style.border, fill: style.background } })
        this.headerBackground.attr({ style: { fill: style.header.background } })
    }

    renderBackground() {
        let { border, background } = this.style
        let { height } = this.attribute
        this.background = new Rect({
            shape: { r: V_RADIUS, width: G_WIDTH, height: height },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    renderHeader() {
        let { icon, text } = this.attribute
        let { color, background } = this.style.header

        let header = new Group()

        this.headerBackground = new Rect({
            shape: { x: 1, y: 1, r: [V_RADIUS, V_RADIUS, 0, 0], width: G_WIDTH - 2, height: G_HEAD_HEIGHT - 1 },
            style: { fill: background },
        })
        header.add(this.headerBackground)

        if (icon) {
            this.headerIcon = new Text({ style: { ...icon.style, fontSize: 18, fill: color, x: 18, y: G_HEAD_HEIGHT / 2 } })
            header.add(this.headerIcon)
        }

        text = cutText(text, 14, 100)[0]
        let textX = this.headerIcon ? 32 : 10
        this.headerText = new Text({ style: { x: textX, y: G_HEAD_HEIGHT / 2, text, fill: color, verticalAlign: 'middle', fontSize: 14 } })
        header.add(this.headerText)

        this.view.add(header)
    }

    renderGroupButtons() {
        let buttons: IVertexButtonProp[] = this.buttons.filter((b) => b.type === VertexButtonType.GROUP)
        if (!buttons.length) return

        let { color, background } = this.style.button
        let bgLen = 24

        // buttons = buttons.reverse()
        buttons.forEach((item: IVertexButtonProp, index: number) => {
            let { icon, handler } = item
            let g = new Group({ x: G_WIDTH - (bgLen + 5) * (index + 1), y: (G_HEAD_HEIGHT - bgLen) / 2 })
            g.add(new Rect({ shape: { width: bgLen, height: bgLen, r: 2 }, style: { fill: background, stroke: background } }))
            g.add(new Text({ style: { ...icon.style, fontSize: 12, fill: color, x: bgLen / 2, y: bgLen / 2 } }))
            g.on('click', (evt) => handler(evt))

            this.view.add(g)
        })
    }

    render(styles?: TStyle[]) {
        this.renderBackground()
        this.renderHeader()
        this.renderGroupButtons()
        this.renderConnectors(styles[0])
        this.renderOuterButtons(styles[1])
        return this.view
    }
}

export default GroupView
