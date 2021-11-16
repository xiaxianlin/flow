import { G_HEIGHT, G_WIDTH, V_HEIGHT, V_WIDTH } from '../constant'
import { VertexStatus, VertexType } from '../constant/vertex'
import { IVertexModel, IVertexButtonProp, IVertexProps, IProcessView } from '../interface'
import { RenderType, TTheme } from '../type'
import ConfluenceView from '../view/confluence'
import EventView from '../view/event'
import GroupView from '../view/group'
import ProcessView from '../view/process'
import BaseModel from './base'

class VertexModel extends BaseModel implements IVertexModel {
    private type: VertexType
    private status: VertexStatus
    private attribute: IVertexProps
    private children: IVertexModel[] = []
    public isGroup: boolean = false

    private handleClick() {
        if (this.status === VertexStatus.ACTIVE) return
        this.status = VertexStatus.ACTIVE
        this.contaienr.setActive(this)
        if (this.isGroup) {
            this.view.setStyle(this.theme.group.active)
        } else {
            this.view.setStyle(this.theme.vertex.active)
        }
        this.view.showButtonLayer()
    }

    private createView() {
        if (this.type === VertexType.PROCESS) {
            this.view = new ProcessView(this.attribute, this.theme.vertex)
        } else if (this.type === VertexType.EVENT) {
            this.view = new EventView(this.attribute, this.theme.vertex)
        } else if (this.type === VertexType.CONFLUENCE) {
            this.view = new ConfluenceView(this.attribute, this.theme.vertex)
        } else if (this.type === VertexType.GROUP) {
            this.view = new GroupView(this.attribute, this.theme.group)
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
        this.isGroup = type === VertexType.GROUP
        // 事件顶点宽度和高度一致
        if (type === VertexType.EVENT || type === VertexType.CONFLUENCE) {
            this.attribute.width = V_HEIGHT
        }
        // 分组顶点宽高不一致
        if (this.isGroup) {
            this.attribute.width = G_WIDTH
            this.attribute.height = G_HEIGHT
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

    setButtons(buttons: IVertexButtonProp[]) {
        this.view.setButtons(buttons)
    }

    setStatus(status: VertexStatus) {
        this.status = status
        if (status === VertexStatus.NONE) {
            if (this.isGroup) {
                this.view.setStyle(this.theme.group)
            } else {
                this.view.setStyle(this.theme.vertex)
            }
            this.view.hideButtonLayer()
        }
    }

    add(child: IVertexModel) {
        if (!this.isGroup || child.isGroup) return
        this.children.push(child)
    }

    render(): RenderType {
        let { vertex, connector } = this.theme
        return this.view.render([connector, vertex.button])
    }
}

export default VertexModel
