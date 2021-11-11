export const enum VertexType {
    NONE = '',
    EVENT = 'event',
    PROCESS = 'process',
    DECISION = 'decision',
    GROUP = 'group',
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
}
