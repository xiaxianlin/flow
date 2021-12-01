import { IModel, IView, IContainer } from '../interface'
import { vid } from '../logic/common'
import { RenderType, TTheme } from '../type'

class BaseModel implements IModel {
    public id: string
    protected view: IView
    protected contaienr: IContainer
    protected groupId: string
    protected theme: TTheme

    constructor() {
        this.id = vid()
    }

    render(): RenderType {
        return this.view.render()
    }

    setContainer(container: IContainer): void {
        this.contaienr = container
    }
}

export default BaseModel
