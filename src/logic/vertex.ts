import { V_WIDTH } from '../constant'
import { TAxis, TVertextShape } from '../type'

/**
 * 生成顶点的连接点
 * @param attr 顶点属性
 * @returns 四个连点的位置，[上，右，下，左]
 */ 

export function generateConnectPoints(attr: TVertextShape): TAxis[] {
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
