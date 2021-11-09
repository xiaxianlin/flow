export const enum VertexType {
    NONE = '',
    EVENT = 'event',
    PROCESS = 'process',
    DECISION = 'decision',
    GROUP = 'group',
    CONFLUENCE = 'confluence',
    EVENT_START = 1,
    EVENT_OVER = 2,
    PROCESS_WORKFLOW = 1,
    PROCESS_ACTION = 2,
    PROCESS_MANUAL = 3,
    PROCESS_SCRIPT = 4,
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
