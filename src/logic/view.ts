import { Displayable, Group, Element } from 'zrender'

export function setVertexZ(v: Element, z: number) {
    if (v instanceof Displayable) {
        v.attr({ z })
    } else if (v instanceof Group) {
        v.children().forEach((e) => setVertexZ(e, z))
    }
}
