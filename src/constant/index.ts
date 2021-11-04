import { ITheme } from '../interface'

// 字体
export const FONT_FAMILY = 'sans-serif,Arial,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
export const FONT_SIZE = 12
export const LINE_HEIGHT = 18
// 顶点
export const V_WIDTH = 150
export const V_HEIGHT = 60
export const V_RADIUS = 4
// 分组
export const G_WIDTH = 200
export const G_HEIGHT = 80
export const G_HEAD_HEIGHT = 32
export const G_ITEM_HEIGHT = 30
export const G_ITEM_MARGIN = 5

export const DEFAULT_THEME: ITheme = {
    vertex: {
        text: '#ffffff',
        border: '#4082e6',
        background: '#5a97f2',
        active: {
            text: '#ffffff',
            border: '#0057d1',
            background: '#1653fa',
        },
    },
    connector: {
        border: '#569cff',
        background: '#ffffff',
    },
    edge: {
        border: '#d3d9e2',
        active: {
            border: '#5a97f2',
        },
    },
    group: {
        border: '#d3d9e2',
        background: '#ffffff',
        header: {
            text: '#666e79',
            background: 'f4f7fd',
        },
        button: {
            text: '#ffffff',
            background: '#3883f8',
        },
    },
}
