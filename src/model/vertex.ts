import { V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { IVertexModel, IVertexButtonProps, IVertexProps, IProcessView } from '../interface'
import { RenderType, TTheme } from '../type'
import ConfluenceView from '../view/confluence'
import EventView from '../view/event'
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
        } else if (this.type === VertexType.EVENT) {
            this.view = new EventView(this.attribute, this.theme.vertex)
        } else if (this.type === VertexType.CONFLUENCE) {
            this.view = new ConfluenceView(this.attribute, this.theme.vertex)
        }
        if (!this.view) return
        this.view.setModel(this)
        this.view.setEvents([{ name: 'click', handler: () => this.handleClick() }])
    }

    constructor(type: VertexType, attribute: IVertexProps = {}, theme: TTheme) {
        super()
        this.type = type
        this.attribute = Object.assign({}, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }, attribute)
        this.theme = theme
        this.status = VertexStatus.NONE
        // 事件顶点宽度和高度一致
        if (type === VertexType.EVENT || type === VertexType.CONFLUENCE) {
            this.attribute.width = V_HEIGHT
        }

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
