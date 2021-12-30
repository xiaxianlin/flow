import { Group, Polyline } from 'zrender'
import { IEdgeView } from '../interface'
import { createArraw } from '../logic/edge'
import { TEdgeShape, TStyle } from '../type'
import BaseView from './base'

class LineView extends BaseView implements IEdgeView {
    private line: Polyline
    private arraw: Polyline

    constructor(shape: TEdgeShape, style: TStyle) {
        super(shape, style)
        this.view = new Group()

        this.line = new Polyline()
        this.line.attr({ style: { stroke: style.border } })
        this.view.add(this.line)

        this.arraw = new Polyline()
        this.arraw.attr({ style: { stroke: style.border } })
        this.view.add(this.arraw)
    }

    setShape(shape: TEdgeShape): void {
        this.shape = shape
        this.view.attr({ x: shape.x, y: shape.y })
    }

    setStyle(style: TStyle): void {
        this.style = style
        this.line.attr({ style: { stroke: style.border } })
    }

    setPoints(points: number[][]): void {
        let arrawPoints = createArraw(points)
        this.line.attr({ shape: { points } })
        this.arraw.attr({ shape: { points: arrawPoints } })
    }

    update() {}
    render(): Group {
        return this.view
    }
}

export default LineView
