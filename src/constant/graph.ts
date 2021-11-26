export const enum GraphStatus {
    EDIT = 'edit',
    LINK = 'link',
    MOVE = 'move',
    READONLY = 'readony',
    DISABLED = 'disabled',
    SELECTING = 'selecting',
}

export const enum MoveType {
    DRAG = 'drag',
    LINK = 'link',
    SELECT = 'select',
}

export const enum GraphEvent {
    CLICK = 'click',
    DBCLICK = 'dbclick',
    INGROUP = 'ingroup',
    OUTGROUP = 'outgroup',
}
