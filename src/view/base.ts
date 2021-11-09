import { Circle, Group, Text } from 'zrender'
import { C_RADIUS } from '../constant'
import { VertexButtonType } from '../constant/vertex'
import { ITheme, IVertexButtonProps, IVertexProps, IView, TButton } from '../interface'
import { generateConnectPoints } from '../logic/vertex'
import { TAxis } from '../type'

class BaseView implements IView {
    protected group: Group
    protected attribute: IVertexProps
    protected theme: ITheme
    protected connectors: Circle[]
    protected buttons: IVertexButtonProps
    protected buttonLayer: Group

    protected handleMouseOver() {
        this.connectors.forEach((c) => c.attr('style', { opacity: 1 }))
        this.buttonLayer.show()
    }

    protected handleMouseLeave() {
        this.connectors.forEach((c) => c.attr('style', { opacity: 0 }))
        this.buttonLayer.hide()
    }

    protected handleClick() {}

    protected handleDBClick() {}

    constructor(attribute: IVertexProps, theme: ITheme) {
        this.theme = theme
        this.attribute = attribute
        this.group = new Group({ x: attribute.x, y: attribute.y, draggable: true })
        this.group.on('mouseover', () => this.handleMouseOver())
        this.group.on('mouseout', () => this.handleMouseLeave())
        this.group.on('click', () => this.handleClick())
        this.group.on('dbclick', () => this.handleDBClick())
        this.group.on('drop', () => {
            console.log(this.group)
        })
    }

    setButtons(buttons: IVertexButtonProps) {
        this.buttons = buttons
    }

    renderConnectors() {
        let { border, background } = this.theme.connector
        let points: TAxis[] = generateConnectPoints(this.attribute)
        this.connectors = points.map((p: TAxis) => {
            let [cx, cy] = p
            return new Circle({
                shape: { cx, cy, r: C_RADIUS },
                style: { fill: background, stroke: border, opacity: 0 },
                cursor: 'crosshair',
            })
        })

        this.connectors.forEach((c) => {
            this.group.add(c)
        })
    }

    renderOuterButtons() {
        if (!this.buttons) return
        let { type, buttons } = this.buttons
        if (type !== VertexButtonType.OUTER || !buttons.length) return

        let { vertex } = this.theme
        let { text, border, background } = vertex.button
        let { width, height } = this.attribute

        this.buttonLayer = new Group({ x: width + 10, y: height / 2 - 40 })
        buttons.forEach((btn: TButton, index: number) => {
            let g = new Group({ x: 0, y: index * 30 })

            g.add(new Circle({ shape: { cx: 10, cy: 10, r: 10 }, style: { fill: background, stroke: border } }))

            let icon = new Text({ style: { ...btn.icon.style, fontSize: 14, fill: text, x: 10, y: 10 } })
            g.add(icon)

            g.on('click', () => btn.handler())

            this.buttonLayer.add(g)
        })
        this.buttonLayer.hide()
        this.group.add(this.buttonLayer)
    }

    render() {
        return this.group
    }
}

export default BaseView
