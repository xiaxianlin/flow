import { Circle, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, V_HEIGHT } from '../constant'
import { IEventView, IVertexModel } from '../interface'
import { TStyle } from '../type'
import BaseView from './base'

class EventView extends BaseView implements IEventView {
    protected model: IVertexModel

    renderText() {
        let { text } = this.attribute
        let tStyle: TextStyleProps = { fill: this.style.color, align: 'center', verticalAlign: 'middle', fontSize: FONT_SIZE }

        this.text = [text].map((line) => {
            let t = new Text({ style: { x: 30, y: 30, text: line, ...tStyle } })
            this.view.add(t)
            return t
        })
    }

    renderBackground() {
        let { border, background } = this.style
        let r = V_HEIGHT / 2
        this.background = new Circle({
            shape: { cx: r, cy: r, r },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    render(styles?: TStyle[]) {
        this.renderBackground()
        this.renderText()
        this.renderConnectors(styles[0])
        this.renderOuterButtons(styles[1])
        return this.view
    }
}

export default EventView
