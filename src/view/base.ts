import { Circle, ElementEvent, Group, Rect, Text } from 'zrender'
import { C_RADIUS } from '../constant'
import { VertexButtonType } from '../constant/vertex'
import { TAxis, TButton, TEvent, RenderType, TTheme, TStyle } from '../type'
import { IModel, IVertexButtonProps, IVertexProps, IView } from '../interface'
import { generateConnectPoints } from '../logic/vertex'

class BaseView implements IView {
    protected model: IModel
    protected view: RenderType
    protected attribute: IVertexProps
    protected style: TStyle
    protected buttons: IVertexButtonProps
    protected events: TEvent[]
    protected background: Rect // 背景
    protected text: Text[]
    protected connectors: Circle[] // 连接点
    protected buttonLayer: Group // 按钮层

    protected handleMouseOver(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 1 }))
    }

    protected handleMouseLeave(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 0 }))
    }

    protected handleClick(evt: ElementEvent) {
        let event = this.events.find((e) => e.name === 'click')
        if (!event) return
        event.handler(evt)
    }

    protected handleDBClick(evt: ElementEvent) {
        let event = this.events.find((e) => e.name === 'dbclick')
        if (!event) return
        event.handler(evt)
    }

    constructor(attribute: IVertexProps, style: TStyle) {
        this.style = style
        this.attribute = attribute
        this.view = new Group({ x: attribute.x, y: attribute.y, draggable: true })
        this.view.on('mouseover', (evt) => this.handleMouseOver(evt))
        this.view.on('mouseout', (evt) => this.handleMouseLeave(evt))
        this.view.on('click', (evt) => this.handleClick(evt))
        this.view.on('dbclick', (evt) => this.handleDBClick(evt))
    }

    setModel(model: IModel): void {
        this.model = model
    }

    setButtons(buttons: IVertexButtonProps) {
        this.buttons = buttons
    }

    setEvents(events: TEvent[]) {
        this.events = events
    }

    setStyle(style: TStyle): void {
        this.style = style
        this.background.attr({ style: { stroke: style.border, fill: style.background } })
    }

    showButtonLayer() {
        this.buttonLayer.show()
    }

    hideButtonLayer() {
        this.buttonLayer.hide()
    }

    renderConnectors(connectorStyle: TStyle = {}) {
        let { border, background } = connectorStyle
        let points: TAxis[] = generateConnectPoints(this.attribute)
        this.connectors = points.map((p: TAxis) => {
            let [cx, cy] = p
            let c = new Circle({
                shape: { cx, cy, r: C_RADIUS },
                style: { fill: background, stroke: border, opacity: 0 },
                cursor: 'crosshair',
            })
            this.view.add(c)
            return c
        })
    }

    renderOuterButtons(btnStyle: TStyle = {}) {
        if (!this.buttons) return

        let { type, buttons } = this.buttons
        if (type !== VertexButtonType.OUTER || !buttons.length) return

        let { color, border, background } = btnStyle
        let { width, height } = this.attribute

        this.buttonLayer = new Group({ x: width + 10, y: height / 2 - 40 })
        buttons.forEach((btn: TButton, index: number) => {
            let g = new Group({ x: 0, y: index * 30 })

            g.add(new Circle({ shape: { cx: 10, cy: 10, r: 10 }, style: { fill: background, stroke: border } }))

            let icon = new Text({ style: { ...btn.icon.style, fontSize: 14, fill: color, x: 10, y: 10 } })
            g.add(icon)

            g.on('click', () => btn.handler())

            this.buttonLayer.add(g)
        })
        this.view.add(this.buttonLayer)
        this.hideButtonLayer()
    }

    render() {
        return this.view
    }
}

export default BaseView
