import { Circle, ElementEvent, Group, Path, Text } from 'zrender'
import { C_RADIUS } from '../constant'
import { VertexButtonType } from '../constant/vertex'
import { TPosition, TEvent, TStyle, TVertexButtonProp, TVertextShape } from '../type'
import { IVertexView } from '../interface'
import { generateConnectPoints } from '../logic/vertex'
import { setVertexZ } from '../logic/view'
import BaseView from './base'

class BaseVertextView extends BaseView implements IVertexView {
    protected buttonStyle: TStyle
    protected connectorStyle: TStyle

    protected buttons: TVertexButtonProp[]

    protected background: Path // 背景
    protected text: Text[]
    protected connectors: Circle[] // 连接点
    protected buttonLayer: Group // 按钮层
    protected childViews: Group[]

    protected handleMouseOver(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 1 }))
        this.handleEvent('mouseover', evt)
    }

    protected handleMouseLeave(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 0 }))
        this.handleEvent('mouseleave', evt)
    }

    constructor(shape: TVertextShape, style: TStyle, buttonStyle: TStyle, connectorStyle: TStyle) {
        super(shape, style)
        this.buttonStyle = buttonStyle
        this.connectorStyle = connectorStyle
        this.buttons = []
        this.childViews = []
        this.view = new Group({ x: shape.x, y: shape.y, draggable: true })
        this.initEvents()
    }

    setButtons(buttons: TVertexButtonProp[]) {
        this.buttons = buttons
    }

    setEvents(events: TEvent[]) {
        this.events = events
    }

    setShape(shape: TVertextShape): void {
        this.shape = shape
        this.view.attr({ x: shape.x, y: shape.y })
    }

    setStyle(style: TStyle): void {
        this.style = style
        this.text.forEach((t) => t && t.attr({ style: { fill: style.color } }))
        this.background.attr({ style: { stroke: style.border, fill: style.background } })
    }

    setButtonStyle(style: TStyle): void {
        this.buttonStyle = style
    }

    setZ(z: number): void {
        setVertexZ(this.view, z)
    }

    getButtons(): TVertexButtonProp[] {
        return this.buttons
    }

    showButtonLayer() {
        if (this.buttonLayer) {
            this.buttonLayer.show()
        }
    }

    hideButtonLayer() {
        if (this.buttonLayer) {
            this.buttonLayer.hide()
        }
    }

    renderConnectors() {
        let { border, background } = this.connectorStyle
        let points: TPosition[] = generateConnectPoints(this.shape)
        this.connectors = points.map((p: TPosition) => {
            let [cx, cy] = p
            let c = new Circle({
                shape: { cx, cy, r: C_RADIUS },
                style: { fill: background, stroke: border, opacity: 0 },
                cursor: 'crosshair',
            })
            c.on('mouseover', (e) => {
                this.view.attr({ draggable: false })
            })
            c.on('mouseout', (e) => {
                this.view.attr({ draggable: true })
            })
            this.view.add(c)
            return c
        })
    }

    renderOuterButtons() {
        let buttons: TVertexButtonProp[] = this.buttons.filter((b) => b.type === VertexButtonType.OUTER)
        if (!buttons.length) return

        let { color, border, background } = this.buttonStyle
        let { width, height } = this.shape

        this.buttonLayer = new Group({ x: width + 10, y: (height - buttons.length * 30 + 10) / 2 })
        buttons.forEach((item: TVertexButtonProp, index: number) => {
            let { icon, handler } = item
            let g = new Group({ x: 0, y: index * 30 })

            g.add(new Circle({ shape: { cx: 10, cy: 10, r: 10 }, style: { fill: background, stroke: border } }))
            g.add(new Text({ style: { ...icon.style, fontSize: 14, fill: color, x: 10, y: 10 } }))
            g.on('click', (evt) => handler(evt))

            this.buttonLayer.add(g)
        })
        this.view.add(this.buttonLayer)
        this.hideButtonLayer()
    }

    add(view: Group): void {
        this.childViews.push(view)
        this.view.add(view)
    }

    remove(view: Group): void {
        this.childViews = this.childViews.filter((v) => v !== view)
        this.view.remove(view)
    }

    render() {
        return this.view
    }

    update() {}
}

export default BaseVertextView
