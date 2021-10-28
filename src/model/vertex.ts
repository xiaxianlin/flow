import { V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { IVertexAttribute } from '../interface'
import { vid } from '../logic/common'
import { generateConnectPoints } from '../logic/vertex'
import { TAxis } from '../type'

class Vertex {
    private id: string
    private type: VertexType
    private subType: VertexType
    private status: VertexStatus
    private groupId: string
    private attribute: IVertexAttribute
    private connectPoints: TAxis[] = []

    constructor(type: VertexType, subType: VertexType, groupId?: string) {
        this.id = vid()
        this.type = type
        this.subType = subType
        this.groupId = groupId || ''
        this.attribute = { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }
        this.connectPoints = generateConnectPoints(this.attribute)
    }

    setId(id: string) {
        this.id = id
    }

    setText(text: string) {
        this.attribute.text = text
    }

    setPosition(x: number, y: number) {
        this.attribute.x = x
        this.attribute.y = y
    }
}

export default Vertex
