import { Position } from '../constant/graph'
import { IEdgeModel, IVertexModel } from '../interface'
import BaseModel from './base'

class EdgeModel extends BaseModel implements IEdgeModel {
    private source: IVertexModel
    private sourceConnectorPosition: Position
    private target: IVertexModel
    private targetConnectorPosition: Position

    setSource(source: IVertexModel, connectorPosition: Position): void {
        this.source = source
        this.sourceConnectorPosition = connectorPosition
    }
    setTarget(target: IVertexModel, connectorPosition: Position): void {
        this.target = target
        this.targetConnectorPosition = connectorPosition
    }

    getSource(): [IVertexModel, Position] {
        return [this.source, this.sourceConnectorPosition]
    }
    getTarget(): [IVertexModel, Position] {
        return [this.target, this.targetConnectorPosition]
    }
}

export default EdgeModel
