import { Circle, Group, Rect, Text } from 'zrender'
import { G_HEAD_HEIGHT, G_WIDTH, V_RADIUS } from '../constant'
import { VertexButtonType } from '../constant/vertex'
import { IGroupView, IVertexModel } from '../interface'
import { cutText, generateConnectPoints } from '../logic/vertex'
import { TPosition, TStyle, TVertexButtonProp } from '../type'
import BaseVertextView from './base_vertex'

class GroupView extends BaseVertextView implements IGroupView {
    protected model: IVertexModel
    private headerIcon: Text
    private headerText: Text
    private headerBackground: Rect
    private headerStyle: TStyle
    private groupButtonStyle: TStyle

    setStyle(style: TStyle): void {
        this.style = style
    }

    setGroupHeaderStyle(style: TStyle): void {
        this.headerStyle = style
    }
    setGroupButtonStyle(style: TStyle): void {
        this.groupButtonStyle = style
    }

    renderBackground() {
        let { border, background } = this.style
        let { height } = this.shape
        this.background = new Rect({
            shape: { r: V_RADIUS, width: G_WIDTH, height: height },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    renderHeader() {
        let { icon, text } = this.shape
        let { color, background } = this.headerStyle

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
        let buttons: TVertexButtonProp[] = this.buttons.filter((b) => b.type === VertexButtonType.GROUP)
        if (!buttons.length) return

        let { color, background } = this.groupButtonStyle
        let bgLen = 24

        // buttons = buttons.reverse()
        buttons.forEach((item: TVertexButtonProp, index: number) => {
            let { icon, handler } = item
            let g = new Group({ x: G_WIDTH - (bgLen + 5) * (index + 1), y: (G_HEAD_HEIGHT - bgLen) / 2 })
            g.add(new Rect({ shape: { width: bgLen, height: bgLen, r: 2 }, style: { fill: background, stroke: background } }))
            g.add(new Text({ style: { ...icon.style, fontSize: 12, fill: color, x: bgLen / 2, y: bgLen / 2 } }))
            g.on('click', (evt) => {
                evt.cancelBubble = false
                handler(evt)
            })

            this.view.add(g)
        })
    }

    render() {
        this.renderBackground()
        this.renderHeader()
        this.renderGroupButtons()
        this.renderOuterButtons()
        this.renderConnectors()
        return this.view
    }

    update() {
        let { height } = this.shape
        this.background.attr({ shape: { height: height } })

        let buttons: TVertexButtonProp[] = this.buttons.filter((b) => b.type === VertexButtonType.OUTER)
        if (buttons.length) {
            this.buttonLayer.attr({ y: (height - buttons.length * 30 + 10) / 2 })
        }

        let points: TPosition[] = generateConnectPoints(this.shape)
        this.connectors.forEach((c: Circle, i: number) => {
            c.attr({ shape: { cx: points[i][0], cy: points[i][1] } })
        })
    }
}

export default GroupView
