import { Circle, Group } from 'zrender'
import { C_RADIUS } from '../constant'
import { ITheme, IVertexAttribute, IView } from '../interface'
import { generateConnectPoints } from '../logic/vertex'
import { TAxis } from '../type'

class BaseView implements IView {
    protected group: Group
    protected attribute: IVertexAttribute
    protected theme: ITheme
    protected connectors: Circle[]

    protected handleMouseOver() {
        this.connectors.forEach((c) => {
            c.attr('style', { opacity: 1 })
        })
    }

    protected handleMouseLeave() {
        this.connectors.forEach((c) => {
            c.attr('style', { opacity: 0 })
        })
    }

    protected handleClick() {}

    protected handleDBClick() {}

    constructor(attribute: IVertexAttribute, theme: ITheme) {
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

    setConnectors() {
        let { border, background } = this.theme.connector
        let points: TAxis[] = generateConnectPoints(this.attribute)
        this.connectors = points.map((p: TAxis) => {
            let [cx, cy] = p
            return new Circle({
                shape: { cx, cy, r: C_RADIUS },
                style: { fill: background, stroke: border, opacity: 1 },
                cursor: 'crosshair',
            })
        })

        this.connectors.forEach((c) => {
            this.group.add(c)
        })
    }

    render() {
        this.setConnectors()
        return this.group
    }
}

export default BaseView
