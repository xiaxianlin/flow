import { TTheme } from '../type'

// 字体
export const FONT_FAMILY = 'sans-serif,Arial,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
export const FONT_SIZE = 12
export const LINE_HEIGHT = 18
// 连接点
export const C_RADIUS = 4
// 顶点
export const V_WIDTH = 150
export const V_HEIGHT = 60
export const V_RADIUS = 4
// 分组
export const G_WIDTH = 200
export const G_HEIGHT = 68
export const G_HEAD_HEIGHT = 32
export const G_PADDING = 4
export const G_ITEM_HEIGHT = 30
export const G_ITEM_MARGIN = 5

export const DEFAULT_THEME: TTheme = {
    vertex: {
        color: '#ffffff',
        border: '#4082e6',
        background: '#5a97f2',
    },
    vertexActive: {
        color: '#ffffff',
        border: '#0057d1',
        background: '#1653fa',
    },
    vertexButton: {
        color: '#3883f8',
        border: '#cfdaef',
        background: '#f4f7fd',
    },
    vertexConnector: {
        border: '#569cff',
        background: '#ffffff',
    },
    edge: {
        border: '#5a97f2',
    },
    edgeActive: {
        border: '#5a97f2',
    },
    group: {
        border: '#d3d9e2',
        background: '#ffffff',
    },
    groupItem: {
        color: '#ffffff',
        border: '#4082e6',
        background: '#5a97f2',
    },
    groupActive: {
        border: '#6597f6',
        background: '#fbfdff',
    },
    groupHeader: {
        color: '#666e79',
        background: '#f4f7fd',
    },
    groupActiveHeader: {
        color: '#31353b',
        background: '#d7e4ff',
    },
    groupButton: {
        color: '#ffffff',
        background: '#3883f8',
    },
}
