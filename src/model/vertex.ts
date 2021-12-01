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

    /**
     * 更新分组高度
     */
    private updateGroupHeigt() {
        // 高度：header高度 + item高度*item个数 + border宽度 + padding宽度
        if (this.children.length > 0) {
            this.setShape({ height: G_HEAD_HEIGHT + (G_ITEM_HEIGHT + G_PADDING) * this.children.length + 2 + G_PADDING * 2 - G_PADDING })
        } else {
            this.setShape({ height: G_HEIGHT })
        }
        this.view.update()
    }

    private updateGroupItemPosition(v: IVertexModel, i: number) {
        v.setShape({ x: G_PADDING + 1, y: (G_ITEM_HEIGHT + G_PADDING) * i + G_HEAD_HEIGHT + G_PADDING + 1 })
    }

    /**
     * 视图工厂
     * @param type 视图类型
     * @returns 视图
     */
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

    private init(type: VertexType) {
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

    constructor(type: VertexType, shape: TVertextShape = {}, theme: TTheme) {
        super()
        this.shape = Object.assign({}, { x: 10, y: 10, width: V_WIDTH, height: V_HEIGHT }, shape)
        this.theme = theme
        this.status = VertexStatus.NONE
        this.isGroup = type === VertexType.GROUP
        this.init(type)
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

    setType(type: VertexType): void {
        let buttons = this.view.getButtons()
        // 重新初始化视图信息
        this.init(type)
        this.view.setButtons(buttons)
        this.view.update()
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

        let i = this.children.push(child)
        this.view.add(child.render())

        this.updateGroupHeigt()
        this.updateGroupItemPosition(child, i - 1)
    }

    remove(child: IVertexModel): void {
        if (!this.isGroup || child.isGroup) return

        // 删除视图
        this.view.remove(child.getView())
        // 删除元素
        this.children = this.children.filter((v) => v !== child)

        this.updateGroupHeigt()
        this.children.forEach((v, i) => this.updateGroupItemPosition(v, i))
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
