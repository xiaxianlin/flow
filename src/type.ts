import { Text, Group } from 'zrender'

export type RenderType = Group

export type RenderText = Text

export type TAxis = [number, number]

export type TButton = {
    icon: Text
    handler: (...args: any[]) => void
}

export type TEvent = {
    name: string
    handler: (...args: any[]) => void
}

export type TStyle = {
    color?: string
    border?: string
    background?: string
}

export type TGroupStyle = {
    border: string
    background: string
    header: {
        color: string
        background: string
    }
    button: {
        color: string
        background: string
    }
    item?: {
        color: string
        border: string
        background: string
    }
}

export type TUnionStyle = TStyle | TGroupStyle

/**
 * 主题色
 */
export type TTheme = {
    vertex: {
        color: string
        border: string
        background: string
        active?: {
            color?: string
            border?: string
            background?: string
        }
        button?: {
            color?: string
            border?: string
            background?: string
        }
    }
    connector: {
        border: string
        background: string
    }
    edge: {
        border: string
        active?: {
            border?: string
        }
    }
    group: {
        border: string
        background: string
        header: {
            color: string
            background: string
        }
        item?: {
            color: string
            border: string
            background: string
        }
        active?: {
            border: string
            background: string
            header: {
                color: string
                background: string
            }
        }
        button?: {
            color: string

            background: string
        }
    }
}
