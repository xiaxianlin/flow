import * as zrender from 'zrender/src/zrender'
import CanvasPainter from 'zrender/src/canvas/Painter'
class Flow {
    private render: zrender.ZRenderType = null

    constructor(container: HTMLElement) {
        zrender.registerPainter('canvas', CanvasPainter)
        this.render = zrender.init(container)
        console.log(this.render)
    }

    init() {}
}

export default Flow
