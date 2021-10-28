import { IVertexAttribute } from '../interface'
import { TAxis } from '../type'

/**
 * 生成顶点的连接点
 * @param attr 顶点属性
 * @returns 四个连点的位置，[上，右，下，左]
 */

export function generateConnectPoints(attr: IVertexAttribute): TAxis[] {
    let { width, height } = attr
    return [
        [width / 2, 0],
        [width, height / 2],
        [width / 2, height],
        [0, height / 2],
    ]
}
