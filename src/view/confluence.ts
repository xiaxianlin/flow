import { Circle, Isogon, Text, TextStyleProps } from 'zrender'
import { FONT_SIZE, V_HEIGHT } from '../constant'
import { IConfluenceView, IVertexModel } from '../interface'
import { TStyle } from '../type'
import BaseView from './base'

class ConfluenceView extends BaseView implements IConfluenceView {
    protected model: IVertexModel
    private icon: Circle

    setStyle(style: TStyle): void {
        super.setStyle(style)
        this.icon.attr({ style: { stroke: style.color, fill: style.background } })
    }

    renderBackground() {
        let { border, background } = this.style
        let r = V_HEIGHT / 2
        this.background = new Isogon({
            shape: { x: r, y: r, r, n: 4 },
            style: { stroke: border, fill: background },
        })
        this.view.add(this.background)
    }

    renderIcon() {
        let { color, background } = this.style
        let r = V_HEIGHT / 2
        this.icon = new Circle({
            shape: { cx: r, cy: r, r: r - 15 },
            style: { stroke: color, fill: background, lineWidth: 3 },
        })
        this.view.add(this.icon)
    }

    render(styles?: TStyle[]) {
        this.renderBackground()
        this.renderIcon()
        this.renderConnectors(styles[0])
        this.renderOuterButtons(styles[1])
        return this.view
    }
}

export default ConfluenceView
