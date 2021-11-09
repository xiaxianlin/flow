import { V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { ITheme, IVertex, IVertexButtonProps, IVertexProps, IView } from '../interface'
import { vid } from '../logic/common'
import Process from '../view/process'

class Vertex implements IVertex {
    public id: string
    private type: VertexType
    private status: VertexStatus
    private groupId: string
    private attribute: IVertexProps
    private theme: ITheme
    private view: IView = null

    private createView() {
        switch (this.type) {
            case VertexType.PROCESS:
                this.view = new Process(this.attribute, this.theme)
                break
        }
    }

    constructor(type: VertexType, attribute: IVertexProps = {}, theme: ITheme) {
        this.id = vid()
        this.type = type
        this.attribute = Object.assign({}, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }, attribute)
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

    setButtons(buttons: IVertexButtonProps) {
        this.view.setButtons(buttons)
    }

    getView(): IView {
        return this.view
    }
}

export default Vertex
