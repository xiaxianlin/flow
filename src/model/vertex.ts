import { ElementEvent } from 'zrender'
import { G_HEAD_HEIGHT, G_HEIGHT, G_ITEM_HEIGHT, G_PADDING, G_WIDTH, V_HEIGHT, V_WIDTH } from '../constant'
import { VertexPropType, VertexStatus, VertexType } from '../constant/vertex'
import { IVertexModel, IView } from '../interface'
import { parentContainChild } from '../logic/vertex'
import { RenderType, TPosition, TStyle, TTheme, TVertexButtonProp, TVertextShape } from '../type'
import ConfluenceView from '../view/confluence'
import EventView from '../view/event'
import GroupView from '../view/group'
import GroupItemView from '../view/group_item'
import ProcessView from '../view/process'
import BaseModel from './base'

class VertexModel extends BaseModel implements IVertexModel {
    isGroup: boolean = false
    private status: VertexStatus
    private shape: TVertextShape
    private children: IVertexModel[] = []
    private group: IVertexModel

    private handleClick() {
        if (this.status === VertexStatus.ACTIVE) return
        this.status = VertexStatus.ACTIVE
        this.contaienr.setActive(this)
        this.view.setStyle(this.isGroup ? this.theme.groupActive : this.theme.vertexActive)
        this.view.showButtonLayer()
    }

    private handleDragStart(evt: ElementEvent) {
        this.contaienr.setDragTarget(this, evt)
    }

    private viewFactory(type: VertexType): IView {
        let { vertex, vertexButton, vertexConnector } = this.theme
        let baseArgs: [TVertextShape, TStyle, TStyle, TStyle] = [this.shape, vertex, vertexButton, vertexConnector]
        let view = null
        switch (type) {
            case VertexType.EVENT:
                view = new EventView(...baseArgs)
                break
            case VertexType.CONFLUENCE:
                view = new ConfluenceView(...baseArgs)
                break
            case VertexType.PROCESS:
                view = new ProcessView(...baseArgs)
                break
            case VertexType.GROUP_ITEM:
                view = new GroupItemView(...baseArgs)
                break
            case VertexType.GROUP:
                let { group, groupHeader, groupButton } = this.theme
                view = new GroupView(this.shape, group, vertexButton, vertexConnector)
                view.setGroupHeaderStyle(groupHeader)
                view.setGroupButtonStyle(groupButton)
                break
        }
        return view
    }

    constructor(type: VertexType, shape: TVertextShape = {}, theme: TTheme) {
        super()
        this.shape = Object.assign({}, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }, shape)
        this.theme = theme
        this.status = VertexStatus.NONE
        this.isGroup = type === VertexType.GROUP
        // 设置事件顶点宽度
        if (type === VertexType.EVENT || type === VertexType.CONFLUENCE) {
            this.shape.width = V_HEIGHT
        }
        // 设置分组顶点宽高
        if (type === VertexType.GROUP) {
            this.shape.width = G_WIDTH
            this.shape.height = G_HEIGHT
        }
        // 设置分组项宽高
        if (type === VertexType.GROUP_ITEM) {
            this.shape.width = G_WIDTH - (G_PADDING + 1) * 2
            this.shape.height = G_ITEM_HEIGHT
        }

        this.view = this.viewFactory(type)
        if (this.view) {
            this.view.setModel(this)
            this.view.setEvents([
                { name: 'click', handler: () => this.handleClick() },
                { name: 'dragstart', handler: (evt) => this.handleDragStart(evt) },
            ])
        }
    }

    setStatus(status: VertexStatus) {
        this.status = status
        if (status === VertexStatus.NONE) {
            this.view.setStyle(this.isGroup ? this.theme.group : this.theme.vertex)
            this.view.hideButtonLayer()
        }
    }

    setButtons(buttons: TVertexButtonProp[]) {
        this.view.setButtons(buttons)
    }

    setShape(shape: TVertextShape): void {
        this.shape = Object.assign({}, this.shape, shape)
        this.view.setShape(this.shape)
    }

    setGroup(group: IVertexModel): void {
        this.group = group
    }

    getShape(): TVertextShape {
        return this.shape
    }

    getGroup(): IVertexModel {
        return this.group
    }

    getView(): RenderType {
        return this.view.getView()
    }

    add(child: IVertexModel): void {
        if (!this.isGroup || child.isGroup) return
        // 设置子节点位置
        let y = child.setShape({
            x: G_PADDING + 1,
            y: (G_ITEM_HEIGHT + G_PADDING) * this.children.length + G_HEAD_HEIGHT + G_PADDING + 1,
            width: G_WIDTH - G_PADDING * 2 - 2,
        })
        this.children.push(child)
        this.view.add(child.render())

        // 更新分组高度
        // 高度：header高度 + item高度*item个数 + border宽度 + padding宽度
        this.setShape({ height: G_HEAD_HEIGHT + (G_ITEM_HEIGHT + G_PADDING) * this.children.length + 2 + G_PADDING * 2 - G_PADDING })
        this.view.update()
    }

    remove(child: IVertexModel): void {
        if (!this.isGroup || child.isGroup) return
        this.view.remove(child.getView())
    }

    inView(): boolean {
        let cShape = this.shape
        let pShape = this.group.getShape()
        return parentContainChild(pShape, cShape)
    }

    render(): RenderType {
        return this.view.render()
    }
}

export default VertexModel
