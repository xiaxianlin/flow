import { V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { ITheme, IVertex, IVertexAttribute, IView } from '../interface'
import { vid } from '../logic/common'
import Process from '../view/process'

class Vertex implements IVertex {
    public id: string
    private type: VertexType
    private subType: VertexType
    private status: VertexStatus
    private groupId: string
    private attribute: IVertexAttribute
    private theme: ITheme
    private view: IView = null

    private createView() {
        switch (this.type) {
            case VertexType.PROCESS:
                this.view = new Process(this.subType, this.attribute, this.theme)
                break
        }
    }

    constructor(type: VertexType, subType: VertexType, attribute: IVertexAttribute = {}, theme: ITheme) {
        this.id = vid()
        this.type = type
        this.subType = subType
        this.attribute = Object.assign(attribute, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT })
        this.theme = theme
        this.createView()
    }

    setGroupId(gid: string) {
        this.groupId = gid
    }

    setText(text: string) {
        this.attribute.text = text
    }

    setPosition(x: number, y: number) {
        this.attribute.x = x
        this.attribute.y = y
    }

    getView(): IView {
        return this.view
    }
}

export default Vertex
