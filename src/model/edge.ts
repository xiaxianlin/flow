import { Position } from '../constant/graph'
import { IEdgeModel, IEdgeView, IVertexModel } from '../interface'
import { calcLinePoints } from '../logic/edge'
import { TEdgeShape, TTheme } from '../type'
import LineView from '../view/line'
import BaseModel from './base'

class EdgeModel extends BaseModel implements IEdgeModel {
    private shape: TEdgeShape
    private source: IVertexModel
    private sourcePosition: Position
    private target: IVertexModel
    private targetPosition: Position
    private points: number[][]

    protected view: IEdgeView

    private calc() {
        if (!(this.source && this.sourcePosition && this.target && this.targetPosition)) return
        this.points = calcLinePoints(this)
        this.view.setPoints(this.points)
    }

    constructor(shape: TEdgeShape, theme: TTheme) {
        super()
        this.shape = shape
        this.theme = theme
        this.points = []
        this.view = new LineView(shape, theme.edge)
    }

    setSource(source: IVertexModel, position: Position): void {
        this.source = source
        this.sourcePosition = position
        let cp = source.getConnectorPosition(position)
        this.view.setShape({ x: cp[0], y: cp[1] })
        this.calc()
    }
    setTarget(target: IVertexModel, position: Position): void {
        this.target = target
        this.targetPosition = position
        this.calc()
    }

    getSource(): [IVertexModel, Position] {
        return [this.source, this.sourcePosition]
    }
    getTarget(): [IVertexModel, Position] {
        return [this.target, this.targetPosition]
    }
}

export default EdgeModel
