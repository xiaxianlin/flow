import { Position } from '../constant/graph'
import { IEdgeModel, IVertexModel } from '../interface'
import { TPosition } from '../type'

const MIN_GAP = 20
const POINT_RADIUS = 4

type props = {
    ex: number // 结束点X
    ey: number // 结束点Y
    sw: number // 开始点宽度
    sh: number // 开始点高度
    tw: number // 结束点宽度
    th: number // 结束点高度
    hmg: number // 横向最小间距
    vmg: number // 纵向最小间距
}

function calcFromLeftToLeftConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let h = sh >= th ? sh : th
    if (Math.abs(ey) <= th / 2 + MIN_GAP) {
        let hd = ex <= MIN_GAP ? -1 : 1
        let vd = ey >= 0 ? 1 : -1
        let y1 = (ex <= MIN_GAP ? ey : 0) + (h / 2 + MIN_GAP) * hd * vd
        points.push([-MIN_GAP, 0])
        points.push([-MIN_GAP, y1])
        points.push([ex / 2, y1])
        points.push([ex / 2, ey])
    } else {
        let x1 = ex >= 0 ? -MIN_GAP : ex - MIN_GAP
        points.push([x1, 0])
        points.push([x1, ey])
    }
    return points
}
function calcFromLeftToRightConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 在右边
    if (ex <= -MIN_GAP) {
        if (ey != 0) {
            points.push([ex / 2, 0])
            points.push([ex / 2, ey])
        }
    } else {
        if (Math.abs(ey) > vmg) {
            points.push([-MIN_GAP, 0])
            points.push([-MIN_GAP, ey / 2])
            points.push([ex + MIN_GAP, ey / 2])
        } else {
            let x1 = ex + tw >= 0 ? ex + tw + MIN_GAP : MIN_GAP
            let y1 = ey <= 0 ? ey - th / 2 - MIN_GAP : ey + th / 2 + MIN_GAP
            points.push([-MIN_GAP, 0])
            points.push([-MIN_GAP, y1])
            points.push([ex + MIN_GAP, y1])
        }
        points.push([ex + MIN_GAP, ey])
    }
    return points
}
function calcFromLeftToTopConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 左右临界值
    let cv1 = tw / -2 - MIN_GAP * 2
    // 上中临界值
    let cv2 = sh / -2
    // 中下临界值
    let cv3 = sh / 2 + MIN_GAP * 2
    if (ex <= cv1) {
        let y1 = ey > MIN_GAP ? 0 : ey - MIN_GAP
        points.push([ex / 2, 0])
        points.push([ex / 2, y1])
        points.push([ex, y1])
    } else {
        if (ey <= cv2) {
            let x1 = ex >= tw / 2 ? -MIN_GAP : ex - tw / 2 - MIN_GAP
            points.push([x1, 0])
            points.push([x1, ey - MIN_GAP])
            points.push([ex, ey - MIN_GAP])
        } else if (ey > cv2 && ey < cv3) {
            points.push([-MIN_GAP, 0])
            points.push([-MIN_GAP, cv2 - MIN_GAP])
            points.push([ex, cv2 - MIN_GAP])
        } else if (ey >= cv3) {
            if (ex <= -MIN_GAP) {
                points.push([ex, 0])
            } else {
                points.push([-MIN_GAP, 0])
                points.push([-MIN_GAP, ey / 2])
                points.push([ex, ey / 2])
            }
        }
    }
    return points
}
function calcFromLeftToBottomConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 左右临界值
    let cv1 = tw / -2 - MIN_GAP * 2
    let cv2 = sh / -2 - MIN_GAP * 2
    let cv3 = sh / 2
    if (ex <= cv1) {
        let y1 = ey < -MIN_GAP ? 0 : ey + MIN_GAP
        points.push([ex / 2, 0])
        points.push([ex / 2, y1])
        points.push([ex, y1])
    } else {
        if (ey >= cv3) {
            // 下
            let x1 = ex >= tw / 2 ? -MIN_GAP : ex - tw / 2 - MIN_GAP
            points.push([x1, 0])
            points.push([x1, ey + MIN_GAP])
            points.push([ex, ey + MIN_GAP])
        } else if (ey > cv2 && ey < cv3) {
            points.push([-MIN_GAP, 0])
            points.push([-MIN_GAP, cv3 + MIN_GAP])
            points.push([ex, cv3 + MIN_GAP])
        } else if (ey <= cv2) {
            // 上
            if (ex <= -MIN_GAP) {
                points.push([ex, 0])
            } else {
                points.push([-MIN_GAP, 0])
                points.push([-MIN_GAP, ey / 2])
                points.push([ex, ey / 2])
            }
        }
    }
    return points
}
function calcFromRightToLeftConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 在右边
    if (ex >= MIN_GAP) {
        if (ey != 0) {
            points.push([ex / 2, 0])
            points.push([ex / 2, ey])
        }
    } else {
        if (Math.abs(ey) > vmg) {
            points.push([MIN_GAP, 0])
            points.push([MIN_GAP, ey / 2])
            points.push([ex - MIN_GAP, ey / 2])
        } else {
            let x1 = ex + tw >= 0 ? ex + tw + MIN_GAP : MIN_GAP
            let y1 = ey <= 0 ? ey - th / 2 - MIN_GAP : ey + th / 2 + MIN_GAP
            points.push([x1, 0])
            points.push([x1, y1])
            points.push([ex - MIN_GAP, y1])
        }
        points.push([ex - MIN_GAP, ey])
    }
    return points
}
function calcFromRightToRightConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let h = sh >= th ? sh : th
    if (Math.abs(ey) <= th / 2 + MIN_GAP) {
        let hd = ex >= MIN_GAP ? 1 : -1
        let vd = ey <= 0 ? 1 : -1
        let y1 = (ex >= MIN_GAP ? ey : 0) + (h / 2 + MIN_GAP) * hd * vd
        points.push([MIN_GAP, 0])
        points.push([MIN_GAP, y1])
        points.push([ex + MIN_GAP, y1])
        points.push([ex + MIN_GAP, ey])
    } else {
        let x1 = ex <= 0 ? MIN_GAP : ex + MIN_GAP
        points.push([x1, 0])
        points.push([x1, ey])
    }
    return points
}
function calcFromRightToTopConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 左右临界值
    let cv1 = tw / 2 + MIN_GAP * 2
    // 上中临界值
    let cv2 = sh / -2
    // 中下临界值
    let cv3 = sh / 2 + MIN_GAP * 2
    if (ex >= cv1) {
        let y1 = ey > MIN_GAP ? 0 : ey - MIN_GAP
        points.push([ex / 2, 0])
        points.push([ex / 2, y1])
        points.push([ex, y1])
    } else {
        if (ey <= cv2) {
            let x1 = ex < tw / -2 ? MIN_GAP : ex + tw / 2 + MIN_GAP
            points.push([x1, 0])
            points.push([x1, ey - MIN_GAP])
            points.push([ex, ey - MIN_GAP])
        } else if (ey > cv2 && ey < cv3) {
            points.push([MIN_GAP, 0])
            points.push([MIN_GAP, cv2 - MIN_GAP])
            points.push([ex, cv2 - MIN_GAP])
        } else if (ey >= cv3) {
            // 右下角特殊区域
            if (ex >= MIN_GAP) {
                points.push([ex, 0])
            } else {
                points.push([MIN_GAP, 0])
                points.push([MIN_GAP, ey / 2])
                points.push([ex, ey / 2])
            }
        }
    }
    return points
}
function calcFromRightToBottomConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    // 左右临界值
    let cv1 = tw / 2 + MIN_GAP * 2
    // 上中临界值
    let cv2 = sh / -2 - MIN_GAP * 2
    // 中下临界值
    let cv3 = sh / 2
    if (ex >= cv1) {
        let y1 = ey <= -MIN_GAP ? 0 : ey + MIN_GAP
        points.push([ex / 2, 0])
        points.push([ex / 2, y1])
        points.push([ex, y1])
    } else {
        if (ey >= cv3) {
            let x1 = ex < tw / -2 ? MIN_GAP : ex + tw / 2 + MIN_GAP
            points.push([x1, 0])
            points.push([x1, ey + MIN_GAP])
            points.push([ex, ey + MIN_GAP])
        } else if (ey > cv2 && ey < cv3) {
            points.push([MIN_GAP, 0])
            points.push([MIN_GAP, cv3 + MIN_GAP])
            points.push([ex, cv3 + MIN_GAP])
        } else if (ey <= cv2) {
            if (ex >= MIN_GAP) {
                points.push([ex, 0])
            } else {
                points.push([MIN_GAP, 0])
                points.push([MIN_GAP, ey / 2])
                points.push([ex, ey / 2])
            }
        }
    }
    return points
}
function calcFromTopToLeftConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let v1 = sw / 2 + MIN_GAP
    if (ey <= -hmg) {
        let x1 = ex > MIN_GAP ? 0 : ex - MIN_GAP
        points.push([0, ey / 2])
        points.push([x1, ey / 2])
        points.push([x1, ey])
    } else {
        if (ex <= -v1) {
            let y1 = ey >= th / 2 ? -MIN_GAP : ey - th / 2 - MIN_GAP
            points.push([0, y1])
            points.push([ex - MIN_GAP, y1])
            points.push([ex - MIN_GAP, ey])
        } else if (ex > -v1 && ex < vmg) {
            points.push([0, -MIN_GAP])
            points.push([-v1 - MIN_GAP, -MIN_GAP])
            points.push([-v1 - MIN_GAP, ey])
        } else if (ex >= vmg) {
            if (ey <= -MIN_GAP) {
                points.push([0, ey])
            } else {
                points.push([0, -MIN_GAP])
                points.push([ex / 2, -MIN_GAP])
                points.push([ex / 2, ey])
            }
        }
    }
    return points
}
function calcFromTopToRightConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let v1 = tw + MIN_GAP
    if (ey <= -hmg) {
        let x1 = ex < -MIN_GAP ? 0 : ex + MIN_GAP
        points.push([0, ey / 2])
        points.push([x1, ey / 2])
        points.push([x1, ey])
    } else {
        if (ex >= v1) {
            let y1 = ey >= th / 2 ? -MIN_GAP : ey - th / 2 - MIN_GAP
            points.push([0, y1])
            points.push([ex + MIN_GAP, y1])
            points.push([ex + MIN_GAP, ey])
        } else if (ex < v1 && ex > -vmg) {
            points.push([0, -MIN_GAP])
            points.push([v1 + MIN_GAP, -MIN_GAP])
            points.push([v1 + MIN_GAP, ey])
        } else if (ex <= -vmg) {
            if (ey <= -MIN_GAP) {
                points.push([0, ey])
            } else {
                points.push([0, -MIN_GAP])
                points.push([ex / 2, -MIN_GAP])
                points.push([ex / 2, ey])
            }
        }
    }
    return points
}
function calcFromTopToTopConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let w = sw >= tw ? sw : tw
    if (Math.abs(ex) <= sw / 2 + MIN_GAP) {
        let vd = ex >= 0 ? 1 : -1
        let hd = ey >= MIN_GAP ? 1 : -1
        let x1 = (ey >= sh + MIN_GAP ? 0 : ex) + (w / 2 + MIN_GAP) * vd * hd
        points.push([0, -MIN_GAP])
        points.push([x1, -MIN_GAP])
        points.push([x1, ey - MIN_GAP])
        points.push([ex, ey - MIN_GAP])
    } else {
        let y1 = ey >= 0 ? -MIN_GAP : ey - MIN_GAP
        points.push([0, y1])
        points.push([ex, y1])
    }
    return points
}
function calcFromTopToBottomConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    if (ey <= -MIN_GAP * 2) {
        if (ex != 0) {
            points.push([0, ey / 2])
            points.push([ex, ey / 2])
        }
    } else {
        let vd = ex >= 0 ? -1 : 1
        let y1 = ey >= sh ? ey + MIN_GAP : sh + MIN_GAP
        points.push([0, -MIN_GAP])
        if (Math.abs(ex) <= vmg * 2) {
            points.push([vd * vmg, -MIN_GAP])
            points.push([vd * vmg, y1])
            points.push([ex, y1])
        } else {
            points.push([ex / 2, -MIN_GAP])
            points.push([ex / 2, ey + MIN_GAP])
            points.push([ex, ey + MIN_GAP])
        }
    }
    return points
}
function calcFromBottomToLeftConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    if (ey >= vmg) {
        let x1 = ex > MIN_GAP ? 0 : ex - MIN_GAP
        points.push([0, ey / 2])
        points.push([x1, ey / 2])
        points.push([x1, ey])
    } else {
        if (ex <= -hmg / 2 + MIN_GAP) {
            let y1 = ex <= tw / 2 ? MIN_GAP : ey + th / 2 + MIN_GAP
            points.push([0, y1])
            points.push([ex - MIN_GAP, y1])
            points.push([ex - MIN_GAP, ey])
        } else if (ex > -hmg / 2 + MIN_GAP && ex < hmg) {
            points.push([0, MIN_GAP])
            points.push([-hmg / 2, MIN_GAP])
            points.push([-hmg / 2, ey])
        } else if (ex >= hmg) {
            if (ey >= MIN_GAP) {
                points.push([0, ey])
            } else {
                points.push([0, MIN_GAP])
                points.push([ex / 2, MIN_GAP])
                points.push([ex / 2, ey])
            }
        }
    }
    return points
}
function calcFromBottomToRightConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    let v1 = sw / 2 + MIN_GAP
    if (ey >= vmg) {
        let x1 = ex < -MIN_GAP ? 0 : ex + MIN_GAP
        points.push([0, ey / 2])
        points.push([x1, ey / 2])
        points.push([x1, ey])
    } else {
        if (ex >= hmg / 2) {
            let y1 = ex >= tw / 2 ? MIN_GAP : ey - th / 2 + MIN_GAP
            points.push([0, y1])
            points.push([ex + MIN_GAP, y1])
            points.push([ex + MIN_GAP, ey])
        } else if (ex < hmg / 2 && ex > -hmg) {
            points.push([0, MIN_GAP])
            points.push([hmg / 2 + MIN_GAP, MIN_GAP])
            points.push([hmg / 2 + MIN_GAP, ey])
        } else if (ex <= -hmg) {
            if (ey >= MIN_GAP) {
                points.push([0, ey])
            } else {
                points.push([0, MIN_GAP])
                points.push([ex / 2, MIN_GAP])
                points.push([ex / 2, ey])
            }
        }
    }
    return points
}
function calcFromBottomToTopConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    if (ey >= MIN_GAP) {
        if (ey != 0) {
            points.push([0, ey / 2])
            points.push([ex, ey / 2])
        }
    } else {
        if (Math.abs(ex) > hmg) {
            points.push([0, MIN_GAP])
            points.push([ex / 2, MIN_GAP])
            points.push([ex / 2, ey - MIN_GAP])
        } else {
            let x1 = ex <= 0 ? ex - tw / 2 - MIN_GAP : ex + tw / 2 + MIN_GAP
            points.push([0, MIN_GAP])
            points.push([x1, MIN_GAP])
            points.push([x1, ey - MIN_GAP])
        }
        points.push([ex, ey - MIN_GAP])
    }
    return points
}
function calcFromBottomToBottomConnectorPoints({ ex, ey, sw, sh, tw, th, hmg, vmg }: props) {
    let points = []
    if (Math.abs(ex) <= hmg / 2 + MIN_GAP) {
        let vd = ex >= 0 ? -1 : 1
        let hd = ey >= MIN_GAP ? 1 : -1
        let x1 = (ey <= sh + MIN_GAP ? 0 : ex) + (hmg / 2 + MIN_GAP) * vd * hd
        points.push([0, MIN_GAP])
        points.push([x1, MIN_GAP])
        points.push([x1, ey + MIN_GAP])
        points.push([ex, ey + MIN_GAP])
    } else {
        let y1 = ey <= 0 ? MIN_GAP : ey + MIN_GAP
        points.push([0, y1])
        points.push([ex, y1])
    }
    return points
}
// 计算连接点的方法对象
const calcConnectorPointsFunctions = {
    [Position.LEFT]: {
        [Position.LEFT]: calcFromLeftToLeftConnectorPoints,
        [Position.RIGHT]: calcFromLeftToRightConnectorPoints,
        [Position.TOP]: calcFromLeftToTopConnectorPoints,
        [Position.BOTTOM]: calcFromLeftToBottomConnectorPoints,
    },
    [Position.RIGHT]: {
        [Position.LEFT]: calcFromRightToLeftConnectorPoints,
        [Position.RIGHT]: calcFromRightToRightConnectorPoints,
        [Position.TOP]: calcFromRightToTopConnectorPoints,
        [Position.BOTTOM]: calcFromRightToBottomConnectorPoints,
    },
    [Position.TOP]: {
        [Position.LEFT]: calcFromTopToLeftConnectorPoints,
        [Position.RIGHT]: calcFromTopToRightConnectorPoints,
        [Position.TOP]: calcFromTopToTopConnectorPoints,
        [Position.BOTTOM]: calcFromTopToBottomConnectorPoints,
    },
    [Position.BOTTOM]: {
        [Position.LEFT]: calcFromBottomToLeftConnectorPoints,
        [Position.RIGHT]: calcFromBottomToRightConnectorPoints,
        [Position.TOP]: calcFromBottomToTopConnectorPoints,
        [Position.BOTTOM]: calcFromBottomToBottomConnectorPoints,
    },
}

