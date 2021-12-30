import { Circle, Isogon } from 'zrender'
import { V_HEIGHT } from '../constant'
import { IConfluenceView, IVertexModel } from '../interface'
import { TStyle } from '../type'
import BaseVertextView from './base_vertex'

class ConfluenceView extends BaseVertextView implements IConfluenceView {
    protected model: IVertexModel
    private icon: Circle

    setStyle(style: TStyle): void {
        this.style = style
        this.icon.attr({ style: { stroke: style.color, fill: style.background } })
        this.background.attr({ style: { stroke: style.border, fill: style.background } })
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

    render() {
        this.renderBackground()
        this.renderIcon()
        this.renderConnectors()
        this.renderOuterButtons()
        return this.view
    }
}

export default ConfluenceView
