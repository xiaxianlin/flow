import { Circle, Displayable, ElementEvent, Group, Path, Rect, Text } from 'zrender'
import { C_RADIUS } from '../constant'
import { VertexButtonType, VertexPropType } from '../constant/vertex'
import { TPosition, TEvent, RenderType, TStyle, TVertexButtonProp, TVertextShape } from '../type'
import { IModel, IView } from '../interface'
import { generateConnectPoints } from '../logic/vertex'
import { setVertexZ } from '../logic/view'

class BaseView implements IView {
    protected model: IModel
    protected view: RenderType
    protected shape: TVertextShape
    protected style: TStyle
    protected buttonStyle: TStyle
    protected connectorStyle: TStyle

    protected buttons: TVertexButtonProp[]
    protected events: TEvent[]

    protected background: Path // 背景
    protected text: Text[]
    protected connectors: Circle[] // 连接点
    protected buttonLayer: Group // 按钮层
    protected childViews: Group[]

    protected handleEvent(name: string, evt: ElementEvent, cancelBubble: boolean = true) {
        let event = this.events.find((e) => e.name === name)
        if (!event) return
        evt.cancelBubble = cancelBubble
        event.handler(evt)
    }

    protected handleMouseOver(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 1 }))
        this.handleEvent('mouseover', evt)
    }

    protected handleMouseLeave(evt: ElementEvent) {
        this.connectors.forEach((c) => c.attr('style', { opacity: 0 }))
        this.handleEvent('mouseleave', evt)
    }

    protected handleClick(evt: ElementEvent) {
        this.handleEvent('click', evt)
    }

    protected handleDBClick(evt: ElementEvent) {
        this.handleEvent('dbclick', evt)
    }

    protected handleDragStart(evt: ElementEvent) {
        this.handleEvent('dragstart', evt)
    }

    protected handleDragEnd(evt: ElementEvent) {
        this.handleEvent('dragend', evt)
    }

    protected initEvents() {
        this.view.on('mouseover', (evt) => this.handleMouseOver(evt))
        this.view.on('mouseout', (evt) => this.handleMouseLeave(evt))
        this.view.on('click', (evt) => this.handleClick(evt))
        this.view.on('dbclick', (evt) => this.handleDBClick(evt))
        this.view.on('dragstart', (evt) => this.handleDragStart(evt))
        this.view.on('dragend', (evt) => this.handleDragEnd(evt))
    }

    constructor(shape: TVertextShape, style: TStyle, buttonStyle: TStyle, connectorStyle: TStyle) {
        this.shape = shape
        this.style = style
        this.buttonStyle = buttonStyle
        this.connectorStyle = connectorStyle
        this.buttons = []
        this.childViews = []
        this.view = new Group({ x: shape.x, y: shape.y, draggable: true })
        this.initEvents()
    }

    setModel(model: IModel): void {
        this.model = model
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

    getView(): RenderType {
        return this.view
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

export default BaseView
