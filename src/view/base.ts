import { ElementEvent } from 'zrender'
import { TEvent, RenderType, TStyle, TVertextShape } from '../type'
import { IModel, IView } from '../interface'
import { setVertexZ } from '../logic/view'

class BaseView implements IView {
    protected model: IModel
    protected view: RenderType
    protected shape: TVertextShape
    protected style: TStyle
    protected events: TEvent[]

    protected handleEvent(name: string, evt: ElementEvent, cancelBubble: boolean = true) {
        let event = this.events.find((e) => e.name === name)
        if (!event) return
        evt.cancelBubble = cancelBubble
        event.handler(evt)
    }

    protected handleMouseOver(evt: ElementEvent) {
        this.handleEvent('mouseover', evt)
    }

    protected handleMouseLeave(evt: ElementEvent) {
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
        this.view.on('dblclick', (evt) => this.handleDBClick(evt))
        this.view.on('dragstart', (evt) => this.handleDragStart(evt))
        this.view.on('dragend', (evt) => this.handleDragEnd(evt))
    }

    constructor(shape: TVertextShape, style: TStyle) {
        this.shape = shape
        this.style = style
    }

    setModel(model: IModel): void {
        this.model = model
    }

    setEvents(events: TEvent[]) {
        this.events = events
    }

    setShape(shape: TVertextShape): void {
        this.shape = shape
    }

    setStyle(style: TStyle): void {
        this.style = style
    }

    setZ(z: number): void {
        setVertexZ(this.view, z)
    }

    getView(): RenderType {
        return this.view
    }

    render() {
        return this.view
    }

    update() {}
}

export default BaseView
