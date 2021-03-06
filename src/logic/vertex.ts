import { BoundingRect } from 'zrender'
import { V_WIDTH } from '../constant'
import { Position } from '../constant/graph'
import { IVertexModel } from '../interface'
import { RenderType, TPosition, TVertextShape } from '../type'

/**
 * 生成顶点的连接点
 * @param attr 顶点属性
 * @returns 四个连点的位置，[上，右，下，左]
 */

export function generateConnectPoints(attr: TVertextShape): TPosition[] {
    let { width, height } = attr
    return [
        [width / 2, 0],
        [width, height / 2],
        [width / 2, height],
        [0, height / 2],
    ]
}

/**
 * 切割文本
 * @param {String} text 被切割的文本
 * @param {Number} fontSize 字体大小
 */
export function cutText(text: string, fontSize: number, max = V_WIDTH): string[] {
    let curLen = 0,
        start = 0,
        end = 0,
        result = []

    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i)
        let pixelLen = code > 255 ? fontSize : fontSize / 2
        curLen += pixelLen
        if (curLen > max) {
            end = i
            result.push(text.substring(start, end))
            start = i
            curLen = pixelLen
        }
        if (i === text.length - 1) {
            end = i
            result.push(text.substring(start, end + 1))
        }
    }
    return result
}

/**
 * 子元素是否在父元素范围内
 * @param ps 父元素的图形信息
 * @param cs 子元素的图形信息
 * @returns boolean
 */
export function parentContainChild(ps: TVertextShape, cs: TVertextShape): boolean {
    let x1 = cs.x,
        x2 = cs.x + cs.width,
        y1 = cs.y,
        y2 = cs.y + cs.height
    return !(x1 > ps.width || x2 < 0 || y1 > ps.height || y2 < 0)
}

/**
 * 获取被覆盖的顶点
 * @param BoundingRect 包围盒
 * @param bgVertices 背景顶点
 */
export function getCoveredVertices(br: BoundingRect, bgVertices: IVertexModel[]) {
    let vBoundingRects = bgVertices.map((v) => v.getBoundingRect())
    let indices: number[] = []
    vBoundingRects.forEach((vb, i) => {
        if (br.intersect(vb)) {
            indices.push(i)
        }
    })
    return indices.map((i) => bgVertices[i])
}

export function getConnectorIndexByPosition(pos: Position): number {
    switch (pos) {
        case Position.TOP:
            return 0
        case Position.RIGHT:
            return 1
        case Position.BOTTOM:
            return 2
        case Position.LEFT:
            return 3
        default:
            return -1
    }
}
