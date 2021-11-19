import { G_HEAD_HEIGHT, G_HEIGHT, G_ITEM_HEIGHT, G_PADDING, G_WIDTH, V_HEIGHT, V_WIDTH } from '../constant'
import { VertexPropType, VertexStatus, VertexType } from '../constant/vertex'
import { IVertexModel, IVertexButtonProp, IVertexProps, IProcessView } from '../interface'
import { RenderType, TTheme } from '../type'
import ConfluenceView from '../view/confluence'
import EventView from '../view/event'
import GroupView from '../view/group'
import GroupItemView from '../view/group_item'
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
        } else if (this.type === VertexType.GROUP_ITEM) {
            this.view = new GroupItemView(this.attribute, this.theme.group.item)
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
        // 设置事件顶点宽度
        if (type === VertexType.EVENT || type === VertexType.CONFLUENCE) {
            this.attribute.width = V_HEIGHT
        }
        // 设置分组顶点宽高
        if (type === VertexType.GROUP) {
            this.attribute.width = G_WIDTH
            this.attribute.height = G_HEIGHT
        }
        // 设置分组项宽高
        if (type === VertexType.GROUP_ITEM) {
            this.attribute.width = G_WIDTH - (G_PADDING + 1) * 2
            this.attribute.height = G_ITEM_HEIGHT
        }
        this.createView()
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

    setButtons(buttons: IVertexButtonProp[]) {
        this.view.setButtons(buttons)
    }

    setAttribute(attribute: IVertexProps): void {
        this.attribute = Object.assign({}, this.attribute, attribute)
        this.view.update(VertexPropType.ATTRIBUTE, this.attribute)
    }

    add(child: IVertexModel) {
        if (!this.isGroup || child.isGroup) return
        // 设置子节点位置
        let y = child.setAttribute({
            x: 3,
            y: (G_ITEM_HEIGHT + G_PADDING) * this.children.length + G_HEAD_HEIGHT + G_PADDING,
        })
        this.children.push(child)

        // 更新分组高度
        // 高度：header高度 + item高度*item个数 + border宽度 + padding宽度
        this.setAttribute({ height: G_HEAD_HEIGHT + (G_ITEM_HEIGHT + G_PADDING) * this.children.length + 2 + G_PADDING * 2 })
        this.view.add(child.render())
    }

    render(): RenderType {
        let { vertex, connector } = this.theme
        return this.view.render([connector, vertex.button])
    }
}

export default VertexModel