/**
 * 计算中间顶点
 * @param  {Position} begin 开始位置
 * @param  {Position} end   结束位置
 */
function calcCentralPoints(begin: Position, end: Position) {
    // 获取路线的计算方法
    let fn = calcConnectorPointsFunctions[begin][end]
    /**
     * 处理参数
     * 参数处理后将传入8个参数给路线计算方法分别，ex,ey,sw,sh,tw,th,hmg,vmg
     * @param  {Number} x  结束点X轴
     * @param  {Number} y  结束点Y轴
     * @param  {Number} sw 开始点的宽度
     * @param  {Number} sh 开始点的高度
     * @param  {Number} tw 结束点的宽度
     * @param  {Number} th 结束点的高度
     */
    return function (ex: number, ey: number, sw: number, sh: number, tw: number, th: number) {
        let hmg = MIN_GAP * 2 + (sw + tw) / 2
        let vmg = MIN_GAP * 2 + (sh + th) / 2
        return fn({ ex, ey, sw, sh, tw, th, hmg, vmg }) || []
    }
}

// --------------------------------------------------下面是对外访问的函数-------------------------------------------------- //

/**
 * 计算线的位置点
 * @param edge 边模型
 * @returns Number[][]
 */
function calcLinePoints(edge: IEdgeModel) {
    let points = []

    let [source, sp] = edge.getSource()
    let [target, tp] = edge.getTarget()
    let [ex, ey] = target.getConnectorPosition(tp)

    let ss = source.getShape()
    let ts = target.getShape()
    // 计算中间的顶点
    let centralPoints = calcCentralPoints(sp, tp)(ex, ey, ss.width, ss.height, ts.width, ts.height)
    let oex = 0,
        oey = 0,
        osx = 0,
        osy = 0
    switch (tp) {
        case Position.LEFT:
            oex -= POINT_RADIUS * 2
            break
        case Position.RIGHT:
            oex += POINT_RADIUS * 2
            break
        case Position.TOP:
            oey -= POINT_RADIUS * 2
            break
        case Position.BOTTOM:
            oey += POINT_RADIUS * 2
            break
    }
    switch (sp) {
        case Position.LEFT:
            osx -= POINT_RADIUS * 2
            break
        case Position.RIGHT:
            osx += POINT_RADIUS * 2
            break
        case Position.TOP:
            osy -= POINT_RADIUS * 2
            break
        case Position.BOTTOM:
            osy += POINT_RADIUS * 2
            break
    }
    points.push([0 + osx, 0 + osy])
    points = points.concat(centralPoints)
    points.push([ex + oex, ey + oey])
    points = points.map((item) => [Math.ceil(item[0]), Math.ceil(item[1])])
    return points
}

/**
 * 计算文本在线上的位置
 * @param {Array} points 连接线的所有点
 */
function clacTextAxis(points: TPosition[]) {
    let center = Math.floor(points.length / 2) - 1
    let x = points[center][0] + (points[center + 1][0] - points[center][0]) / 2
    let y = points[center][1] + (points[center + 1][1] - points[center][1]) / 2 - 5
    return { x, y }
}

export { calcLinePoints, clacTextAxis }
