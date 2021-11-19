export const enum VertexType {
    NONE = '',
    EVENT = 'event',
    PROCESS = 'process',
    DECISION = 'decision',
    GROUP = 'group',
    GROUP_ITEM = 'group_item',
    CONFLUENCE = 'confluence',
}

export const enum VertexStatus {
    NONE = '',
    ACTIVE = 'active',
    ERROR = 'error',
    PROCESS = 'process',
    CANCEL = 'cancel',
    SUCCESS = 'success',
    PAUSE = 'pause',
    DISABELD = 'disabled',
}

export const enum VertexButtonType {
    OUTER = 'outer',
    INNER = 'inner',
    GROUP = 'group',
}

export const enum VertexPropType {
    ATTRIBUTE = 'attribute',
    STYLE = 'style',
}
