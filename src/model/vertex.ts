import { V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { IVertexModel, IVertexButtonProps, IVertexProps, IProcessView } from '../interface'
import { RenderType, TTheme } from '../type'
import ProcessView from '../view/process'
import BaseModel from './base'

class VertexModel extends BaseModel implements IVertexModel {
    private type: VertexType
    private status: VertexStatus
    private attribute: IVertexProps

    private handleClick() {
        if (this.status === VertexStatus.ACTIVE) return
        this.status = VertexStatus.ACTIVE
        this.contaienr.setActive(this)
        this.view.setStyle(this.theme.vertex.active)
        this.view.showButtonLayer()
    }

    private createView() {
        if (this.type === VertexType.PROCESS) {
            this.view = new ProcessView(this.attribute, this.theme.vertex)
        }
        this.view.setModel(this)
        this.view.setEvents([{ name: 'click', handler: () => this.handleClick() }])
    }

    constructor(type: VertexType, attribute: IVertexProps = {}, theme: TTheme) {
        super()
        this.type = type
        this.attribute = Object.assign({}, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }, attribute)
        this.theme = theme
        this.status = VertexStatus.NONE
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

    setStatus(status: VertexStatus) {
        this.status = status
        if (status === VertexStatus.NONE) {
            this.view.setStyle(this.theme.vertex)
            this.view.hideButtonLayer()
        }
    }

    render(): RenderType {
        let { vertex, connector } = this.theme
        return this.view.render([connector, vertex.button])
    }
}

export default VertexModel
