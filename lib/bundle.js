
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Flow = factory());
})(this, (function () { 'use strict';

    var Browser = /** @class */ (function () {
        function Browser() {
            this.firefox = false;
            this.ie = false;
            this.edge = false;
            this.newEdge = false;
            this.weChat = false;
        }
        return Browser;
    }());
    var Env = /** @class */ (function () {
        function Env() {
            this.browser = new Browser();
            this.node = false;
            this.wxa = false;
            this.worker = false;
            this.canvasSupported = false;
            this.svgSupported = false;
            this.touchEventsSupported = false;
            this.pointerEventsSupported = false;
            this.domSupported = false;
            this.transformSupported = false;
            this.transform3dSupported = false;
        }
        return Env;
    }());
    var env = new Env();
    if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
        env.wxa = true;
        env.canvasSupported = true;
        env.touchEventsSupported = true;
    }
    else if (typeof document === 'undefined' && typeof self !== 'undefined') {
        // In worker
        env.worker = true;
        env.canvasSupported = true;
    }
    else if (typeof navigator === 'undefined') {
        // In node
        env.node = true;
        env.canvasSupported = true;
        env.svgSupported = true;
    }
    else {
        detect(navigator.userAgent, env);
    }
    // Zepto.js
    // (c) 2010-2013 Thomas Fuchs
    // Zepto.js may be freely distributed under the MIT license.
    function detect(ua, env) {
        var browser = env.browser;
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        var ie = ua.match(/MSIE\s([\d.]+)/)
            // IE 11 Trident/7.0; rv:11.0
            || ua.match(/Trident\/.+?rv:(([\d.]+))/);
        var edge = ua.match(/Edge?\/([\d.]+)/); // IE 12 and 12+
        var weChat = (/micromessenger/i).test(ua);
        if (firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }
        if (ie) {
            browser.ie = true;
            browser.version = ie[1];
        }
        if (edge) {
            browser.edge = true;
            browser.version = edge[1];
            browser.newEdge = +edge[1].split('.')[0] > 18;
        }
        // It is difficult to detect WeChat in Win Phone precisely, because ua can
        // not be set on win phone. So we do not consider Win Phone.
        if (weChat) {
            browser.weChat = true;
        }
        env.canvasSupported = !!document.createElement('canvas').getContext;
        env.svgSupported = typeof SVGRect !== 'undefined';
        env.touchEventsSupported = 'ontouchstart' in window && !browser.ie && !browser.edge;
        env.pointerEventsSupported = 'onpointerdown' in window
            && (browser.edge || (browser.ie && +browser.version >= 11));
        env.domSupported = typeof document !== 'undefined';
        var style = document.documentElement.style;
        env.transform3dSupported = (
        // IE9 only supports transform 2D
        // transform 3D supported since IE10
        // we detect it by whether 'transition' is in style
        (browser.ie && 'transition' in style)
            // edge
            || browser.edge
            // webkit
            || (('WebKitCSSMatrix' in window) && ('m11' in new WebKitCSSMatrix()))
            // gecko-based browsers
            || 'MozPerspective' in style) // Opera supports CSS transforms after version 12
            && !('OTransition' in style);
        // except IE 6-8 and very old firefox 2-3 & opera 10.1
        // other browsers all support `transform`
        env.transformSupported = env.transform3dSupported
            // transform 2D is supported in IE9
            || (browser.ie && +browser.version >= 9);
    }

    // 用于处理merge时无法遍历Date等对象的问题
    var BUILTIN_OBJECT = {
        '[object Function]': true,
        '[object RegExp]': true,
        '[object Date]': true,
        '[object Error]': true,
        '[object CanvasGradient]': true,
        '[object CanvasPattern]': true,
        // For node-canvas
        '[object Image]': true,
        '[object Canvas]': true
    };
    var TYPED_ARRAY = {
        '[object Int8Array]': true,
        '[object Uint8Array]': true,
        '[object Uint8ClampedArray]': true,
        '[object Int16Array]': true,
        '[object Uint16Array]': true,
        '[object Int32Array]': true,
        '[object Uint32Array]': true,
        '[object Float32Array]': true,
        '[object Float64Array]': true
    };
    var objToString = Object.prototype.toString;
    var arrayProto = Array.prototype;
    var nativeForEach = arrayProto.forEach;
    var nativeSlice = arrayProto.slice;
    var nativeMap = arrayProto.map;
    // In case some env may redefine the global variable `Function`.
    var ctorFunction = function () { }.constructor;
    var protoFunction = ctorFunction ? ctorFunction.prototype : null;
    var protoKey = '__proto__';
    // Avoid assign to an exported constiable, for transforming to cjs.
    var methods$1 = {};
    var idStart = 0x0907;
    /**
     * Generate unique id
     */
    function guid() {
        return idStart++;
    }
    function logError() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof console !== 'undefined') {
            console.error.apply(console, args);
        }
    }
    /**
     * Those data types can be cloned:
     *     Plain object, Array, TypedArray, number, string, null, undefined.
     * Those data types will be assgined using the orginal data:
     *     BUILTIN_OBJECT
     * Instance of user defined class will be cloned to a plain object, without
     * properties in prototype.
     * Other data types is not supported (not sure what will happen).
     *
     * Caution: do not support clone Date, for performance consideration.
     * (There might be a large number of date in `series.data`).
     * So date should not be modified in and out of echarts.
     */
    function clone(source) {
        if (source == null || typeof source !== 'object') {
            return source;
        }
        var result = source;
        var typeStr = objToString.call(source);
        if (typeStr === '[object Array]') {
            if (!isPrimitive(source)) {
                result = [];
                for (var i = 0, len = source.length; i < len; i++) {
                    result[i] = clone(source[i]);
                }
            }
        }
        else if (TYPED_ARRAY[typeStr]) {
            if (!isPrimitive(source)) {
                /* eslint-disable-next-line */
                var Ctor = source.constructor;
                if (Ctor.from) {
                    result = Ctor.from(source);
                }
                else {
                    result = new Ctor(source.length);
                    for (var i = 0, len = source.length; i < len; i++) {
                        result[i] = clone(source[i]);
                    }
                }
            }
        }
        else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
            result = {};
            for (var key in source) {
                // Check if key is __proto__ to avoid prototype pollution
                if (source.hasOwnProperty(key) && key !== protoKey) {
                    result[key] = clone(source[key]);
                }
            }
        }
        return result;
    }
    function merge(target, source, overwrite) {
        // We should escapse that source is string
        // and enter for ... in ...
        if (!isObject(source) || !isObject(target)) {
            return overwrite ? clone(source) : target;
        }
        for (var key in source) {
            // Check if key is __proto__ to avoid prototype pollution
            if (source.hasOwnProperty(key) && key !== protoKey) {
                var targetProp = target[key];
                var sourceProp = source[key];
                if (isObject(sourceProp)
                    && isObject(targetProp)
                    && !isArray(sourceProp)
                    && !isArray(targetProp)
                    && !isDom(sourceProp)
                    && !isDom(targetProp)
                    && !isBuiltInObject(sourceProp)
                    && !isBuiltInObject(targetProp)
                    && !isPrimitive(sourceProp)
                    && !isPrimitive(targetProp)) {
                    // 如果需要递归覆盖，就递归调用merge
                    merge(targetProp, sourceProp, overwrite);
                }
                else if (overwrite || !(key in target)) {
                    // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                    // NOTE，在 target[key] 不存在的时候也是直接覆盖
                    target[key] = clone(source[key]);
                }
            }
        }
        return target;
    }
    function extend(target, source) {
        // @ts-ignore
        if (Object.assign) {
            // @ts-ignore
            Object.assign(target, source);
        }
        else {
            for (var key in source) {
                // Check if key is __proto__ to avoid prototype pollution
                if (source.hasOwnProperty(key) && key !== protoKey) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
    function defaults(target, source, overlay) {
        var keysArr = keys(source);
        for (var i = 0; i < keysArr.length; i++) {
            var key = keysArr[i];
            if ((overlay ? source[key] != null : target[key] == null)) {
                target[key] = source[key];
            }
        }
        return target;
    }
    var createCanvas = function () {
        return methods$1.createCanvas();
    };
    methods$1.createCanvas = function () {
        return document.createElement('canvas');
    };
    /**
     * 查询数组中元素的index
     */
    function indexOf(array, value) {
        if (array) {
            if (array.indexOf) {
                return array.indexOf(value);
            }
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
        }
        return -1;
    }
    function mixin(target, source, override) {
        target = 'prototype' in target ? target.prototype : target;
        source = 'prototype' in source ? source.prototype : source;
        // If build target is ES6 class. prototype methods is not enumerable. Use getOwnPropertyNames instead
        // TODO: Determine if source is ES6 class?
        if (Object.getOwnPropertyNames) {
            var keyList = Object.getOwnPropertyNames(source);
            for (var i = 0; i < keyList.length; i++) {
                var key = keyList[i];
                if (key !== 'constructor') {
                    if ((override ? source[key] != null : target[key] == null)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        else {
            defaults(target, source, override);
        }
    }
    /**
     * Consider typed array.
     * @param data
     */
    function isArrayLike(data) {
        if (!data) {
            return false;
        }
        if (typeof data === 'string') {
            return false;
        }
        return typeof data.length === 'number';
    }
    /**
     * 数组或对象遍历
     */
    function each(arr, cb, context) {
        if (!(arr && cb)) {
            return;
        }
        if (arr.forEach && arr.forEach === nativeForEach) {
            arr.forEach(cb, context);
        }
        else if (arr.length === +arr.length) {
            for (var i = 0, len = arr.length; i < len; i++) {
                // FIXME: should the elided item be travelled? like `[33,,55]`.
                cb.call(context, arr[i], i, arr);
            }
        }
        else {
            for (var key in arr) {
                if (arr.hasOwnProperty(key)) {
                    cb.call(context, arr[key], key, arr);
                }
            }
        }
    }
    /**
     * Array mapping.
     * @typeparam T Type in Array
     * @typeparam R Type Returned
     * @return Must be an array.
     */
    function map(arr, cb, context) {
        // Take the same behavior with lodash when !arr and !cb,
        // which might be some common sense.
        if (!arr) {
            return [];
        }
        if (!cb) {
            return slice(arr);
        }
        if (arr.map && arr.map === nativeMap) {
            return arr.map(cb, context);
        }
        else {
            var result = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                // FIXME: should the elided item be travelled, like `[33,,55]`.
                result.push(cb.call(context, arr[i], i, arr));
            }
            return result;
        }
    }
    /**
     * Get all object keys
     *
     * Will return an empty array if obj is null/undefined
     */
    function keys(obj) {
        if (!obj) {
            return [];
        }
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keyList = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keyList.push(key);
            }
        }
        return keyList;
    }
    function bindPolyfill(func, context) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return function () {
            return func.apply(context, args.concat(nativeSlice.call(arguments)));
        };
    }
    (protoFunction && isFunction(protoFunction.bind))
        ? protoFunction.call.bind(protoFunction.bind)
        : bindPolyfill;
    /* eslint-enable max-len*/
    function isArray(value) {
        if (Array.isArray) {
            return Array.isArray(value);
        }
        return objToString.call(value) === '[object Array]';
    }
    function isFunction(value) {
        return typeof value === 'function';
    }
    function isString(value) {
        // Faster than `objToString.call` several times in chromium and webkit.
        // And `new String()` is rarely used.
        return typeof value === 'string';
    }
    function isNumber(value) {
        // Faster than `objToString.call` several times in chromium and webkit.
        // And `new Number()` is rarely used.
        return typeof value === 'number';
    }
    // Usage: `isObject(xxx)` or `isObject(SomeType)(xxx)`
    // Generic T can be used to avoid "ts type gruards" casting the `value` from its original
    // type `Object` implicitly so that loose its original type info in the subsequent code.
    function isObject(value) {
        // Avoid a V8 JIT bug in Chrome 19-20.
        // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
        var type = typeof value;
        return type === 'function' || (!!value && type === 'object');
    }
    function isBuiltInObject(value) {
        return !!BUILTIN_OBJECT[objToString.call(value)];
    }
    function isTypedArray(value) {
        return !!TYPED_ARRAY[objToString.call(value)];
    }
    function isDom(value) {
        return typeof value === 'object'
            && typeof value.nodeType === 'number'
            && typeof value.ownerDocument === 'object';
    }
    function isGradientObject(value) {
        return value.colorStops != null;
    }
    function isImagePatternObject(value) {
        return value.image != null;
    }
    function slice(arr) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return nativeSlice.apply(arr, args);
    }
    var primitiveKey = '__ec_primitive__';
    function isPrimitive(obj) {
        return obj[primitiveKey];
    }
    function createObject(proto, properties) {
        // Performance of Object.create
        // https://jsperf.com/style-strategy-proto-or-others
        var obj;
        if (Object.create) {
            obj = Object.create(proto);
        }
        else {
            var StyleCtor = function () { };
            StyleCtor.prototype = proto;
            obj = new StyleCtor();
        }
        if (properties) {
            extend(obj, properties);
        }
        return obj;
    }
    function noop() { }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * 创建一个向量
     */
    function create$1(x, y) {
        if (x == null) {
            x = 0;
        }
        if (y == null) {
            y = 0;
        }
        return [x, y];
    }
    /**
     * 计算向量间距离
     */
    function distance(v1, v2) {
        return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0])
            + (v1[1] - v2[1]) * (v1[1] - v2[1]));
    }
    var dist$1 = distance;
    /**
     * 向量距离平方
     */
    function distanceSquare(v1, v2) {
        return (v1[0] - v2[0]) * (v1[0] - v2[0])
            + (v1[1] - v2[1]) * (v1[1] - v2[1]);
    }
    var distSquare = distanceSquare;
    /**
     * 矩阵左乘向量
     */
    function applyTransform(out, v, m) {
        var x = v[0];
        var y = v[1];
        out[0] = m[0] * x + m[2] * y + m[4];
        out[1] = m[1] * x + m[3] * y + m[5];
        return out;
    }
    /**
     * 求两个向量最小值
     */
    function min$1(out, v1, v2) {
        out[0] = Math.min(v1[0], v2[0]);
        out[1] = Math.min(v1[1], v2[1]);
        return out;
    }
    /**
     * 求两个向量最大值
     */
    function max$1(out, v1, v2) {
        out[0] = Math.max(v1[0], v2[0]);
        out[1] = Math.max(v1[1], v2[1]);
        return out;
    }

    var Param = /** @class */ (function () {
        function Param(target, e) {
            this.target = target;
            this.topTarget = e && e.topTarget;
        }
        return Param;
    }());
    // FIXME Draggable on element which has parent rotation or scale
    var Draggable = /** @class */ (function () {
        function Draggable(handler) {
            this.handler = handler;
            handler.on('mousedown', this._dragStart, this);
            handler.on('mousemove', this._drag, this);
            handler.on('mouseup', this._dragEnd, this);
            // `mosuemove` and `mouseup` can be continue to fire when dragging.
            // See [DRAG_OUTSIDE] in `Handler.js`. So we do not need to trigger
            // `_dragEnd` when globalout. That would brings better user experience.
            // this.on('globalout', this._dragEnd, this);
            // this._dropTarget = null;
            // this._draggingTarget = null;
            // this._x = 0;
            // this._y = 0;
        }
        Draggable.prototype._dragStart = function (e) {
            var draggingTarget = e.target;
            // Find if there is draggable in the ancestor
            while (draggingTarget && !draggingTarget.draggable) {
                draggingTarget = draggingTarget.parent;
            }
            if (draggingTarget) {
                this._draggingTarget = draggingTarget;
                draggingTarget.dragging = true;
                this._x = e.offsetX;
                this._y = e.offsetY;
                this.handler.dispatchToElement(new Param(draggingTarget, e), 'dragstart', e.event);
            }
        };
        Draggable.prototype._drag = function (e) {
            var draggingTarget = this._draggingTarget;
            if (draggingTarget) {
                var x = e.offsetX;
                var y = e.offsetY;
                var dx = x - this._x;
                var dy = y - this._y;
                this._x = x;
                this._y = y;
                draggingTarget.drift(dx, dy, e);
                this.handler.dispatchToElement(new Param(draggingTarget, e), 'drag', e.event);
                var dropTarget = this.handler.findHover(x, y, draggingTarget // PENDING
                ).target;
                var lastDropTarget = this._dropTarget;
                this._dropTarget = dropTarget;
                if (draggingTarget !== dropTarget) {
                    if (lastDropTarget && dropTarget !== lastDropTarget) {
                        this.handler.dispatchToElement(new Param(lastDropTarget, e), 'dragleave', e.event);
                    }
                    if (dropTarget && dropTarget !== lastDropTarget) {
                        this.handler.dispatchToElement(new Param(dropTarget, e), 'dragenter', e.event);
                    }
                }
            }
        };
        Draggable.prototype._dragEnd = function (e) {
            var draggingTarget = this._draggingTarget;
            if (draggingTarget) {
                draggingTarget.dragging = false;
            }
            this.handler.dispatchToElement(new Param(draggingTarget, e), 'dragend', e.event);
            if (this._dropTarget) {
                this.handler.dispatchToElement(new Param(this._dropTarget, e), 'drop', e.event);
            }
            this._draggingTarget = null;
            this._dropTarget = null;
        };
        return Draggable;
    }());

    /**
     * Event dispatcher.
     *
     * Event can be defined in EvtDef to enable type check. For example:
     * ```ts
     * interface FooEvents {
     *     // key: event name, value: the first event param in `trigger` and `callback`.
     *     myevent: {
     *        aa: string;
     *        bb: number;
     *     };
     * }
     * class Foo extends Eventful<FooEvents> {
     *     fn() {
     *         // Type check of event name and the first event param is enabled here.
     *         this.trigger('myevent', {aa: 'xx', bb: 3});
     *     }
     * }
     * let foo = new Foo();
     * // Type check of event name and the first event param is enabled here.
     * foo.on('myevent', (eventParam) => { ... });
     * ```
     *
     * @param eventProcessor The object eventProcessor is the scope when
     *        `eventProcessor.xxx` called.
     * @param eventProcessor.normalizeQuery
     *        param: {string|Object} Raw query.
     *        return: {string|Object} Normalized query.
     * @param eventProcessor.filter Event will be dispatched only
     *        if it returns `true`.
     *        param: {string} eventType
     *        param: {string|Object} query
     *        return: {boolean}
     * @param eventProcessor.afterTrigger Called after all handlers called.
     *        param: {string} eventType
     */
    var Eventful = /** @class */ (function () {
        function Eventful(eventProcessors) {
            if (eventProcessors) {
                this._$eventProcessor = eventProcessors;
            }
        }
        /**
         * Bind a handler.
         *
         * @param event The event name.
         * @param Condition used on event filter.
         * @param handler The event handler.
         * @param context
         */
        Eventful.prototype.on = function (event, query, handler, context) {
            if (!this._$handlers) {
                this._$handlers = {};
            }
            var _h = this._$handlers;
            if (typeof query === 'function') {
                context = handler;
                handler = query;
                query = null;
            }
            if (!handler || !event) {
                return this;
            }
            var eventProcessor = this._$eventProcessor;
            if (query != null && eventProcessor && eventProcessor.normalizeQuery) {
                query = eventProcessor.normalizeQuery(query);
            }
            if (!_h[event]) {
                _h[event] = [];
            }
            for (var i = 0; i < _h[event].length; i++) {
                if (_h[event][i].h === handler) {
                    return this;
                }
            }
            var wrap = {
                h: handler,
                query: query,
                ctx: (context || this),
                // FIXME
                // Do not publish this feature util it is proved that it makes sense.
                callAtLast: handler.zrEventfulCallAtLast
            };
            var lastIndex = _h[event].length - 1;
            var lastWrap = _h[event][lastIndex];
            (lastWrap && lastWrap.callAtLast)
                ? _h[event].splice(lastIndex, 0, wrap)
                : _h[event].push(wrap);
            return this;
        };
        /**
         * Whether any handler has bound.
         */
        Eventful.prototype.isSilent = function (eventName) {
            var _h = this._$handlers;
            return !_h || !_h[eventName] || !_h[eventName].length;
        };
        /**
         * Unbind a event.
         *
         * @param eventType The event name.
         *        If no `event` input, "off" all listeners.
         * @param handler The event handler.
         *        If no `handler` input, "off" all listeners of the `event`.
         */
        Eventful.prototype.off = function (eventType, handler) {
            var _h = this._$handlers;
            if (!_h) {
                return this;
            }
            if (!eventType) {
                this._$handlers = {};
                return this;
            }
            if (handler) {
                if (_h[eventType]) {
                    var newList = [];
                    for (var i = 0, l = _h[eventType].length; i < l; i++) {
                        if (_h[eventType][i].h !== handler) {
                            newList.push(_h[eventType][i]);
                        }
                    }
                    _h[eventType] = newList;
                }
                if (_h[eventType] && _h[eventType].length === 0) {
                    delete _h[eventType];
                }
            }
            else {
                delete _h[eventType];
            }
            return this;
        };
        /**
         * Dispatch a event.
         *
         * @param {string} eventType The event name.
         */
        Eventful.prototype.trigger = function (eventType) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this._$handlers) {
                return this;
            }
            var _h = this._$handlers[eventType];
            var eventProcessor = this._$eventProcessor;
            if (_h) {
                var argLen = args.length;
                var len = _h.length;
                for (var i = 0; i < len; i++) {
                    var hItem = _h[i];
                    if (eventProcessor
                        && eventProcessor.filter
                        && hItem.query != null
                        && !eventProcessor.filter(eventType, hItem.query)) {
                        continue;
                    }
                    // Optimize advise from backbone
                    switch (argLen) {
                        case 0:
                            hItem.h.call(hItem.ctx);
                            break;
                        case 1:
                            hItem.h.call(hItem.ctx, args[0]);
                            break;
                        case 2:
                            hItem.h.call(hItem.ctx, args[0], args[1]);
                            break;
                        default:
                            // have more than 2 given arguments
                            hItem.h.apply(hItem.ctx, args);
                            break;
                    }
                }
            }
            eventProcessor && eventProcessor.afterTrigger
                && eventProcessor.afterTrigger(eventType);
            return this;
        };
        /**
         * Dispatch a event with context, which is specified at the last parameter.
         *
         * @param {string} type The event name.
         */
        Eventful.prototype.triggerWithContext = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this._$handlers) {
                return this;
            }
            var _h = this._$handlers[type];
            var eventProcessor = this._$eventProcessor;
            if (_h) {
                var argLen = args.length;
                var ctx = args[argLen - 1];
                var len = _h.length;
                for (var i = 0; i < len; i++) {
                    var hItem = _h[i];
                    if (eventProcessor
                        && eventProcessor.filter
                        && hItem.query != null
                        && !eventProcessor.filter(type, hItem.query)) {
                        continue;
                    }
                    // Optimize advise from backbone
                    switch (argLen) {
                        case 0:
                            hItem.h.call(ctx);
                            break;
                        case 1:
                            hItem.h.call(ctx, args[0]);
                            break;
                        case 2:
                            hItem.h.call(ctx, args[0], args[1]);
                            break;
                        default:
                            // have more than 2 given arguments
                            hItem.h.apply(ctx, args.slice(1, argLen - 1));
                            break;
                    }
                }
            }
            eventProcessor && eventProcessor.afterTrigger
                && eventProcessor.afterTrigger(type);
            return this;
        };
        return Eventful;
    }());

    /**
     * The algoritm is learnt from
     * https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
     * And we made some optimization for matrix inversion.
     * Other similar approaches:
     * "cv::getPerspectiveTransform", "Direct Linear Transformation".
     */
    var LN2 = Math.log(2);
    function determinant(rows, rank, rowStart, rowMask, colMask, detCache) {
        var cacheKey = rowMask + '-' + colMask;
        var fullRank = rows.length;
        if (detCache.hasOwnProperty(cacheKey)) {
            return detCache[cacheKey];
        }
        if (rank === 1) {
            // In this case the colMask must be like: `11101111`. We can find the place of `0`.
            var colStart = Math.round(Math.log(((1 << fullRank) - 1) & ~colMask) / LN2);
            return rows[rowStart][colStart];
        }
        var subRowMask = rowMask | (1 << rowStart);
        var subRowStart = rowStart + 1;
        while (rowMask & (1 << subRowStart)) {
            subRowStart++;
        }
        var sum = 0;
        for (var j = 0, colLocalIdx = 0; j < fullRank; j++) {
            var colTag = 1 << j;
            if (!(colTag & colMask)) {
                sum += (colLocalIdx % 2 ? -1 : 1) * rows[rowStart][j]
                    // det(subMatrix(0, j))
                    * determinant(rows, rank - 1, subRowStart, subRowMask, colMask | colTag, detCache);
                colLocalIdx++;
            }
        }
        detCache[cacheKey] = sum;
        return sum;
    }
    /**
     * Usage:
     * ```js
     * const transformer = buildTransformer(
     *     [10, 44, 100, 44, 100, 300, 10, 300],
     *     [50, 54, 130, 14, 140, 330, 14, 220]
     * );
     * const out = [];
     * transformer && transformer([11, 33], out);
     * ```
     *
     * Notice: `buildTransformer` may take more than 10ms in some Android device.
     *
     * @param src source four points, [x0, y0, x1, y1, x2, y2, x3, y3]
     * @param dest destination four points, [x0, y0, x1, y1, x2, y2, x3, y3]
     * @return transformer If fail, return null/undefined.
     */
    function buildTransformer(src, dest) {
        var mA = [
            [src[0], src[1], 1, 0, 0, 0, -dest[0] * src[0], -dest[0] * src[1]],
            [0, 0, 0, src[0], src[1], 1, -dest[1] * src[0], -dest[1] * src[1]],
            [src[2], src[3], 1, 0, 0, 0, -dest[2] * src[2], -dest[2] * src[3]],
            [0, 0, 0, src[2], src[3], 1, -dest[3] * src[2], -dest[3] * src[3]],
            [src[4], src[5], 1, 0, 0, 0, -dest[4] * src[4], -dest[4] * src[5]],
            [0, 0, 0, src[4], src[5], 1, -dest[5] * src[4], -dest[5] * src[5]],
            [src[6], src[7], 1, 0, 0, 0, -dest[6] * src[6], -dest[6] * src[7]],
            [0, 0, 0, src[6], src[7], 1, -dest[7] * src[6], -dest[7] * src[7]]
        ];
        var detCache = {};
        var det = determinant(mA, 8, 0, 0, 0, detCache);
        if (det === 0) {
            // can not make transformer when and only when
            // any three of the markers are collinear.
            return;
        }
        // `invert(mA) * dest`, that is, `adj(mA) / det * dest`.
        var vh = [];
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                vh[j] == null && (vh[j] = 0);
                vh[j] += ((i + j) % 2 ? -1 : 1)
                    // det(subMatrix(i, j))
                    * determinant(mA, 7, i === 0 ? 1 : 0, 1 << i, 1 << j, detCache)
                    / det * dest[i];
            }
        }
        return function (out, srcPointX, srcPointY) {
            var pk = srcPointX * vh[6] + srcPointY * vh[7] + 1;
            out[0] = (srcPointX * vh[0] + srcPointY * vh[1] + vh[2]) / pk;
            out[1] = (srcPointX * vh[3] + srcPointY * vh[4] + vh[5]) / pk;
        };
    }

    var EVENT_SAVED_PROP = '___zrEVENTSAVED';
    /**
     * Transform between a "viewport coord" and a "local coord".
     * "viewport coord": the coord based on the left-top corner of the viewport
     *     of the browser.
     * "local coord": the coord based on the input `el`. The origin point is at
     *     the position of "left: 0; top: 0;" in the `el`.
     *
     * Support the case when CSS transform is used on el.
     *
     * @param out [inX: number, inY: number] The output. If `inverse: false`,
     *        it represents "local coord", otherwise "vireport coord".
     *        If can not transform, `out` will not be modified but return `false`.
     * @param el The "local coord" is based on the `el`, see comment above.
     * @param inX If `inverse: false`,
     *        it represents "vireport coord", otherwise "local coord".
     * @param inY If `inverse: false`,
     *        it represents "vireport coord", otherwise "local coord".
     * @param inverse
     *        `true`: from "viewport coord" to "local coord".
     *        `false`: from "local coord" to "viewport coord".
     * @return {boolean} Whether transform successfully.
     */
    function transformCoordWithViewport(out, el, inX, inY, inverse) {
        if (el.getBoundingClientRect && env.domSupported && !isCanvasEl(el)) {
            var saved = el[EVENT_SAVED_PROP] || (el[EVENT_SAVED_PROP] = {});
            var markers = prepareCoordMarkers(el, saved);
            var transformer = preparePointerTransformer(markers, saved, inverse);
            if (transformer) {
                transformer(out, inX, inY);
                return true;
            }
        }
        return false;
    }
    function prepareCoordMarkers(el, saved) {
        var markers = saved.markers;
        if (markers) {
            return markers;
        }
        markers = saved.markers = [];
        var propLR = ['left', 'right'];
        var propTB = ['top', 'bottom'];
        for (var i = 0; i < 4; i++) {
            var marker = document.createElement('div');
            var stl = marker.style;
            var idxLR = i % 2;
            var idxTB = (i >> 1) % 2;
            stl.cssText = [
                'position: absolute',
                'visibility: hidden',
                'padding: 0',
                'margin: 0',
                'border-width: 0',
                'user-select: none',
                'width:0',
                'height:0',
                // 'width: 5px',
                // 'height: 5px',
                propLR[idxLR] + ':0',
                propTB[idxTB] + ':0',
                propLR[1 - idxLR] + ':auto',
                propTB[1 - idxTB] + ':auto',
                ''
            ].join('!important;');
            el.appendChild(marker);
            markers.push(marker);
        }
        return markers;
    }
    function preparePointerTransformer(markers, saved, inverse) {
        var transformerName = inverse ? 'invTrans' : 'trans';
        var transformer = saved[transformerName];
        var oldSrcCoords = saved.srcCoords;
        var srcCoords = [];
        var destCoords = [];
        var oldCoordTheSame = true;
        for (var i = 0; i < 4; i++) {
            var rect = markers[i].getBoundingClientRect();
            var ii = 2 * i;
            var x = rect.left;
            var y = rect.top;
            srcCoords.push(x, y);
            oldCoordTheSame = oldCoordTheSame && oldSrcCoords && x === oldSrcCoords[ii] && y === oldSrcCoords[ii + 1];
            destCoords.push(markers[i].offsetLeft, markers[i].offsetTop);
        }
        // Cache to avoid time consuming of `buildTransformer`.
        return (oldCoordTheSame && transformer)
            ? transformer
            : (saved.srcCoords = srcCoords,
                saved[transformerName] = inverse
                    ? buildTransformer(destCoords, srcCoords)
                    : buildTransformer(srcCoords, destCoords));
    }
    function isCanvasEl(el) {
        return el.nodeName.toUpperCase() === 'CANVAS';
    }

    /**
     * Utilities for mouse or touch events.
     */
    var isDomLevel2 = (typeof window !== 'undefined') && !!window.addEventListener;
    var MOUSE_EVENT_REG = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;
    var _calcOut = [];
    /**
     * Get the `zrX` and `zrY`, which are relative to the top-left of
     * the input `el`.
     * CSS transform (2D & 3D) is supported.
     *
     * The strategy to fetch the coords:
     * + If `calculate` is not set as `true`, users of this method should
     * ensure that `el` is the same or the same size & location as `e.target`.
     * Otherwise the result coords are probably not expected. Because we
     * firstly try to get coords from e.offsetX/e.offsetY.
     * + If `calculate` is set as `true`, the input `el` can be any element
     * and we force to calculate the coords based on `el`.
     * + The input `el` should be positionable (not position:static).
     *
     * The force `calculate` can be used in case like:
     * When mousemove event triggered on ec tooltip, `e.target` is not `el`(zr painter.dom).
     *
     * @param  el DOM element.
     * @param  e Mouse event or touch event.
     * @param  out Get `out.zrX` and `out.zrY` as the result.
     * @param  calculate Whether to force calculate
     *        the coordinates but not use ones provided by browser.
     */
    function clientToLocal(el, e, out, calculate) {
        out = out || {};
        // According to the W3C Working Draft, offsetX and offsetY should be relative
        // to the padding edge of the target element. The only browser using this convention
        // is IE. Webkit uses the border edge, Opera uses the content edge, and FireFox does
        // not support the properties.
        // (see http://www.jacklmoore.com/notes/mouse-position/)
        // In zr painter.dom, padding edge equals to border edge.
        if (calculate || !env.canvasSupported) {
            calculateZrXY(el, e, out);
        }
        // Caution: In FireFox, layerX/layerY Mouse position relative to the closest positioned
        // ancestor element, so we should make sure el is positioned (e.g., not position:static).
        // BTW1, Webkit don't return the same results as FF in non-simple cases (like add
        // zoom-factor, overflow / opacity layers, transforms ...)
        // BTW2, (ev.offsetY || ev.pageY - $(ev.target).offset().top) is not correct in preserve-3d.
        // <https://bugs.jquery.com/ticket/8523#comment:14>
        // BTW3, In ff, offsetX/offsetY is always 0.
        else if (env.browser.firefox
            // use offsetX/offsetY for Firefox >= 39
            // PENDING: consider Firefox for Android and Firefox OS? >= 43
            && env.browser.version < '39'
            && e.layerX != null
            && e.layerX !== e.offsetX) {
            out.zrX = e.layerX;
            out.zrY = e.layerY;
        }
        // For IE6+, chrome, safari, opera, firefox >= 39
        else if (e.offsetX != null) {
            out.zrX = e.offsetX;
            out.zrY = e.offsetY;
        }
        // For some other device, e.g., IOS safari.
        else {
            calculateZrXY(el, e, out);
        }
        return out;
    }
    function calculateZrXY(el, e, out) {
        // BlackBerry 5, iOS 3 (original iPhone) don't have getBoundingRect.
        if (env.domSupported && el.getBoundingClientRect) {
            var ex = e.clientX;
            var ey = e.clientY;
            if (isCanvasEl(el)) {
                // Original approach, which do not support CSS transform.
                // marker can not be locationed in a canvas container
                // (getBoundingClientRect is always 0). We do not support
                // that input a pre-created canvas to zr while using css
                // transform in iOS.
                var box = el.getBoundingClientRect();
                out.zrX = ex - box.left;
                out.zrY = ey - box.top;
                return;
            }
            else {
                if (transformCoordWithViewport(_calcOut, el, ex, ey)) {
                    out.zrX = _calcOut[0];
                    out.zrY = _calcOut[1];
                    return;
                }
            }
        }
        out.zrX = out.zrY = 0;
    }
    /**
     * Find native event compat for legency IE.
     * Should be called at the begining of a native event listener.
     *
     * @param e Mouse event or touch event or pointer event.
     *        For lagency IE, we use `window.event` is used.
     * @return The native event.
     */
    function getNativeEvent(e) {
        return e
            || window.event; // For IE
    }
    /**
     * Normalize the coordinates of the input event.
     *
     * Get the `e.zrX` and `e.zrY`, which are relative to the top-left of
     * the input `el`.
     * Get `e.zrDelta` if using mouse wheel.
     * Get `e.which`, see the comment inside this function.
     *
     * Do not calculate repeatly if `zrX` and `zrY` already exist.
     *
     * Notice: see comments in `clientToLocal`. check the relationship
     * between the result coords and the parameters `el` and `calculate`.
     *
     * @param el DOM element.
     * @param e See `getNativeEvent`.
     * @param calculate Whether to force calculate
     *        the coordinates but not use ones provided by browser.
     * @return The normalized native UIEvent.
     */
    function normalizeEvent(el, e, calculate) {
        e = getNativeEvent(e);
        if (e.zrX != null) {
            return e;
        }
        var eventType = e.type;
        var isTouch = eventType && eventType.indexOf('touch') >= 0;
        if (!isTouch) {
            clientToLocal(el, e, e, calculate);
            var wheelDelta = getWheelDeltaMayPolyfill(e);
            // FIXME: IE8- has "wheelDeta" in event "mousewheel" but hat different value (120 times)
            // with Chrome and Safari. It's not correct for zrender event but we left it as it was.
            e.zrDelta = wheelDelta ? wheelDelta / 120 : -(e.detail || 0) / 3;
        }
        else {
            var touch = eventType !== 'touchend'
                ? e.targetTouches[0]
                : e.changedTouches[0];
            touch && clientToLocal(el, touch, e, calculate);
        }
        // Add which for click: 1 === left; 2 === middle; 3 === right; otherwise: 0;
        // See jQuery: https://github.com/jquery/jquery/blob/master/src/event.js
        // If e.which has been defined, it may be readonly,
        // see: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/which
        var button = e.button;
        if (e.which == null && button !== undefined && MOUSE_EVENT_REG.test(e.type)) {
            e.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
        }
        // [Caution]: `e.which` from browser is not always reliable. For example,
        // when press left button and `mousemove (pointermove)` in Edge, the `e.which`
        // is 65536 and the `e.button` is -1. But the `mouseup (pointerup)` and
        // `mousedown (pointerdown)` is the same as Chrome does.
        return e;
    }
    // TODO: also provide prop "deltaX" "deltaY" in zrender "mousewheel" event.
    function getWheelDeltaMayPolyfill(e) {
        // Although event "wheel" do not has the prop "wheelDelta" in spec,
        // agent like Chrome and Safari still provide "wheelDelta" like
        // event "mousewheel" did (perhaps for backward compat).
        // Since zrender has been using "wheelDeta" in zrender event "mousewheel".
        // we currently do not break it.
        // But event "wheel" in firefox do not has "wheelDelta", so we calculate
        // "wheelDeta" from "deltaX", "deltaY" (which is the props in spec).
        var rawWheelDelta = e.wheelDelta;
        // Theroetically `e.wheelDelta` won't be 0 unless some day it has been deprecated
        // by agent like Chrome or Safari. So we also calculate it if rawWheelDelta is 0.
        if (rawWheelDelta) {
            return rawWheelDelta;
        }
        var deltaX = e.deltaX;
        var deltaY = e.deltaY;
        if (deltaX == null || deltaY == null) {
            return rawWheelDelta;
        }
        // Test in Chrome and Safari (MacOS):
        // The sign is corrent.
        // The abs value is 99% corrent (inconsist case only like 62~63, 125~126 ...)
        var delta = deltaY !== 0 ? Math.abs(deltaY) : Math.abs(deltaX);
        var sign = deltaY > 0 ? -1
            : deltaY < 0 ? 1
                : deltaX > 0 ? -1
                    : 1;
        return 3 * delta * sign;
    }
    /**
     * @param  el
     * @param  name
     * @param  handler
     * @param  opt If boolean, means `opt.capture`
     * @param  opt.capture
     * @param  opt.passive
     */
    function addEventListener(el, name, handler, opt) {
        if (isDomLevel2) {
            // Reproduct the console warning:
            // [Violation] Added non-passive event listener to a scroll-blocking <some> event.
            // Consider marking event handler as 'passive' to make the page more responsive.
            // Just set console log level: verbose in chrome dev tool.
            // then the warning log will be printed when addEventListener called.
            // See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
            // We have not yet found a neat way to using passive. Because in zrender the dom event
            // listener delegate all of the upper events of element. Some of those events need
            // to prevent default. For example, the feature `preventDefaultMouseMove` of echarts.
            // Before passive can be adopted, these issues should be considered:
            // (1) Whether and how a zrender user specifies an event listener passive. And by default,
            // passive or not.
            // (2) How to tread that some zrender event listener is passive, and some is not. If
            // we use other way but not preventDefault of mousewheel and touchmove, browser
            // compatibility should be handled.
            // const opts = (env.passiveSupported && name === 'mousewheel')
            //     ? {passive: true}
            //     // By default, the third param of el.addEventListener is `capture: false`.
            //     : void 0;
            // el.addEventListener(name, handler /* , opts */);
            el.addEventListener(name, handler, opt);
        }
        else {
            // For simplicity, do not implement `setCapture` for IE9-.
            el.attachEvent('on' + name, handler);
        }
    }
    /**
     * Parameter are the same as `addEventListener`.
     *
     * Notice that if a listener is registered twice, one with capture and one without,
     * remove each one separately. Removal of a capturing listener does not affect a
     * non-capturing version of the same listener, and vice versa.
     */
    function removeEventListener(el, name, handler, opt) {
        if (isDomLevel2) {
            el.removeEventListener(name, handler, opt);
        }
        else {
            el.detachEvent('on' + name, handler);
        }
    }
    /**
     * preventDefault and stopPropagation.
     * Notice: do not use this method in zrender. It can only be
     * used by upper applications if necessary.
     *
     * @param {Event} e A mouse or touch event.
     */
    var stop = isDomLevel2
        ? function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
        }
        : function (e) {
            e.returnValue = false;
            e.cancelBubble = true;
        };

    /**
     * Only implements needed gestures for mobile.
     */
    var GestureMgr = /** @class */ (function () {
        function GestureMgr() {
            this._track = [];
        }
        GestureMgr.prototype.recognize = function (event, target, root) {
            this._doTrack(event, target, root);
            return this._recognize(event);
        };
        GestureMgr.prototype.clear = function () {
            this._track.length = 0;
            return this;
        };
        GestureMgr.prototype._doTrack = function (event, target, root) {
            var touches = event.touches;
            if (!touches) {
                return;
            }
            var trackItem = {
                points: [],
                touches: [],
                target: target,
                event: event
            };
            for (var i = 0, len = touches.length; i < len; i++) {
                var touch = touches[i];
                var pos = clientToLocal(root, touch, {});
                trackItem.points.push([pos.zrX, pos.zrY]);
                trackItem.touches.push(touch);
            }
            this._track.push(trackItem);
        };
        GestureMgr.prototype._recognize = function (event) {
            for (var eventName in recognizers) {
                if (recognizers.hasOwnProperty(eventName)) {
                    var gestureInfo = recognizers[eventName](this._track, event);
                    if (gestureInfo) {
                        return gestureInfo;
                    }
                }
            }
        };
        return GestureMgr;
    }());
    function dist(pointPair) {
        var dx = pointPair[1][0] - pointPair[0][0];
        var dy = pointPair[1][1] - pointPair[0][1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    function center(pointPair) {
        return [
            (pointPair[0][0] + pointPair[1][0]) / 2,
            (pointPair[0][1] + pointPair[1][1]) / 2
        ];
    }
    var recognizers = {
        pinch: function (tracks, event) {
            var trackLen = tracks.length;
            if (!trackLen) {
                return;
            }
            var pinchEnd = (tracks[trackLen - 1] || {}).points;
            var pinchPre = (tracks[trackLen - 2] || {}).points || pinchEnd;
            if (pinchPre
                && pinchPre.length > 1
                && pinchEnd
                && pinchEnd.length > 1) {
                var pinchScale = dist(pinchEnd) / dist(pinchPre);
                !isFinite(pinchScale) && (pinchScale = 1);
                event.pinchScale = pinchScale;
                var pinchCenter = center(pinchEnd);
                event.pinchX = pinchCenter[0];
                event.pinchY = pinchCenter[1];
                return {
                    type: 'pinch',
                    target: tracks[0].target,
                    event: event
                };
            }
        }
        // Only pinch currently.
    };

    /**
     * [The interface between `Handler` and `HandlerProxy`]:
     *
     * The default `HandlerProxy` only support the common standard web environment
     * (e.g., standalone browser, headless browser, embed browser in mobild APP, ...).
     * But `HandlerProxy` can be replaced to support more non-standard environment
     * (e.g., mini app), or to support more feature that the default `HandlerProxy`
     * not provided (like echarts-gl did).
     * So the interface between `Handler` and `HandlerProxy` should be stable. Do not
     * make break changes util inevitable. The interface include the public methods
     * of `Handler` and the events listed in `handlerNames` below, by which `HandlerProxy`
     * drives `Handler`.
     */
    /**
     * [DRAG_OUTSIDE]:
     *
     * That is, triggering `mousemove` and `mouseup` event when the pointer is out of the
     * zrender area when dragging. That is important for the improvement of the user experience
     * when dragging something near the boundary without being terminated unexpectedly.
     *
     * We originally consider to introduce new events like `pagemovemove` and `pagemouseup`
     * to resolve this issue. But some drawbacks of it is described in
     * https://github.com/ecomfe/zrender/pull/536#issuecomment-560286899
     *
     * Instead, we referenced the specifications:
     * https://www.w3.org/TR/touch-events/#the-touchmove-event
     * https://www.w3.org/TR/2014/WD-DOM-Level-3-Events-20140925/#event-type-mousemove
     * where the the mousemove/touchmove can be continue to fire if the user began a drag
     * operation and the pointer has left the boundary. (for the mouse event, browsers
     * only do it on `document` and when the pointer has left the boundary of the browser.)
     *
     * So the default `HandlerProxy` supports this feature similarly: if it is in the dragging
     * state (see `pointerCapture` in `HandlerProxy`), the `mousemove` and `mouseup` continue
     * to fire until release the pointer. That is implemented by listen to those event on
     * `document`.
     * If we implement some other `HandlerProxy` only for touch device, that would be easier.
     * The touch event support this feature by default.
     * The term "pointer capture" is from the spec:
     * https://www.w3.org/TR/pointerevents2/#idl-def-element-setpointercapture-pointerid
     *
     * Note:
     * There might be some cases that the mouse event can not be received on `document`.
     * For example,
     * (A) When `useCapture` is not supported and some user defined event listeners on the ancestor
     * of zr dom throw Error.
     * (B) When `useCapture` is not supported and some user defined event listeners on the ancestor of
     * zr dom call `stopPropagation`.
     * In these cases, the `mousemove` event might be keep triggering event when the mouse is released.
     * We try to reduce the side-effect in those cases, that is, use `isOutsideBoundary` to prevent
     * it from do anything (especially, `findHover`).
     * (`useCapture` mean, `addEvnetListener(listener, {capture: true})`, althought it may not be
     * suppported in some environments.)
     *
     * Note:
     * If `HandlerProxy` listens to `document` with `useCapture`, `HandlerProxy` needs to
     * prevent user-registered-handler from calling `stopPropagation` and `preventDefault`
     * when the `event.target` is not a zrender dom element. Otherwise the user-registered-handler
     * may be able to prevent other elements (that not relevant to zrender) in the web page from receiving
     * dom events.
     */
    var SILENT = 'silent';
    function makeEventPacket(eveType, targetInfo, event) {
        return {
            type: eveType,
            event: event,
            // target can only be an element that is not silent.
            target: targetInfo.target,
            // topTarget can be a silent element.
            topTarget: targetInfo.topTarget,
            cancelBubble: false,
            offsetX: event.zrX,
            offsetY: event.zrY,
            gestureEvent: event.gestureEvent,
            pinchX: event.pinchX,
            pinchY: event.pinchY,
            pinchScale: event.pinchScale,
            wheelDelta: event.zrDelta,
            zrByTouch: event.zrByTouch,
            which: event.which,
            stop: stopEvent
        };
    }
    function stopEvent() {
        stop(this.event);
    }
    var EmptyProxy = /** @class */ (function (_super) {
        __extends(EmptyProxy, _super);
        function EmptyProxy() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.handler = null;
            return _this;
        }
        EmptyProxy.prototype.dispose = function () { };
        EmptyProxy.prototype.setCursor = function () { };
        return EmptyProxy;
    }(Eventful));
    var HoveredResult = /** @class */ (function () {
        function HoveredResult(x, y) {
            this.x = x;
            this.y = y;
        }
        return HoveredResult;
    }());
    var handlerNames = [
        'click', 'dblclick', 'mousewheel', 'mouseout',
        'mouseup', 'mousedown', 'mousemove', 'contextmenu'
    ];
    // TODO draggable
    var Handler = /** @class */ (function (_super) {
        __extends(Handler, _super);
        function Handler(storage, painter, proxy, painterRoot) {
            var _this = _super.call(this) || this;
            _this._hovered = new HoveredResult(0, 0);
            _this.storage = storage;
            _this.painter = painter;
            _this.painterRoot = painterRoot;
            proxy = proxy || new EmptyProxy();
            /**
             * Proxy of event. can be Dom, WebGLSurface, etc.
             */
            _this.proxy = null;
            _this.setHandlerProxy(proxy);
            _this._draggingMgr = new Draggable(_this);
            return _this;
        }
        Handler.prototype.setHandlerProxy = function (proxy) {
            if (this.proxy) {
                this.proxy.dispose();
            }
            if (proxy) {
                each(handlerNames, function (name) {
                    proxy.on && proxy.on(name, this[name], this);
                }, this);
                // Attach handler
                proxy.handler = this;
            }
            this.proxy = proxy;
        };
        Handler.prototype.mousemove = function (event) {
            var x = event.zrX;
            var y = event.zrY;
            var isOutside = isOutsideBoundary(this, x, y);
            var lastHovered = this._hovered;
            var lastHoveredTarget = lastHovered.target;
            // If lastHoveredTarget is removed from zr (detected by '__zr') by some API call
            // (like 'setOption' or 'dispatchAction') in event handlers, we should find
            // lastHovered again here. Otherwise 'mouseout' can not be triggered normally.
            // See #6198.
            if (lastHoveredTarget && !lastHoveredTarget.__zr) {
                lastHovered = this.findHover(lastHovered.x, lastHovered.y);
                lastHoveredTarget = lastHovered.target;
            }
            var hovered = this._hovered = isOutside ? new HoveredResult(x, y) : this.findHover(x, y);
            var hoveredTarget = hovered.target;
            var proxy = this.proxy;
            proxy.setCursor && proxy.setCursor(hoveredTarget ? hoveredTarget.cursor : 'default');
            // Mouse out on previous hovered element
            if (lastHoveredTarget && hoveredTarget !== lastHoveredTarget) {
                this.dispatchToElement(lastHovered, 'mouseout', event);
            }
            // Mouse moving on one element
            this.dispatchToElement(hovered, 'mousemove', event);
            // Mouse over on a new element
            if (hoveredTarget && hoveredTarget !== lastHoveredTarget) {
                this.dispatchToElement(hovered, 'mouseover', event);
            }
        };
        Handler.prototype.mouseout = function (event) {
            var eventControl = event.zrEventControl;
            if (eventControl !== 'only_globalout') {
                this.dispatchToElement(this._hovered, 'mouseout', event);
            }
            if (eventControl !== 'no_globalout') {
                // FIXME: if the pointer moving from the extra doms to realy "outside",
                // the `globalout` should have been triggered. But currently not.
                this.trigger('globalout', { type: 'globalout', event: event });
            }
        };
        /**
         * Resize
         */
        Handler.prototype.resize = function () {
            this._hovered = new HoveredResult(0, 0);
        };
        /**
         * Dispatch event
         */
        Handler.prototype.dispatch = function (eventName, eventArgs) {
            var handler = this[eventName];
            handler && handler.call(this, eventArgs);
        };
        /**
         * Dispose
         */
        Handler.prototype.dispose = function () {
            this.proxy.dispose();
            this.storage = null;
            this.proxy = null;
            this.painter = null;
        };
        /**
         * 设置默认的cursor style
         * @param cursorStyle 例如 crosshair，默认为 'default'
         */
        Handler.prototype.setCursorStyle = function (cursorStyle) {
            var proxy = this.proxy;
            proxy.setCursor && proxy.setCursor(cursorStyle);
        };
        /**
         * 事件分发代理
         *
         * @private
         * @param {Object} targetInfo {target, topTarget} 目标图形元素
         * @param {string} eventName 事件名称
         * @param {Object} event 事件对象
         */
        Handler.prototype.dispatchToElement = function (targetInfo, eventName, event) {
            targetInfo = targetInfo || {};
            var el = targetInfo.target;
            if (el && el.silent) {
                return;
            }
            var eventKey = ('on' + eventName);
            var eventPacket = makeEventPacket(eventName, targetInfo, event);
            while (el) {
                el[eventKey]
                    && (eventPacket.cancelBubble = !!el[eventKey].call(el, eventPacket));
                el.trigger(eventName, eventPacket);
                // Bubble to the host if on the textContent.
                // PENDING
                el = el.__hostTarget ? el.__hostTarget : el.parent;
                if (eventPacket.cancelBubble) {
                    break;
                }
            }
            if (!eventPacket.cancelBubble) {
                // 冒泡到顶级 zrender 对象
                this.trigger(eventName, eventPacket);
                // 分发事件到用户自定义层
                // 用户有可能在全局 click 事件中 dispose，所以需要判断下 painter 是否存在
                if (this.painter && this.painter.eachOtherLayer) {
                    this.painter.eachOtherLayer(function (layer) {
                        if (typeof (layer[eventKey]) === 'function') {
                            layer[eventKey].call(layer, eventPacket);
                        }
                        if (layer.trigger) {
                            layer.trigger(eventName, eventPacket);
                        }
                    });
                }
            }
        };
        Handler.prototype.findHover = function (x, y, exclude) {
            var list = this.storage.getDisplayList();
            var out = new HoveredResult(x, y);
            for (var i = list.length - 1; i >= 0; i--) {
                var hoverCheckResult = void 0;
                if (list[i] !== exclude
                    // getDisplayList may include ignored item in VML mode
                    && !list[i].ignore
                    && (hoverCheckResult = isHover(list[i], x, y))) {
                    !out.topTarget && (out.topTarget = list[i]);
                    if (hoverCheckResult !== SILENT) {
                        out.target = list[i];
                        break;
                    }
                }
            }
            return out;
        };
        Handler.prototype.processGesture = function (event, stage) {
            if (!this._gestureMgr) {
                this._gestureMgr = new GestureMgr();
            }
            var gestureMgr = this._gestureMgr;
            stage === 'start' && gestureMgr.clear();
            var gestureInfo = gestureMgr.recognize(event, this.findHover(event.zrX, event.zrY, null).target, this.proxy.dom);
            stage === 'end' && gestureMgr.clear();
            // Do not do any preventDefault here. Upper application do that if necessary.
            if (gestureInfo) {
                var type = gestureInfo.type;
                event.gestureEvent = type;
                var res = new HoveredResult();
                res.target = gestureInfo.target;
                this.dispatchToElement(res, type, gestureInfo.event);
            }
        };
        return Handler;
    }(Eventful));
    // Common handlers
    each(['click', 'mousedown', 'mouseup', 'mousewheel', 'dblclick', 'contextmenu'], function (name) {
        Handler.prototype[name] = function (event) {
            var x = event.zrX;
            var y = event.zrY;
            var isOutside = isOutsideBoundary(this, x, y);
            var hovered;
            var hoveredTarget;
            if (name !== 'mouseup' || !isOutside) {
                // Find hover again to avoid click event is dispatched manually. Or click is triggered without mouseover
                hovered = this.findHover(x, y);
                hoveredTarget = hovered.target;
            }
            if (name === 'mousedown') {
                this._downEl = hoveredTarget;
                this._downPoint = [event.zrX, event.zrY];
                // In case click triggered before mouseup
                this._upEl = hoveredTarget;
            }
            else if (name === 'mouseup') {
                this._upEl = hoveredTarget;
            }
            else if (name === 'click') {
                if (this._downEl !== this._upEl
                    // Original click event is triggered on the whole canvas element,
                    // including the case that `mousedown` - `mousemove` - `mouseup`,
                    // which should be filtered, otherwise it will bring trouble to
                    // pan and zoom.
                    || !this._downPoint
                    // Arbitrary value
                    || dist$1(this._downPoint, [event.zrX, event.zrY]) > 4) {
                    return;
                }
                this._downPoint = null;
            }
            this.dispatchToElement(hovered, name, event);
        };
    });
    function isHover(displayable, x, y) {
        if (displayable[displayable.rectHover ? 'rectContain' : 'contain'](x, y)) {
            var el = displayable;
            var isSilent = void 0;
            var ignoreClip = false;
            while (el) {
                // Ignore clip on any ancestors.
                if (el.ignoreClip) {
                    ignoreClip = true;
                }
                if (!ignoreClip) {
                    var clipPath = el.getClipPath();
                    // If clipped by ancestor.
                    // FIXME: If clipPath has neither stroke nor fill,
                    // el.clipPath.contain(x, y) will always return false.
                    if (clipPath && !clipPath.contain(x, y)) {
                        return false;
                    }
                    if (el.silent) {
                        isSilent = true;
                    }
                }
                // Consider when el is textContent, also need to be silent
                // if any of its host el and its ancestors is silent.
                var hostEl = el.__hostTarget;
                el = hostEl ? hostEl : el.parent;
            }
            return isSilent ? SILENT : true;
        }
        return false;
    }
    /**
     * See [DRAG_OUTSIDE].
     */
    function isOutsideBoundary(handlerInstance, x, y) {
        var painter = handlerInstance.painter;
        return x < 0 || x > painter.getWidth() || y < 0 || y > painter.getHeight();
    }

    // https://github.com/mziccard/node-timsort
    var DEFAULT_MIN_MERGE = 32;
    var DEFAULT_MIN_GALLOPING = 7;
    function minRunLength(n) {
        var r = 0;
        while (n >= DEFAULT_MIN_MERGE) {
            r |= n & 1;
            n >>= 1;
        }
        return n + r;
    }
    function makeAscendingRun(array, lo, hi, compare) {
        var runHi = lo + 1;
        if (runHi === hi) {
            return 1;
        }
        if (compare(array[runHi++], array[lo]) < 0) {
            while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
                runHi++;
            }
            reverseRun(array, lo, runHi);
        }
        else {
            while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
                runHi++;
            }
        }
        return runHi - lo;
    }
    function reverseRun(array, lo, hi) {
        hi--;
        while (lo < hi) {
            var t = array[lo];
            array[lo++] = array[hi];
            array[hi--] = t;
        }
    }
    function binaryInsertionSort(array, lo, hi, start, compare) {
        if (start === lo) {
            start++;
        }
        for (; start < hi; start++) {
            var pivot = array[start];
            var left = lo;
            var right = start;
            var mid;
            while (left < right) {
                mid = left + right >>> 1;
                if (compare(pivot, array[mid]) < 0) {
                    right = mid;
                }
                else {
                    left = mid + 1;
                }
            }
            var n = start - left;
            switch (n) {
                case 3:
                    array[left + 3] = array[left + 2];
                case 2:
                    array[left + 2] = array[left + 1];
                case 1:
                    array[left + 1] = array[left];
                    break;
                default:
                    while (n > 0) {
                        array[left + n] = array[left + n - 1];
                        n--;
                    }
            }
            array[left] = pivot;
        }
    }
    function gallopLeft(value, array, start, length, hint, compare) {
        var lastOffset = 0;
        var maxOffset = 0;
        var offset = 1;
        if (compare(value, array[start + hint]) > 0) {
            maxOffset = length - hint;
            while (offset < maxOffset && compare(value, array[start + hint + offset]) > 0) {
                lastOffset = offset;
                offset = (offset << 1) + 1;
                if (offset <= 0) {
                    offset = maxOffset;
                }
            }
            if (offset > maxOffset) {
                offset = maxOffset;
            }
            lastOffset += hint;
            offset += hint;
        }
        else {
            maxOffset = hint + 1;
            while (offset < maxOffset && compare(value, array[start + hint - offset]) <= 0) {
                lastOffset = offset;
                offset = (offset << 1) + 1;
                if (offset <= 0) {
                    offset = maxOffset;
                }
            }
            if (offset > maxOffset) {
                offset = maxOffset;
            }
            var tmp = lastOffset;
            lastOffset = hint - offset;
            offset = hint - tmp;
        }
        lastOffset++;
        while (lastOffset < offset) {
            var m = lastOffset + (offset - lastOffset >>> 1);
            if (compare(value, array[start + m]) > 0) {
                lastOffset = m + 1;
            }
            else {
                offset = m;
            }
        }
        return offset;
    }
    function gallopRight(value, array, start, length, hint, compare) {
        var lastOffset = 0;
        var maxOffset = 0;
        var offset = 1;
        if (compare(value, array[start + hint]) < 0) {
            maxOffset = hint + 1;
            while (offset < maxOffset && compare(value, array[start + hint - offset]) < 0) {
                lastOffset = offset;
                offset = (offset << 1) + 1;
                if (offset <= 0) {
                    offset = maxOffset;
                }
            }
            if (offset > maxOffset) {
                offset = maxOffset;
            }
            var tmp = lastOffset;
            lastOffset = hint - offset;
            offset = hint - tmp;
        }
        else {
            maxOffset = length - hint;
            while (offset < maxOffset && compare(value, array[start + hint + offset]) >= 0) {
                lastOffset = offset;
                offset = (offset << 1) + 1;
                if (offset <= 0) {
                    offset = maxOffset;
                }
            }
            if (offset > maxOffset) {
                offset = maxOffset;
            }
            lastOffset += hint;
            offset += hint;
        }
        lastOffset++;
        while (lastOffset < offset) {
            var m = lastOffset + (offset - lastOffset >>> 1);
            if (compare(value, array[start + m]) < 0) {
                offset = m;
            }
            else {
                lastOffset = m + 1;
            }
        }
        return offset;
    }
    function TimSort(array, compare) {
        var minGallop = DEFAULT_MIN_GALLOPING;
        var runStart;
        var runLength;
        var stackSize = 0;
        var tmp = [];
        runStart = [];
        runLength = [];
        function pushRun(_runStart, _runLength) {
            runStart[stackSize] = _runStart;
            runLength[stackSize] = _runLength;
            stackSize += 1;
        }
        function mergeRuns() {
            while (stackSize > 1) {
                var n = stackSize - 2;
                if ((n >= 1 && runLength[n - 1] <= runLength[n] + runLength[n + 1])
                    || (n >= 2 && runLength[n - 2] <= runLength[n] + runLength[n - 1])) {
                    if (runLength[n - 1] < runLength[n + 1]) {
                        n--;
                    }
                }
                else if (runLength[n] > runLength[n + 1]) {
                    break;
                }
                mergeAt(n);
            }
        }
        function forceMergeRuns() {
            while (stackSize > 1) {
                var n = stackSize - 2;
                if (n > 0 && runLength[n - 1] < runLength[n + 1]) {
                    n--;
                }
                mergeAt(n);
            }
        }
        function mergeAt(i) {
            var start1 = runStart[i];
            var length1 = runLength[i];
            var start2 = runStart[i + 1];
            var length2 = runLength[i + 1];
            runLength[i] = length1 + length2;
            if (i === stackSize - 3) {
                runStart[i + 1] = runStart[i + 2];
                runLength[i + 1] = runLength[i + 2];
            }
            stackSize--;
            var k = gallopRight(array[start2], array, start1, length1, 0, compare);
            start1 += k;
            length1 -= k;
            if (length1 === 0) {
                return;
            }
            length2 = gallopLeft(array[start1 + length1 - 1], array, start2, length2, length2 - 1, compare);
            if (length2 === 0) {
                return;
            }
            if (length1 <= length2) {
                mergeLow(start1, length1, start2, length2);
            }
            else {
                mergeHigh(start1, length1, start2, length2);
            }
        }
        function mergeLow(start1, length1, start2, length2) {
            var i = 0;
            for (i = 0; i < length1; i++) {
                tmp[i] = array[start1 + i];
            }
            var cursor1 = 0;
            var cursor2 = start2;
            var dest = start1;
            array[dest++] = array[cursor2++];
            if (--length2 === 0) {
                for (i = 0; i < length1; i++) {
                    array[dest + i] = tmp[cursor1 + i];
                }
                return;
            }
            if (length1 === 1) {
                for (i = 0; i < length2; i++) {
                    array[dest + i] = array[cursor2 + i];
                }
                array[dest + length2] = tmp[cursor1];
                return;
            }
            var _minGallop = minGallop;
            var count1;
            var count2;
            var exit;
            while (1) {
                count1 = 0;
                count2 = 0;
                exit = false;
                do {
                    if (compare(array[cursor2], tmp[cursor1]) < 0) {
                        array[dest++] = array[cursor2++];
                        count2++;
                        count1 = 0;
                        if (--length2 === 0) {
                            exit = true;
                            break;
                        }
                    }
                    else {
                        array[dest++] = tmp[cursor1++];
                        count1++;
                        count2 = 0;
                        if (--length1 === 1) {
                            exit = true;
                            break;
                        }
                    }
                } while ((count1 | count2) < _minGallop);
                if (exit) {
                    break;
                }
                do {
                    count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare);
                    if (count1 !== 0) {
                        for (i = 0; i < count1; i++) {
                            array[dest + i] = tmp[cursor1 + i];
                        }
                        dest += count1;
                        cursor1 += count1;
                        length1 -= count1;
                        if (length1 <= 1) {
                            exit = true;
                            break;
                        }
                    }
                    array[dest++] = array[cursor2++];
                    if (--length2 === 0) {
                        exit = true;
                        break;
                    }
                    count2 = gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare);
                    if (count2 !== 0) {
                        for (i = 0; i < count2; i++) {
                            array[dest + i] = array[cursor2 + i];
                        }
                        dest += count2;
                        cursor2 += count2;
                        length2 -= count2;
                        if (length2 === 0) {
                            exit = true;
                            break;
                        }
                    }
                    array[dest++] = tmp[cursor1++];
                    if (--length1 === 1) {
                        exit = true;
                        break;
                    }
                    _minGallop--;
                } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
                if (exit) {
                    break;
                }
                if (_minGallop < 0) {
                    _minGallop = 0;
                }
                _minGallop += 2;
            }
            minGallop = _minGallop;
            minGallop < 1 && (minGallop = 1);
            if (length1 === 1) {
                for (i = 0; i < length2; i++) {
                    array[dest + i] = array[cursor2 + i];
                }
                array[dest + length2] = tmp[cursor1];
            }
            else if (length1 === 0) {
                throw new Error();
                // throw new Error('mergeLow preconditions were not respected');
            }
            else {
                for (i = 0; i < length1; i++) {
                    array[dest + i] = tmp[cursor1 + i];
                }
            }
        }
        function mergeHigh(start1, length1, start2, length2) {
            var i = 0;
            for (i = 0; i < length2; i++) {
                tmp[i] = array[start2 + i];
            }
            var cursor1 = start1 + length1 - 1;
            var cursor2 = length2 - 1;
            var dest = start2 + length2 - 1;
            var customCursor = 0;
            var customDest = 0;
            array[dest--] = array[cursor1--];
            if (--length1 === 0) {
                customCursor = dest - (length2 - 1);
                for (i = 0; i < length2; i++) {
                    array[customCursor + i] = tmp[i];
                }
                return;
            }
            if (length2 === 1) {
                dest -= length1;
                cursor1 -= length1;
                customDest = dest + 1;
                customCursor = cursor1 + 1;
                for (i = length1 - 1; i >= 0; i--) {
                    array[customDest + i] = array[customCursor + i];
                }
                array[dest] = tmp[cursor2];
                return;
            }
            var _minGallop = minGallop;
            while (true) {
                var count1 = 0;
                var count2 = 0;
                var exit = false;
                do {
                    if (compare(tmp[cursor2], array[cursor1]) < 0) {
                        array[dest--] = array[cursor1--];
                        count1++;
                        count2 = 0;
                        if (--length1 === 0) {
                            exit = true;
                            break;
                        }
                    }
                    else {
                        array[dest--] = tmp[cursor2--];
                        count2++;
                        count1 = 0;
                        if (--length2 === 1) {
                            exit = true;
                            break;
                        }
                    }
                } while ((count1 | count2) < _minGallop);
                if (exit) {
                    break;
                }
                do {
                    count1 = length1 - gallopRight(tmp[cursor2], array, start1, length1, length1 - 1, compare);
                    if (count1 !== 0) {
                        dest -= count1;
                        cursor1 -= count1;
                        length1 -= count1;
                        customDest = dest + 1;
                        customCursor = cursor1 + 1;
                        for (i = count1 - 1; i >= 0; i--) {
                            array[customDest + i] = array[customCursor + i];
                        }
                        if (length1 === 0) {
                            exit = true;
                            break;
                        }
                    }
                    array[dest--] = tmp[cursor2--];
                    if (--length2 === 1) {
                        exit = true;
                        break;
                    }
                    count2 = length2 - gallopLeft(array[cursor1], tmp, 0, length2, length2 - 1, compare);
                    if (count2 !== 0) {
                        dest -= count2;
                        cursor2 -= count2;
                        length2 -= count2;
                        customDest = dest + 1;
                        customCursor = cursor2 + 1;
                        for (i = 0; i < count2; i++) {
                            array[customDest + i] = tmp[customCursor + i];
                        }
                        if (length2 <= 1) {
                            exit = true;
                            break;
                        }
                    }
                    array[dest--] = array[cursor1--];
                    if (--length1 === 0) {
                        exit = true;
                        break;
                    }
                    _minGallop--;
                } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
                if (exit) {
                    break;
                }
                if (_minGallop < 0) {
                    _minGallop = 0;
                }
                _minGallop += 2;
            }
            minGallop = _minGallop;
            if (minGallop < 1) {
                minGallop = 1;
            }
            if (length2 === 1) {
                dest -= length1;
                cursor1 -= length1;
                customDest = dest + 1;
                customCursor = cursor1 + 1;
                for (i = length1 - 1; i >= 0; i--) {
                    array[customDest + i] = array[customCursor + i];
                }
                array[dest] = tmp[cursor2];
            }
            else if (length2 === 0) {
                throw new Error();
                // throw new Error('mergeHigh preconditions were not respected');
            }
            else {
                customCursor = dest - (length2 - 1);
                for (i = 0; i < length2; i++) {
                    array[customCursor + i] = tmp[i];
                }
            }
        }
        return {
            mergeRuns: mergeRuns,
            forceMergeRuns: forceMergeRuns,
            pushRun: pushRun
        };
    }
    function sort(array, compare, lo, hi) {
        if (!lo) {
            lo = 0;
        }
        if (!hi) {
            hi = array.length;
        }
        var remaining = hi - lo;
        if (remaining < 2) {
            return;
        }
        var runLength = 0;
        if (remaining < DEFAULT_MIN_MERGE) {
            runLength = makeAscendingRun(array, lo, hi, compare);
            binaryInsertionSort(array, lo, hi, lo + runLength, compare);
            return;
        }
        var ts = TimSort(array, compare);
        var minRun = minRunLength(remaining);
        do {
            runLength = makeAscendingRun(array, lo, hi, compare);
            if (runLength < minRun) {
                var force = remaining;
                if (force > minRun) {
                    force = minRun;
                }
                binaryInsertionSort(array, lo, lo + force, lo + runLength, compare);
                runLength = force;
            }
            ts.pushRun(lo, runLength);
            ts.mergeRuns();
            remaining -= runLength;
            lo += runLength;
        } while (remaining !== 0);
        ts.forceMergeRuns();
    }

    // Bit masks to check which parts of element needs to be updated.
    var REDRAW_BIT = 1;
    var STYLE_CHANGED_BIT = 2;
    var SHAPE_CHANGED_BIT = 4;

    var invalidZErrorLogged = false;
    function logInvalidZError() {
        if (invalidZErrorLogged) {
            return;
        }
        invalidZErrorLogged = true;
        console.warn('z / z2 / zlevel of displayable is invalid, which may cause unexpected errors');
    }
    function shapeCompareFunc(a, b) {
        if (a.zlevel === b.zlevel) {
            if (a.z === b.z) {
                // if (a.z2 === b.z2) {
                //     // FIXME Slow has renderidx compare
                //     // http://stackoverflow.com/questions/20883421/sorting-in-javascript-should-every-compare-function-have-a-return-0-statement
                //     // https://github.com/v8/v8/blob/47cce544a31ed5577ffe2963f67acb4144ee0232/src/js/array.js#L1012
                //     return a.__renderidx - b.__renderidx;
                // }
                return a.z2 - b.z2;
            }
            return a.z - b.z;
        }
        return a.zlevel - b.zlevel;
    }
    var Storage = /** @class */ (function () {
        function Storage() {
            this._roots = [];
            this._displayList = [];
            this._displayListLen = 0;
            this.displayableSortFunc = shapeCompareFunc;
        }
        Storage.prototype.traverse = function (cb, context) {
            for (var i = 0; i < this._roots.length; i++) {
                this._roots[i].traverse(cb, context);
            }
        };
        /**
         * get a list of elements to be rendered
         *
         * @param {boolean} update whether to update elements before return
         * @param {DisplayParams} params options
         * @return {Displayable[]} a list of elements
         */
        Storage.prototype.getDisplayList = function (update, includeIgnore) {
            includeIgnore = includeIgnore || false;
            var displayList = this._displayList;
            // If displaylist is not created yet. Update force
            if (update || !displayList.length) {
                this.updateDisplayList(includeIgnore);
            }
            return displayList;
        };
        /**
         * 更新图形的绘制队列。
         * 每次绘制前都会调用，该方法会先深度优先遍历整个树，更新所有Group和Shape的变换并且把所有可见的Shape保存到数组中，
         * 最后根据绘制的优先级（zlevel > z > 插入顺序）排序得到绘制队列
         */
        Storage.prototype.updateDisplayList = function (includeIgnore) {
            this._displayListLen = 0;
            var roots = this._roots;
            var displayList = this._displayList;
            for (var i = 0, len = roots.length; i < len; i++) {
                this._updateAndAddDisplayable(roots[i], null, includeIgnore);
            }
            displayList.length = this._displayListLen;
            env.canvasSupported && sort(displayList, shapeCompareFunc);
        };
        Storage.prototype._updateAndAddDisplayable = function (el, clipPaths, includeIgnore) {
            if (el.ignore && !includeIgnore) {
                return;
            }
            el.beforeUpdate();
            el.update();
            el.afterUpdate();
            var userSetClipPath = el.getClipPath();
            if (el.ignoreClip) {
                clipPaths = null;
            }
            else if (userSetClipPath) {
                // FIXME 效率影响
                if (clipPaths) {
                    clipPaths = clipPaths.slice();
                }
                else {
                    clipPaths = [];
                }
                var currentClipPath = userSetClipPath;
                var parentClipPath = el;
                // Recursively add clip path
                while (currentClipPath) {
                    // clipPath 的变换是基于使用这个 clipPath 的元素
                    // TODO: parent should be group type.
                    currentClipPath.parent = parentClipPath;
                    currentClipPath.updateTransform();
                    clipPaths.push(currentClipPath);
                    parentClipPath = currentClipPath;
                    currentClipPath = currentClipPath.getClipPath();
                }
            }
            // ZRText and Group and combining morphing Path may use children
            if (el.childrenRef) {
                var children = el.childrenRef();
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    // Force to mark as dirty if group is dirty
                    if (el.__dirty) {
                        child.__dirty |= REDRAW_BIT;
                    }
                    this._updateAndAddDisplayable(child, clipPaths, includeIgnore);
                }
                // Mark group clean here
                el.__dirty = 0;
            }
            else {
                var disp = el;
                // Element is displayable
                if (clipPaths && clipPaths.length) {
                    disp.__clipPaths = clipPaths;
                }
                else if (disp.__clipPaths && disp.__clipPaths.length > 0) {
                    disp.__clipPaths = [];
                }
                // Avoid invalid z, z2, zlevel cause sorting error.
                if (isNaN(disp.z)) {
                    logInvalidZError();
                    disp.z = 0;
                }
                if (isNaN(disp.z2)) {
                    logInvalidZError();
                    disp.z2 = 0;
                }
                if (isNaN(disp.zlevel)) {
                    logInvalidZError();
                    disp.zlevel = 0;
                }
                this._displayList[this._displayListLen++] = disp;
            }
            // Add decal
            var decalEl = el.getDecalElement && el.getDecalElement();
            if (decalEl) {
                this._updateAndAddDisplayable(decalEl, clipPaths, includeIgnore);
            }
            // Add attached text element and guide line.
            var textGuide = el.getTextGuideLine();
            if (textGuide) {
                this._updateAndAddDisplayable(textGuide, clipPaths, includeIgnore);
            }
            var textEl = el.getTextContent();
            if (textEl) {
                this._updateAndAddDisplayable(textEl, clipPaths, includeIgnore);
            }
        };
        /**
         * 添加图形(Displayable)或者组(Group)到根节点
         */
        Storage.prototype.addRoot = function (el) {
            if (el.__zr && el.__zr.storage === this) {
                return;
            }
            this._roots.push(el);
        };
        /**
         * 删除指定的图形(Displayable)或者组(Group)
         * @param el
         */
        Storage.prototype.delRoot = function (el) {
            if (el instanceof Array) {
                for (var i = 0, l = el.length; i < l; i++) {
                    this.delRoot(el[i]);
                }
                return;
            }
            var idx = indexOf(this._roots, el);
            if (idx >= 0) {
                this._roots.splice(idx, 1);
            }
        };
        Storage.prototype.delAllRoots = function () {
            this._roots = [];
            this._displayList = [];
            this._displayListLen = 0;
            return;
        };
        Storage.prototype.getRoots = function () {
            return this._roots;
        };
        /**
         * 清空并且释放Storage
         */
        Storage.prototype.dispose = function () {
            this._displayList = null;
            this._roots = null;
        };
        return Storage;
    }());

    var requestAnimationFrame;
    requestAnimationFrame = (typeof window !== 'undefined'
        && ((window.requestAnimationFrame && window.requestAnimationFrame.bind(window))
            // https://github.com/ecomfe/zrender/issues/189#issuecomment-224919809
            || (window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window))
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame)) || function (func) {
        return setTimeout(func, 16);
    };
    var requestAnimationFrame$1 = requestAnimationFrame;

    /**
     * 缓动代码来自 https://github.com/sole/tween.js/blob/master/src/Tween.js
     * @see http://sole.github.io/tween.js/examples/03_graphs.html
     * @exports zrender/animation/easing
     */
    var easing = {
        /**
        * @param {number} k
        * @return {number}
        */
        linear: function (k) {
            return k;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quadraticIn: function (k) {
            return k * k;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quadraticOut: function (k) {
            return k * (2 - k);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quadraticInOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }
            return -0.5 * (--k * (k - 2) - 1);
        },
        // 三次方的缓动（t^3）
        /**
        * @param {number} k
        * @return {number}
        */
        cubicIn: function (k) {
            return k * k * k;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        cubicOut: function (k) {
            return --k * k * k + 1;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        cubicInOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k + 2);
        },
        // 四次方的缓动（t^4）
        /**
        * @param {number} k
        * @return {number}
        */
        quarticIn: function (k) {
            return k * k * k * k;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quarticOut: function (k) {
            return 1 - (--k * k * k * k);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quarticInOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }
            return -0.5 * ((k -= 2) * k * k * k - 2);
        },
        // 五次方的缓动（t^5）
        /**
        * @param {number} k
        * @return {number}
        */
        quinticIn: function (k) {
            return k * k * k * k * k;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quinticOut: function (k) {
            return --k * k * k * k * k + 1;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        quinticInOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        },
        // 正弦曲线的缓动（sin(t)）
        /**
        * @param {number} k
        * @return {number}
        */
        sinusoidalIn: function (k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        sinusoidalOut: function (k) {
            return Math.sin(k * Math.PI / 2);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        sinusoidalInOut: function (k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        },
        // 指数曲线的缓动（2^t）
        /**
        * @param {number} k
        * @return {number}
        */
        exponentialIn: function (k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        exponentialOut: function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        exponentialInOut: function (k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        },
        // 圆形曲线的缓动（sqrt(1-t^2)）
        /**
        * @param {number} k
        * @return {number}
        */
        circularIn: function (k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        circularOut: function (k) {
            return Math.sqrt(1 - (--k * k));
        },
        /**
        * @param {number} k
        * @return {number}
        */
        circularInOut: function (k) {
            if ((k *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - k * k) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        },
        // 创建类似于弹簧在停止前来回振荡的动画
        /**
        * @param {number} k
        * @return {number}
        */
        elasticIn: function (k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            }
            else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return -(a * Math.pow(2, 10 * (k -= 1))
                * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        /**
        * @param {number} k
        * @return {number}
        */
        elasticOut: function (k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            }
            else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return (a * Math.pow(2, -10 * k)
                * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        elasticInOut: function (k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            }
            else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            if ((k *= 2) < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (k -= 1))
                    * Math.sin((k - s) * (2 * Math.PI) / p));
            }
            return a * Math.pow(2, -10 * (k -= 1))
                * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        },
        // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
        /**
        * @param {number} k
        * @return {number}
        */
        backIn: function (k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        backOut: function (k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        /**
        * @param {number} k
        * @return {number}
        */
        backInOut: function (k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        },
        // 创建弹跳效果
        /**
        * @param {number} k
        * @return {number}
        */
        bounceIn: function (k) {
            return 1 - easing.bounceOut(1 - k);
        },
        /**
        * @param {number} k
        * @return {number}
        */
        bounceOut: function (k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            }
            else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            }
            else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            }
            else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        /**
        * @param {number} k
        * @return {number}
        */
        bounceInOut: function (k) {
            if (k < 0.5) {
                return easing.bounceIn(k * 2) * 0.5;
            }
            return easing.bounceOut(k * 2 - 1) * 0.5 + 0.5;
        }
    };

    /**
     * 动画主控制器
     * @config target 动画对象，可以是数组，如果是数组的话会批量分发onframe等事件
     * @config life(1000) 动画时长
     * @config delay(0) 动画延迟时间
     * @config loop(true)
     * @config gap(0) 循环的间隔时间
     * @config onframe
     * @config easing(optional)
     * @config ondestroy(optional)
     * @config onrestart(optional)
     *
     * TODO pause
     */
    var Clip = /** @class */ (function () {
        function Clip(opts) {
            this._initialized = false;
            // 开始时间
            this._startTime = 0; // 开始时间单位毫秒
            this._pausedTime = 0;
            this._paused = false;
            this._life = opts.life || 1000;
            this._delay = opts.delay || 0;
            // this._startTime = new Date().getTime() + this._delay;
            // 是否循环
            this.loop = opts.loop == null ? false : opts.loop;
            this.gap = opts.gap || 0;
            this.easing = opts.easing || 'linear';
            this.onframe = opts.onframe;
            this.ondestroy = opts.ondestroy;
            this.onrestart = opts.onrestart;
        }
        Clip.prototype.step = function (globalTime, deltaTime) {
            // Set startTime on first step, or _startTime may has milleseconds different between clips
            // PENDING
            if (!this._initialized) {
                this._startTime = globalTime + this._delay;
                this._initialized = true;
            }
            if (this._paused) {
                this._pausedTime += deltaTime;
                return;
            }
            var percent = (globalTime - this._startTime - this._pausedTime) / this._life;
            // PENDING: Not begin yet. Still run the loop.
            // In the case callback needs to be invoked.
            // Or want to update to the begin state at next frame when `setToFinal` and `delay` are both used.
            // To avoid the unexpected blink.
            if (percent < 0) {
                percent = 0;
            }
            percent = Math.min(percent, 1);
            var easing$1 = this.easing;
            var easingFunc = typeof easing$1 === 'string'
                ? easing[easing$1] : easing$1;
            var schedule = typeof easingFunc === 'function'
                ? easingFunc(percent)
                : percent;
            this.onframe && this.onframe(schedule);
            // 结束
            if (percent === 1) {
                if (this.loop) {
                    this._restart(globalTime);
                    this.onrestart && this.onrestart();
                }
                else {
                    return true;
                }
            }
            return false;
        };
        Clip.prototype._restart = function (globalTime) {
            var remainder = (globalTime - this._startTime - this._pausedTime) % this._life;
            this._startTime = globalTime - remainder + this.gap;
            this._pausedTime = 0;
        };
        Clip.prototype.pause = function () {
            this._paused = true;
        };
        Clip.prototype.resume = function () {
            this._paused = false;
        };
        return Clip;
    }());

    // Simple LRU cache use doubly linked list
    // @module zrender/core/LRU
    var Entry = /** @class */ (function () {
        function Entry(val) {
            this.value = val;
        }
        return Entry;
    }());
    /**
     * Simple double linked list. Compared with array, it has O(1) remove operation.
     * @constructor
     */
    var LinkedList = /** @class */ (function () {
        function LinkedList() {
            this._len = 0;
        }
        /**
         * Insert a new value at the tail
         */
        LinkedList.prototype.insert = function (val) {
            var entry = new Entry(val);
            this.insertEntry(entry);
            return entry;
        };
        /**
         * Insert an entry at the tail
         */
        LinkedList.prototype.insertEntry = function (entry) {
            if (!this.head) {
                this.head = this.tail = entry;
            }
            else {
                this.tail.next = entry;
                entry.prev = this.tail;
                entry.next = null;
                this.tail = entry;
            }
            this._len++;
        };
        /**
         * Remove entry.
         */
        LinkedList.prototype.remove = function (entry) {
            var prev = entry.prev;
            var next = entry.next;
            if (prev) {
                prev.next = next;
            }
            else {
                // Is head
                this.head = next;
            }
            if (next) {
                next.prev = prev;
            }
            else {
                // Is tail
                this.tail = prev;
            }
            entry.next = entry.prev = null;
            this._len--;
        };
        /**
         * Get length
         */
        LinkedList.prototype.len = function () {
            return this._len;
        };
        /**
         * Clear list
         */
        LinkedList.prototype.clear = function () {
            this.head = this.tail = null;
            this._len = 0;
        };
        return LinkedList;
    }());
    /**
     * LRU Cache
     */
    var LRU = /** @class */ (function () {
        function LRU(maxSize) {
            this._list = new LinkedList();
            this._maxSize = 10;
            this._map = {};
            this._maxSize = maxSize;
        }
        /**
         * @return Removed value
         */
        LRU.prototype.put = function (key, value) {
            var list = this._list;
            var map = this._map;
            var removed = null;
            if (map[key] == null) {
                var len = list.len();
                // Reuse last removed entry
                var entry = this._lastRemovedEntry;
                if (len >= this._maxSize && len > 0) {
                    // Remove the least recently used
                    var leastUsedEntry = list.head;
                    list.remove(leastUsedEntry);
                    delete map[leastUsedEntry.key];
                    removed = leastUsedEntry.value;
                    this._lastRemovedEntry = leastUsedEntry;
                }
                if (entry) {
                    entry.value = value;
                }
                else {
                    entry = new Entry(value);
                }
                entry.key = key;
                list.insertEntry(entry);
                map[key] = entry;
            }
            return removed;
        };
        LRU.prototype.get = function (key) {
            var entry = this._map[key];
            var list = this._list;
            if (entry != null) {
                // Put the latest used entry in the tail
                if (entry !== list.tail) {
                    list.remove(entry);
                    list.insertEntry(entry);
                }
                return entry.value;
            }
        };
        /**
         * Clear the cache
         */
        LRU.prototype.clear = function () {
            this._list.clear();
            this._map = {};
        };
        LRU.prototype.len = function () {
            return this._list.len();
        };
        return LRU;
    }());

    var kCSSColorTable = {
        'transparent': [0, 0, 0, 0], 'aliceblue': [240, 248, 255, 1],
        'antiquewhite': [250, 235, 215, 1], 'aqua': [0, 255, 255, 1],
        'aquamarine': [127, 255, 212, 1], 'azure': [240, 255, 255, 1],
        'beige': [245, 245, 220, 1], 'bisque': [255, 228, 196, 1],
        'black': [0, 0, 0, 1], 'blanchedalmond': [255, 235, 205, 1],
        'blue': [0, 0, 255, 1], 'blueviolet': [138, 43, 226, 1],
        'brown': [165, 42, 42, 1], 'burlywood': [222, 184, 135, 1],
        'cadetblue': [95, 158, 160, 1], 'chartreuse': [127, 255, 0, 1],
        'chocolate': [210, 105, 30, 1], 'coral': [255, 127, 80, 1],
        'cornflowerblue': [100, 149, 237, 1], 'cornsilk': [255, 248, 220, 1],
        'crimson': [220, 20, 60, 1], 'cyan': [0, 255, 255, 1],
        'darkblue': [0, 0, 139, 1], 'darkcyan': [0, 139, 139, 1],
        'darkgoldenrod': [184, 134, 11, 1], 'darkgray': [169, 169, 169, 1],
        'darkgreen': [0, 100, 0, 1], 'darkgrey': [169, 169, 169, 1],
        'darkkhaki': [189, 183, 107, 1], 'darkmagenta': [139, 0, 139, 1],
        'darkolivegreen': [85, 107, 47, 1], 'darkorange': [255, 140, 0, 1],
        'darkorchid': [153, 50, 204, 1], 'darkred': [139, 0, 0, 1],
        'darksalmon': [233, 150, 122, 1], 'darkseagreen': [143, 188, 143, 1],
        'darkslateblue': [72, 61, 139, 1], 'darkslategray': [47, 79, 79, 1],
        'darkslategrey': [47, 79, 79, 1], 'darkturquoise': [0, 206, 209, 1],
        'darkviolet': [148, 0, 211, 1], 'deeppink': [255, 20, 147, 1],
        'deepskyblue': [0, 191, 255, 1], 'dimgray': [105, 105, 105, 1],
        'dimgrey': [105, 105, 105, 1], 'dodgerblue': [30, 144, 255, 1],
        'firebrick': [178, 34, 34, 1], 'floralwhite': [255, 250, 240, 1],
        'forestgreen': [34, 139, 34, 1], 'fuchsia': [255, 0, 255, 1],
        'gainsboro': [220, 220, 220, 1], 'ghostwhite': [248, 248, 255, 1],
        'gold': [255, 215, 0, 1], 'goldenrod': [218, 165, 32, 1],
        'gray': [128, 128, 128, 1], 'green': [0, 128, 0, 1],
        'greenyellow': [173, 255, 47, 1], 'grey': [128, 128, 128, 1],
        'honeydew': [240, 255, 240, 1], 'hotpink': [255, 105, 180, 1],
        'indianred': [205, 92, 92, 1], 'indigo': [75, 0, 130, 1],
        'ivory': [255, 255, 240, 1], 'khaki': [240, 230, 140, 1],
        'lavender': [230, 230, 250, 1], 'lavenderblush': [255, 240, 245, 1],
        'lawngreen': [124, 252, 0, 1], 'lemonchiffon': [255, 250, 205, 1],
        'lightblue': [173, 216, 230, 1], 'lightcoral': [240, 128, 128, 1],
        'lightcyan': [224, 255, 255, 1], 'lightgoldenrodyellow': [250, 250, 210, 1],
        'lightgray': [211, 211, 211, 1], 'lightgreen': [144, 238, 144, 1],
        'lightgrey': [211, 211, 211, 1], 'lightpink': [255, 182, 193, 1],
        'lightsalmon': [255, 160, 122, 1], 'lightseagreen': [32, 178, 170, 1],
        'lightskyblue': [135, 206, 250, 1], 'lightslategray': [119, 136, 153, 1],
        'lightslategrey': [119, 136, 153, 1], 'lightsteelblue': [176, 196, 222, 1],
        'lightyellow': [255, 255, 224, 1], 'lime': [0, 255, 0, 1],
        'limegreen': [50, 205, 50, 1], 'linen': [250, 240, 230, 1],
        'magenta': [255, 0, 255, 1], 'maroon': [128, 0, 0, 1],
        'mediumaquamarine': [102, 205, 170, 1], 'mediumblue': [0, 0, 205, 1],
        'mediumorchid': [186, 85, 211, 1], 'mediumpurple': [147, 112, 219, 1],
        'mediumseagreen': [60, 179, 113, 1], 'mediumslateblue': [123, 104, 238, 1],
        'mediumspringgreen': [0, 250, 154, 1], 'mediumturquoise': [72, 209, 204, 1],
        'mediumvioletred': [199, 21, 133, 1], 'midnightblue': [25, 25, 112, 1],
        'mintcream': [245, 255, 250, 1], 'mistyrose': [255, 228, 225, 1],
        'moccasin': [255, 228, 181, 1], 'navajowhite': [255, 222, 173, 1],
        'navy': [0, 0, 128, 1], 'oldlace': [253, 245, 230, 1],
        'olive': [128, 128, 0, 1], 'olivedrab': [107, 142, 35, 1],
        'orange': [255, 165, 0, 1], 'orangered': [255, 69, 0, 1],
        'orchid': [218, 112, 214, 1], 'palegoldenrod': [238, 232, 170, 1],
        'palegreen': [152, 251, 152, 1], 'paleturquoise': [175, 238, 238, 1],
        'palevioletred': [219, 112, 147, 1], 'papayawhip': [255, 239, 213, 1],
        'peachpuff': [255, 218, 185, 1], 'peru': [205, 133, 63, 1],
        'pink': [255, 192, 203, 1], 'plum': [221, 160, 221, 1],
        'powderblue': [176, 224, 230, 1], 'purple': [128, 0, 128, 1],
        'red': [255, 0, 0, 1], 'rosybrown': [188, 143, 143, 1],
        'royalblue': [65, 105, 225, 1], 'saddlebrown': [139, 69, 19, 1],
        'salmon': [250, 128, 114, 1], 'sandybrown': [244, 164, 96, 1],
        'seagreen': [46, 139, 87, 1], 'seashell': [255, 245, 238, 1],
        'sienna': [160, 82, 45, 1], 'silver': [192, 192, 192, 1],
        'skyblue': [135, 206, 235, 1], 'slateblue': [106, 90, 205, 1],
        'slategray': [112, 128, 144, 1], 'slategrey': [112, 128, 144, 1],
        'snow': [255, 250, 250, 1], 'springgreen': [0, 255, 127, 1],
        'steelblue': [70, 130, 180, 1], 'tan': [210, 180, 140, 1],
        'teal': [0, 128, 128, 1], 'thistle': [216, 191, 216, 1],
        'tomato': [255, 99, 71, 1], 'turquoise': [64, 224, 208, 1],
        'violet': [238, 130, 238, 1], 'wheat': [245, 222, 179, 1],
        'white': [255, 255, 255, 1], 'whitesmoke': [245, 245, 245, 1],
        'yellow': [255, 255, 0, 1], 'yellowgreen': [154, 205, 50, 1]
    };
    function clampCssByte(i) {
        i = Math.round(i); // Seems to be what Chrome does (vs truncation).
        return i < 0 ? 0 : i > 255 ? 255 : i;
    }
    function clampCssFloat(f) {
        return f < 0 ? 0 : f > 1 ? 1 : f;
    }
    function parseCssInt(val) {
        var str = val;
        if (str.length && str.charAt(str.length - 1) === '%') {
            return clampCssByte(parseFloat(str) / 100 * 255);
        }
        return clampCssByte(parseInt(str, 10));
    }
    function parseCssFloat(val) {
        var str = val;
        if (str.length && str.charAt(str.length - 1) === '%') {
            return clampCssFloat(parseFloat(str) / 100);
        }
        return clampCssFloat(parseFloat(str));
    }
    function cssHueToRgb(m1, m2, h) {
        if (h < 0) {
            h += 1;
        }
        else if (h > 1) {
            h -= 1;
        }
        if (h * 6 < 1) {
            return m1 + (m2 - m1) * h * 6;
        }
        if (h * 2 < 1) {
            return m2;
        }
        if (h * 3 < 2) {
            return m1 + (m2 - m1) * (2 / 3 - h) * 6;
        }
        return m1;
    }
    function setRgba(out, r, g, b, a) {
        out[0] = r;
        out[1] = g;
        out[2] = b;
        out[3] = a;
        return out;
    }
    function copyRgba(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    var colorCache = new LRU(20);
    var lastRemovedArr = null;
    function putToCache(colorStr, rgbaArr) {
        // Reuse removed array
        if (lastRemovedArr) {
            copyRgba(lastRemovedArr, rgbaArr);
        }
        lastRemovedArr = colorCache.put(colorStr, lastRemovedArr || (rgbaArr.slice()));
    }
    function parse(colorStr, rgbaArr) {
        if (!colorStr) {
            return;
        }
        rgbaArr = rgbaArr || [];
        var cached = colorCache.get(colorStr);
        if (cached) {
            return copyRgba(rgbaArr, cached);
        }
        // colorStr may be not string
        colorStr = colorStr + '';
        // Remove all whitespace, not compliant, but should just be more accepting.
        var str = colorStr.replace(/ /g, '').toLowerCase();
        // Color keywords (and transparent) lookup.
        if (str in kCSSColorTable) {
            copyRgba(rgbaArr, kCSSColorTable[str]);
            putToCache(colorStr, rgbaArr);
            return rgbaArr;
        }
        // supports the forms #rgb, #rrggbb, #rgba, #rrggbbaa
        // #rrggbbaa(use the last pair of digits as alpha)
        // see https://drafts.csswg.org/css-color/#hex-notation
        var strLen = str.length;
        if (str.charAt(0) === '#') {
            if (strLen === 4 || strLen === 5) {
                var iv = parseInt(str.slice(1, 4), 16); // TODO(deanm): Stricter parsing.
                if (!(iv >= 0 && iv <= 0xfff)) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return; // Covers NaN.
                }
                // interpret values of the form #rgb as #rrggbb and #rgba as #rrggbbaa
                setRgba(rgbaArr, ((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8), (iv & 0xf0) | ((iv & 0xf0) >> 4), (iv & 0xf) | ((iv & 0xf) << 4), strLen === 5 ? parseInt(str.slice(4), 16) / 0xf : 1);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            }
            else if (strLen === 7 || strLen === 9) {
                var iv = parseInt(str.slice(1, 7), 16); // TODO(deanm): Stricter parsing.
                if (!(iv >= 0 && iv <= 0xffffff)) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return; // Covers NaN.
                }
                setRgba(rgbaArr, (iv & 0xff0000) >> 16, (iv & 0xff00) >> 8, iv & 0xff, strLen === 9 ? parseInt(str.slice(7), 16) / 0xff : 1);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            }
            return;
        }
        var op = str.indexOf('(');
        var ep = str.indexOf(')');
        if (op !== -1 && ep + 1 === strLen) {
            var fname = str.substr(0, op);
            var params = str.substr(op + 1, ep - (op + 1)).split(',');
            var alpha = 1; // To allow case fallthrough.
            switch (fname) {
                case 'rgba':
                    if (params.length !== 4) {
                        return params.length === 3
                            // to be compatible with rgb
                            ? setRgba(rgbaArr, +params[0], +params[1], +params[2], 1)
                            : setRgba(rgbaArr, 0, 0, 0, 1);
                    }
                    alpha = parseCssFloat(params.pop()); // jshint ignore:line
                // Fall through.
                case 'rgb':
                    if (params.length !== 3) {
                        setRgba(rgbaArr, 0, 0, 0, 1);
                        return;
                    }
                    setRgba(rgbaArr, parseCssInt(params[0]), parseCssInt(params[1]), parseCssInt(params[2]), alpha);
                    putToCache(colorStr, rgbaArr);
                    return rgbaArr;
                case 'hsla':
                    if (params.length !== 4) {
                        setRgba(rgbaArr, 0, 0, 0, 1);
                        return;
                    }
                    params[3] = parseCssFloat(params[3]);
                    hsla2rgba(params, rgbaArr);
                    putToCache(colorStr, rgbaArr);
                    return rgbaArr;
                case 'hsl':
                    if (params.length !== 3) {
                        setRgba(rgbaArr, 0, 0, 0, 1);
                        return;
                    }
                    hsla2rgba(params, rgbaArr);
                    putToCache(colorStr, rgbaArr);
                    return rgbaArr;
                default:
                    return;
            }
        }
        setRgba(rgbaArr, 0, 0, 0, 1);
        return;
    }
    function hsla2rgba(hsla, rgba) {
        var h = (((parseFloat(hsla[0]) % 360) + 360) % 360) / 360; // 0 .. 1
        // NOTE(deanm): According to the CSS spec s/l should only be
        // percentages, but we don't bother and let float or percentage.
        var s = parseCssFloat(hsla[1]);
        var l = parseCssFloat(hsla[2]);
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;
        rgba = rgba || [];
        setRgba(rgba, clampCssByte(cssHueToRgb(m1, m2, h + 1 / 3) * 255), clampCssByte(cssHueToRgb(m1, m2, h) * 255), clampCssByte(cssHueToRgb(m1, m2, h - 1 / 3) * 255), 1);
        if (hsla.length === 4) {
            rgba[3] = hsla[3];
        }
        return rgba;
    }
    /**
     * @param arrColor like [12,33,44,0.4]
     * @param type 'rgba', 'hsva', ...
     * @return Result color. (If input illegal, return undefined).
     */
    function stringify(arrColor, type) {
        if (!arrColor || !arrColor.length) {
            return;
        }
        var colorStr = arrColor[0] + ',' + arrColor[1] + ',' + arrColor[2];
        if (type === 'rgba' || type === 'hsva' || type === 'hsla') {
            colorStr += ',' + arrColor[3];
        }
        return type + '(' + colorStr + ')';
    }
    /**
     * Calculate luminance. It will include alpha.
     */
    function lum(color, backgroundLum) {
        var arr = parse(color);
        return arr
            ? (0.299 * arr[0] + 0.587 * arr[1] + 0.114 * arr[2]) * arr[3] / 255
                + (1 - arr[3]) * backgroundLum // Blending with assumed white background.
            : 0;
    }

    /**
     * @module echarts/animation/Animator
     */
    var arraySlice = Array.prototype.slice;
    function interpolateNumber(p0, p1, percent) {
        return (p1 - p0) * percent + p0;
    }
    function step(p0, p1, percent) {
        return percent > 0.5 ? p1 : p0;
    }
    function interpolate1DArray(out, p0, p1, percent) {
        // TODO Handling different length TypedArray
        var len = p0.length;
        for (var i = 0; i < len; i++) {
            out[i] = interpolateNumber(p0[i], p1[i], percent);
        }
    }
    function interpolate2DArray(out, p0, p1, percent) {
        var len = p0.length;
        // TODO differnt length on each item?
        var len2 = len && p0[0].length;
        for (var i = 0; i < len; i++) {
            if (!out[i]) {
                out[i] = [];
            }
            for (var j = 0; j < len2; j++) {
                out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
            }
        }
    }
    function add1DArray(out, p0, p1, sign) {
        var len = p0.length;
        for (var i = 0; i < len; i++) {
            out[i] = p0[i] + p1[i] * sign;
        }
        return out;
    }
    function add2DArray(out, p0, p1, sign) {
        var len = p0.length;
        var len2 = len && p0[0].length;
        for (var i = 0; i < len; i++) {
            if (!out[i]) {
                out[i] = [];
            }
            for (var j = 0; j < len2; j++) {
                out[i][j] = p0[i][j] + p1[i][j] * sign;
            }
        }
        return out;
    }
    // arr0 is source array, arr1 is target array.
    // Do some preprocess to avoid error happened when interpolating from arr0 to arr1
    function fillArray(val0, val1, arrDim) {
        // TODO Handling different length TypedArray
        var arr0 = val0;
        var arr1 = val1;
        if (!arr0.push || !arr1.push) {
            return;
        }
        var arr0Len = arr0.length;
        var arr1Len = arr1.length;
        if (arr0Len !== arr1Len) {
            // FIXME Not work for TypedArray
            var isPreviousLarger = arr0Len > arr1Len;
            if (isPreviousLarger) {
                // Cut the previous
                arr0.length = arr1Len;
            }
            else {
                // Fill the previous
                for (var i = arr0Len; i < arr1Len; i++) {
                    arr0.push(arrDim === 1 ? arr1[i] : arraySlice.call(arr1[i]));
                }
            }
        }
        // Handling NaN value
        var len2 = arr0[0] && arr0[0].length;
        for (var i = 0; i < arr0.length; i++) {
            if (arrDim === 1) {
                if (isNaN(arr0[i])) {
                    arr0[i] = arr1[i];
                }
            }
            else {
                for (var j = 0; j < len2; j++) {
                    if (isNaN(arr0[i][j])) {
                        arr0[i][j] = arr1[i][j];
                    }
                }
            }
        }
    }
    function is1DArraySame(arr0, arr1) {
        var len = arr0.length;
        if (len !== arr1.length) {
            return false;
        }
        for (var i = 0; i < len; i++) {
            if (arr0[i] !== arr1[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Catmull Rom interpolate number
     */
    function catmullRomInterpolate(p0, p1, p2, p3, t, t2, t3) {
        var v0 = (p2 - p0) * 0.5;
        var v1 = (p3 - p1) * 0.5;
        return (2 * (p1 - p2) + v0 + v1) * t3
            + (-3 * (p1 - p2) - 2 * v0 - v1) * t2
            + v0 * t + p1;
    }
    /**
     * Catmull Rom interpolate 1D array
     */
    function catmullRomInterpolate1DArray(out, p0, p1, p2, p3, t, t2, t3) {
        var len = p0.length;
        for (var i = 0; i < len; i++) {
            out[i] = catmullRomInterpolate(p0[i], p1[i], p2[i], p3[i], t, t2, t3);
        }
    }
    /**
     * Catmull Rom interpolate 2D array
     */
    function catmullRomInterpolate2DArray(out, p0, p1, p2, p3, t, t2, t3) {
        var len = p0.length;
        var len2 = p0[0].length;
        for (var i = 0; i < len; i++) {
            if (!out[i]) {
                out[1] = [];
            }
            for (var j = 0; j < len2; j++) {
                out[i][j] = catmullRomInterpolate(p0[i][j], p1[i][j], p2[i][j], p3[i][j], t, t2, t3);
            }
        }
    }
    function cloneValue(value) {
        if (isArrayLike(value)) {
            var len = value.length;
            if (isArrayLike(value[0])) {
                var ret = [];
                for (var i = 0; i < len; i++) {
                    ret.push(arraySlice.call(value[i]));
                }
                return ret;
            }
            return arraySlice.call(value);
        }
        return value;
    }
    function rgba2String(rgba) {
        rgba[0] = Math.floor(rgba[0]);
        rgba[1] = Math.floor(rgba[1]);
        rgba[2] = Math.floor(rgba[2]);
        return 'rgba(' + rgba.join(',') + ')';
    }
    function guessArrayDim(value) {
        return isArrayLike(value && value[0]) ? 2 : 1;
    }
    var tmpRgba = [0, 0, 0, 0];
    var Track = /** @class */ (function () {
        function Track(propName) {
            this.keyframes = [];
            this.maxTime = 0;
            // Larger than 0 if value is array
            this.arrDim = 0;
            this.interpolable = true;
            this._needsSort = false;
            this._isAllValueEqual = true;
            // Info for run
            this._lastFrame = 0;
            this._lastFramePercent = 0;
            this.propName = propName;
        }
        Track.prototype.isFinished = function () {
            return this._finished;
        };
        Track.prototype.setFinished = function () {
            this._finished = true;
            // Also set additive track to finished.
            // Make sure the final value stopped on the latest track
            if (this._additiveTrack) {
                this._additiveTrack.setFinished();
            }
        };
        Track.prototype.needsAnimate = function () {
            return !this._isAllValueEqual
                && this.keyframes.length >= 2
                && this.interpolable
                && this.maxTime > 0;
        };
        Track.prototype.getAdditiveTrack = function () {
            return this._additiveTrack;
        };
        Track.prototype.addKeyframe = function (time, value) {
            if (time >= this.maxTime) {
                this.maxTime = time;
            }
            else {
                this._needsSort = true;
            }
            var keyframes = this.keyframes;
            var len = keyframes.length;
            if (this.interpolable) {
                // Handling values only if it's possible to be interpolated.
                if (isArrayLike(value)) {
                    var arrayDim = guessArrayDim(value);
                    if (len > 0 && this.arrDim !== arrayDim) { // Two values has differnt dimension.
                        this.interpolable = false;
                        return;
                    }
                    // Not a number array.
                    if (arrayDim === 1 && typeof value[0] !== 'number'
                        || arrayDim === 2 && typeof value[0][0] !== 'number') {
                        this.interpolable = false;
                        return;
                    }
                    if (len > 0) {
                        var lastFrame = keyframes[len - 1];
                        // For performance consideration. only check 1d array
                        if (this._isAllValueEqual) {
                            if (arrayDim === 1) {
                                if (!is1DArraySame(value, lastFrame.value)) {
                                    this._isAllValueEqual = false;
                                }
                            }
                            else {
                                this._isAllValueEqual = false;
                            }
                        }
                    }
                    this.arrDim = arrayDim;
                }
                else {
                    if (this.arrDim > 0) { // Previous value is array.
                        this.interpolable = false;
                        return;
                    }
                    if (typeof value === 'string') {
                        var colorArray = parse(value);
                        if (colorArray) {
                            value = colorArray;
                            this.isValueColor = true;
                        }
                        else {
                            this.interpolable = false;
                        }
                    }
                    else if (typeof value !== 'number' || isNaN(value)) {
                        this.interpolable = false;
                        return;
                    }
                    if (this._isAllValueEqual && len > 0) {
                        var lastFrame = keyframes[len - 1];
                        if (this.isValueColor && !is1DArraySame(lastFrame.value, value)) {
                            this._isAllValueEqual = false;
                        }
                        else if (lastFrame.value !== value) {
                            this._isAllValueEqual = false;
                        }
                    }
                }
            }
            var kf = {
                time: time,
                value: value,
                percent: 0
            };
            // Not check if value equal here.
            this.keyframes.push(kf);
            return kf;
        };
        Track.prototype.prepare = function (additiveTrack) {
            var kfs = this.keyframes;
            if (this._needsSort) {
                // Sort keyframe as ascending
                kfs.sort(function (a, b) {
                    return a.time - b.time;
                });
            }
            var arrDim = this.arrDim;
            var kfsLen = kfs.length;
            var lastKf = kfs[kfsLen - 1];
            for (var i = 0; i < kfsLen; i++) {
                kfs[i].percent = kfs[i].time / this.maxTime;
                if (arrDim > 0 && i !== kfsLen - 1) {
                    // Align array with target frame.
                    fillArray(kfs[i].value, lastKf.value, arrDim);
                }
            }
            // Only apply additive animaiton on INTERPOLABLE SAME TYPE values.
            if (additiveTrack
                // If two track both will be animated and have same value format.
                && this.needsAnimate()
                && additiveTrack.needsAnimate()
                && arrDim === additiveTrack.arrDim
                && this.isValueColor === additiveTrack.isValueColor
                && !additiveTrack._finished) {
                this._additiveTrack = additiveTrack;
                var startValue = kfs[0].value;
                // Calculate difference
                for (var i = 0; i < kfsLen; i++) {
                    if (arrDim === 0) {
                        if (this.isValueColor) {
                            kfs[i].additiveValue =
                                add1DArray([], kfs[i].value, startValue, -1);
                        }
                        else {
                            kfs[i].additiveValue = kfs[i].value - startValue;
                        }
                    }
                    else if (arrDim === 1) {
                        kfs[i].additiveValue = add1DArray([], kfs[i].value, startValue, -1);
                    }
                    else if (arrDim === 2) {
                        kfs[i].additiveValue = add2DArray([], kfs[i].value, startValue, -1);
                    }
                }
            }
        };
        Track.prototype.step = function (target, percent) {
            if (this._finished) { // Track may be set to finished.
                return;
            }
            if (this._additiveTrack && this._additiveTrack._finished) {
                // Remove additive track if it's finished.
                this._additiveTrack = null;
            }
            var isAdditive = this._additiveTrack != null;
            var valueKey = isAdditive ? 'additiveValue' : 'value';
            var keyframes = this.keyframes;
            var kfsNum = this.keyframes.length;
            var propName = this.propName;
            var arrDim = this.arrDim;
            var isValueColor = this.isValueColor;
            // Find the range keyframes
            // kf1-----kf2---------current--------kf3
            // find kf2 and kf3 and do interpolation
            var frameIdx;
            // In the easing function like elasticOut, percent may less than 0
            if (percent < 0) {
                frameIdx = 0;
            }
            else if (percent < this._lastFramePercent) {
                // Start from next key
                // PENDING start from lastFrame ?
                var start = Math.min(this._lastFrame + 1, kfsNum - 1);
                for (frameIdx = start; frameIdx >= 0; frameIdx--) {
                    if (keyframes[frameIdx].percent <= percent) {
                        break;
                    }
                }
                // PENDING really need to do this ?
                frameIdx = Math.min(frameIdx, kfsNum - 2);
            }
            else {
                for (frameIdx = this._lastFrame; frameIdx < kfsNum; frameIdx++) {
                    if (keyframes[frameIdx].percent > percent) {
                        break;
                    }
                }
                frameIdx = Math.min(frameIdx - 1, kfsNum - 2);
            }
            var nextFrame = keyframes[frameIdx + 1];
            var frame = keyframes[frameIdx];
            // Defensive coding.
            if (!(frame && nextFrame)) {
                return;
            }
            this._lastFrame = frameIdx;
            this._lastFramePercent = percent;
            var range = (nextFrame.percent - frame.percent);
            if (range === 0) {
                return;
            }
            var w = (percent - frame.percent) / range;
            // If value is arr
            var targetArr = isAdditive ? this._additiveValue
                : (isValueColor ? tmpRgba : target[propName]);
            if ((arrDim > 0 || isValueColor) && !targetArr) {
                targetArr = this._additiveValue = [];
            }
            if (this.useSpline) {
                var p1 = keyframes[frameIdx][valueKey];
                var p0 = keyframes[frameIdx === 0 ? frameIdx : frameIdx - 1][valueKey];
                var p2 = keyframes[frameIdx > kfsNum - 2 ? kfsNum - 1 : frameIdx + 1][valueKey];
                var p3 = keyframes[frameIdx > kfsNum - 3 ? kfsNum - 1 : frameIdx + 2][valueKey];
                if (arrDim > 0) {
                    arrDim === 1
                        ? catmullRomInterpolate1DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w)
                        : catmullRomInterpolate2DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w);
                }
                else if (isValueColor) {
                    catmullRomInterpolate1DArray(targetArr, p0, p1, p2, p3, w, w * w, w * w * w);
                    if (!isAdditive) { // Convert to string later:)
                        target[propName] = rgba2String(targetArr);
                    }
                }
                else {
                    var value = void 0;
                    if (!this.interpolable) {
                        // String is step(0.5)
                        // value = step(p1, p2, w);
                        value = p2;
                    }
                    else {
                        value = catmullRomInterpolate(p0, p1, p2, p3, w, w * w, w * w * w);
                    }
                    if (isAdditive) {
                        this._additiveValue = value;
                    }
                    else {
                        target[propName] = value;
                    }
                }
            }
            else {
                if (arrDim > 0) {
                    arrDim === 1
                        ? interpolate1DArray(targetArr, frame[valueKey], nextFrame[valueKey], w)
                        : interpolate2DArray(targetArr, frame[valueKey], nextFrame[valueKey], w);
                }
                else if (isValueColor) {
                    interpolate1DArray(targetArr, frame[valueKey], nextFrame[valueKey], w);
                    if (!isAdditive) { // Convert to string later:)
                        target[propName] = rgba2String(targetArr);
                    }
                }
                else {
                    var value = void 0;
                    if (!this.interpolable) {
                        // String is step(0.5)
                        value = step(frame[valueKey], nextFrame[valueKey], w);
                    }
                    else {
                        value = interpolateNumber(frame[valueKey], nextFrame[valueKey], w);
                    }
                    if (isAdditive) {
                        this._additiveValue = value;
                    }
                    else {
                        target[propName] = value;
                    }
                }
            }
            // Add additive to target
            if (isAdditive) {
                this._addToTarget(target);
            }
        };
        Track.prototype._addToTarget = function (target) {
            var arrDim = this.arrDim;
            var propName = this.propName;
            var additiveValue = this._additiveValue;
            if (arrDim === 0) {
                if (this.isValueColor) {
                    // TODO reduce unnecessary parse
                    parse(target[propName], tmpRgba);
                    add1DArray(tmpRgba, tmpRgba, additiveValue, 1);
                    target[propName] = rgba2String(tmpRgba);
                }
                else {
                    // Add a difference value based on the change of previous frame.
                    target[propName] = target[propName] + additiveValue;
                }
            }
            else if (arrDim === 1) {
                add1DArray(target[propName], target[propName], additiveValue, 1);
            }
            else if (arrDim === 2) {
                add2DArray(target[propName], target[propName], additiveValue, 1);
            }
        };
        return Track;
    }());
    var Animator = /** @class */ (function () {
        function Animator(target, loop, additiveTo) {
            this._tracks = {};
            this._trackKeys = [];
            this._delay = 0;
            this._maxTime = 0;
            // Some status
            this._paused = false;
            // 0: Not started
            // 1: Invoked started
            // 2: Has been run for at least one frame.
            this._started = 0;
            this._clip = null;
            this._target = target;
            this._loop = loop;
            if (loop && additiveTo) {
                logError('Can\' use additive animation on looped animation.');
                return;
            }
            this._additiveAnimators = additiveTo;
        }
        Animator.prototype.getTarget = function () {
            return this._target;
        };
        /**
         * Target can be changed during animation
         * For example if style is changed during state change.
         * We need to change target to the new style object.
         */
        Animator.prototype.changeTarget = function (target) {
            this._target = target;
        };
        /**
         * Set Animation keyframe
         * @param time 关键帧时间，单位是ms
         * @param props 关键帧的属性值，key-value表示
         */
        Animator.prototype.when = function (time, props) {
            return this.whenWithKeys(time, props, keys(props));
        };
        // Fast path for add keyframes of aniamteTo
        Animator.prototype.whenWithKeys = function (time, props, propNames) {
            var tracks = this._tracks;
            for (var i = 0; i < propNames.length; i++) {
                var propName = propNames[i];
                var track = tracks[propName];
                if (!track) {
                    track = tracks[propName] = new Track(propName);
                    var initialValue = void 0;
                    var additiveTrack = this._getAdditiveTrack(propName);
                    if (additiveTrack) {
                        var lastFinalKf = additiveTrack.keyframes[additiveTrack.keyframes.length - 1];
                        // Use the last state of additived animator.
                        initialValue = lastFinalKf && lastFinalKf.value;
                        if (additiveTrack.isValueColor && initialValue) {
                            // Convert to rgba string
                            initialValue = rgba2String(initialValue);
                        }
                    }
                    else {
                        initialValue = this._target[propName];
                    }
                    // Invalid value
                    if (initialValue == null) {
                        // zrLog('Invalid property ' + propName);
                        continue;
                    }
                    // If time is 0
                    //  Then props is given initialize value
                    // Else
                    //  Initialize value from current prop value
                    if (time !== 0) {
                        track.addKeyframe(0, cloneValue(initialValue));
                    }
                    this._trackKeys.push(propName);
                }
                // PENDING
                track.addKeyframe(time, cloneValue(props[propName]));
            }
            this._maxTime = Math.max(this._maxTime, time);
            return this;
        };
        Animator.prototype.pause = function () {
            this._clip.pause();
            this._paused = true;
        };
        Animator.prototype.resume = function () {
            this._clip.resume();
            this._paused = false;
        };
        Animator.prototype.isPaused = function () {
            return !!this._paused;
        };
        Animator.prototype._doneCallback = function () {
            this._setTracksFinished();
            // Clear clip
            this._clip = null;
            var doneList = this._doneCbs;
            if (doneList) {
                var len = doneList.length;
                for (var i = 0; i < len; i++) {
                    doneList[i].call(this);
                }
            }
        };
        Animator.prototype._abortedCallback = function () {
            this._setTracksFinished();
            var animation = this.animation;
            var abortedList = this._abortedCbs;
            if (animation) {
                animation.removeClip(this._clip);
            }
            this._clip = null;
            if (abortedList) {
                for (var i = 0; i < abortedList.length; i++) {
                    abortedList[i].call(this);
                }
            }
        };
        Animator.prototype._setTracksFinished = function () {
            var tracks = this._tracks;
            var tracksKeys = this._trackKeys;
            for (var i = 0; i < tracksKeys.length; i++) {
                tracks[tracksKeys[i]].setFinished();
            }
        };
        Animator.prototype._getAdditiveTrack = function (trackName) {
            var additiveTrack;
            var additiveAnimators = this._additiveAnimators;
            if (additiveAnimators) {
                for (var i = 0; i < additiveAnimators.length; i++) {
                    var track = additiveAnimators[i].getTrack(trackName);
                    if (track) {
                        // Use the track of latest animator.
                        additiveTrack = track;
                    }
                }
            }
            return additiveTrack;
        };
        /**
         * Start the animation
         * @param easing
         * @param  forceAnimate
         * @return
         */
        Animator.prototype.start = function (easing, forceAnimate) {
            if (this._started > 0) {
                return;
            }
            this._started = 1;
            var self = this;
            var tracks = [];
            for (var i = 0; i < this._trackKeys.length; i++) {
                var propName = this._trackKeys[i];
                var track = this._tracks[propName];
                var additiveTrack = this._getAdditiveTrack(propName);
                var kfs = track.keyframes;
                track.prepare(additiveTrack);
                if (track.needsAnimate()) {
                    tracks.push(track);
                }
                else if (!track.interpolable) {
                    var lastKf = kfs[kfs.length - 1];
                    // Set final value.
                    if (lastKf) {
                        self._target[track.propName] = lastKf.value;
                    }
                }
            }
            // Add during callback on the last clip
            if (tracks.length || forceAnimate) {
                var clip = new Clip({
                    life: this._maxTime,
                    loop: this._loop,
                    delay: this._delay,
                    onframe: function (percent) {
                        self._started = 2;
                        // Remove additived animator if it's finished.
                        // For the purpose of memory effeciency.
                        var additiveAnimators = self._additiveAnimators;
                        if (additiveAnimators) {
                            var stillHasAdditiveAnimator = false;
                            for (var i = 0; i < additiveAnimators.length; i++) {
                                if (additiveAnimators[i]._clip) {
                                    stillHasAdditiveAnimator = true;
                                    break;
                                }
                            }
                            if (!stillHasAdditiveAnimator) {
                                self._additiveAnimators = null;
                            }
                        }
                        for (var i = 0; i < tracks.length; i++) {
                            // NOTE: don't cache target outside.
                            // Because target may be changed.
                            tracks[i].step(self._target, percent);
                        }
                        var onframeList = self._onframeCbs;
                        if (onframeList) {
                            for (var i = 0; i < onframeList.length; i++) {
                                onframeList[i](self._target, percent);
                            }
                        }
                    },
                    ondestroy: function () {
                        self._doneCallback();
                    }
                });
                this._clip = clip;
                if (this.animation) {
                    this.animation.addClip(clip);
                }
                if (easing && easing !== 'spline') {
                    clip.easing = easing;
                }
            }
            else {
                // This optimization will help the case that in the upper application
                // the view may be refreshed frequently, where animation will be
                // called repeatly but nothing changed.
                this._doneCallback();
            }
            return this;
        };
        /**
         * Stop animation
         * @param {boolean} forwardToLast If move to last frame before stop
         */
        Animator.prototype.stop = function (forwardToLast) {
            if (!this._clip) {
                return;
            }
            var clip = this._clip;
            if (forwardToLast) {
                // Move to last frame before stop
                clip.onframe(1);
            }
            this._abortedCallback();
        };
        /**
         * Set when animation delay starts
         * @param time 单位ms
         */
        Animator.prototype.delay = function (time) {
            this._delay = time;
            return this;
        };
        /**
         * 添加动画每一帧的回调函数
         * @param callback
         */
        Animator.prototype.during = function (cb) {
            if (cb) {
                if (!this._onframeCbs) {
                    this._onframeCbs = [];
                }
                this._onframeCbs.push(cb);
            }
            return this;
        };
        /**
         * Add callback for animation end
         * @param cb
         */
        Animator.prototype.done = function (cb) {
            if (cb) {
                if (!this._doneCbs) {
                    this._doneCbs = [];
                }
                this._doneCbs.push(cb);
            }
            return this;
        };
        Animator.prototype.aborted = function (cb) {
            if (cb) {
                if (!this._abortedCbs) {
                    this._abortedCbs = [];
                }
                this._abortedCbs.push(cb);
            }
            return this;
        };
        Animator.prototype.getClip = function () {
            return this._clip;
        };
        Animator.prototype.getTrack = function (propName) {
            return this._tracks[propName];
        };
        /**
         * Return true if animator is not available anymore.
         */
        Animator.prototype.stopTracks = function (propNames, forwardToLast) {
            if (!propNames.length || !this._clip) {
                return true;
            }
            var tracks = this._tracks;
            var tracksKeys = this._trackKeys;
            for (var i = 0; i < propNames.length; i++) {
                var track = tracks[propNames[i]];
                if (track) {
                    if (forwardToLast) {
                        track.step(this._target, 1);
                    }
                    // If the track has not been run for at least wrong frame.
                    // The property may be stayed at the final state. when setToFinal is set true.
                    // For example:
                    // Animate x from 0 to 100, then animate to 150 immediately.
                    // We want the x is translated from 0 to 150, not 100 to 150.
                    else if (this._started === 1) {
                        track.step(this._target, 0);
                    }
                    // Set track to finished
                    track.setFinished();
                }
            }
            var allAborted = true;
            for (var i = 0; i < tracksKeys.length; i++) {
                if (!tracks[tracksKeys[i]].isFinished()) {
                    allAborted = false;
                    break;
                }
            }
            // Remove clip if all tracks has been aborted.
            if (allAborted) {
                this._abortedCallback();
            }
            return allAborted;
        };
        /**
         * Save values of final state to target.
         * It is mainly used in state mangement. When state is switching during animation.
         * We need to save final state of animation to the normal state. Not interpolated value.
         */
        Animator.prototype.saveFinalToTarget = function (target, trackKeys) {
            if (!target) { // DO nothing if target is not given.
                return;
            }
            trackKeys = trackKeys || this._trackKeys;
            for (var i = 0; i < trackKeys.length; i++) {
                var propName = trackKeys[i];
                var track = this._tracks[propName];
                if (!track || track.isFinished()) { // Ignore finished track.
                    continue;
                }
                var kfs = track.keyframes;
                var lastKf = kfs[kfs.length - 1];
                if (lastKf) {
                    // TODO CLONE?
                    var val = cloneValue(lastKf.value);
                    if (track.isValueColor) {
                        val = rgba2String(val);
                    }
                    target[propName] = val;
                }
            }
        };
        // Change final value after animator has been started.
        // NOTE: Be careful to use it.
        Animator.prototype.__changeFinalValue = function (finalProps, trackKeys) {
            trackKeys = trackKeys || keys(finalProps);
            for (var i = 0; i < trackKeys.length; i++) {
                var propName = trackKeys[i];
                var track = this._tracks[propName];
                if (!track) {
                    continue;
                }
                var kfs = track.keyframes;
                if (kfs.length > 1) {
                    // Remove the original last kf and add again.
                    var lastKf = kfs.pop();
                    track.addKeyframe(lastKf.time, finalProps[propName]);
                    // Prepare again.
                    track.prepare(track.getAdditiveTrack());
                }
            }
        };
        return Animator;
    }());

    /**
     * Animation main class, dispatch and manage all animation controllers
     *
     */
    /**
     * @example
     *     const animation = new Animation();
     *     const obj = {
     *         x: 100,
     *         y: 100
     *     };
     *     animation.animate(node.position)
     *         .when(1000, {
     *             x: 500,
     *             y: 500
     *         })
     *         .when(2000, {
     *             x: 100,
     *             y: 100
     *         })
     *         .start('spline');
     */
    var Animation = /** @class */ (function (_super) {
        __extends(Animation, _super);
        function Animation(opts) {
            var _this = _super.call(this) || this;
            _this._running = false;
            _this._time = 0;
            _this._pausedTime = 0;
            _this._pauseStart = 0;
            _this._paused = false;
            opts = opts || {};
            _this.stage = opts.stage || {};
            _this.onframe = opts.onframe || function () { };
            return _this;
        }
        /**
         * Add clip
         */
        Animation.prototype.addClip = function (clip) {
            if (clip.animation) {
                // Clip has been added
                this.removeClip(clip);
            }
            if (!this._clipsHead) {
                this._clipsHead = this._clipsTail = clip;
            }
            else {
                this._clipsTail.next = clip;
                clip.prev = this._clipsTail;
                clip.next = null;
                this._clipsTail = clip;
            }
            clip.animation = this;
        };
        /**
         * Add animator
         */
        Animation.prototype.addAnimator = function (animator) {
            animator.animation = this;
            var clip = animator.getClip();
            if (clip) {
                this.addClip(clip);
            }
        };
        /**
         * Delete animation clip
         */
        Animation.prototype.removeClip = function (clip) {
            if (!clip.animation) {
                return;
            }
            var prev = clip.prev;
            var next = clip.next;
            if (prev) {
                prev.next = next;
            }
            else {
                // Is head
                this._clipsHead = next;
            }
            if (next) {
                next.prev = prev;
            }
            else {
                // Is tail
                this._clipsTail = prev;
            }
            clip.next = clip.prev = clip.animation = null;
        };
        /**
         * Delete animation clip
         */
        Animation.prototype.removeAnimator = function (animator) {
            var clip = animator.getClip();
            if (clip) {
                this.removeClip(clip);
            }
            animator.animation = null;
        };
        Animation.prototype.update = function (notTriggerFrameAndStageUpdate) {
            var time = new Date().getTime() - this._pausedTime;
            var delta = time - this._time;
            var clip = this._clipsHead;
            while (clip) {
                // Save the nextClip before step.
                // So the loop will not been affected if the clip is removed in the callback
                var nextClip = clip.next;
                var finished = clip.step(time, delta);
                if (finished) {
                    clip.ondestroy && clip.ondestroy();
                    this.removeClip(clip);
                    clip = nextClip;
                }
                else {
                    clip = nextClip;
                }
            }
            this._time = time;
            if (!notTriggerFrameAndStageUpdate) {
                this.onframe(delta);
                // 'frame' should be triggered before stage, because upper application
                // depends on the sequence (e.g., echarts-stream and finish
                // event judge)
                this.trigger('frame', delta);
                this.stage.update && this.stage.update();
            }
        };
        Animation.prototype._startLoop = function () {
            var self = this;
            this._running = true;
            function step() {
                if (self._running) {
                    requestAnimationFrame$1(step);
                    !self._paused && self.update();
                }
            }
            requestAnimationFrame$1(step);
        };
        /**
         * Start animation.
         */
        Animation.prototype.start = function () {
            if (this._running) {
                return;
            }
            this._time = new Date().getTime();
            this._pausedTime = 0;
            this._startLoop();
        };
        /**
         * Stop animation.
         */
        Animation.prototype.stop = function () {
            this._running = false;
        };
        /**
         * Pause animation.
         */
        Animation.prototype.pause = function () {
            if (!this._paused) {
                this._pauseStart = new Date().getTime();
                this._paused = true;
            }
        };
        /**
         * Resume animation.
         */
        Animation.prototype.resume = function () {
            if (this._paused) {
                this._pausedTime += (new Date().getTime()) - this._pauseStart;
                this._paused = false;
            }
        };
        /**
         * Clear animation.
         */
        Animation.prototype.clear = function () {
            var clip = this._clipsHead;
            while (clip) {
                var nextClip = clip.next;
                clip.prev = clip.next = clip.animation = null;
                clip = nextClip;
            }
            this._clipsHead = this._clipsTail = null;
        };
        /**
         * Whether animation finished.
         */
        Animation.prototype.isFinished = function () {
            return this._clipsHead == null;
        };
        /**
         * Creat animator for a target, whose props can be animated.
         */
        // TODO Gap
        Animation.prototype.animate = function (target, options) {
            options = options || {};
            // Start animation loop
            this.start();
            var animator = new Animator(target, options.loop);
            this.addAnimator(animator);
            return animator;
        };
        return Animation;
    }(Eventful));

    /* global document */
    var TOUCH_CLICK_DELAY = 300;
    var globalEventSupported = env.domSupported;
    var localNativeListenerNames = (function () {
        var mouseHandlerNames = [
            'click', 'dblclick', 'mousewheel', 'wheel', 'mouseout',
            'mouseup', 'mousedown', 'mousemove', 'contextmenu'
        ];
        var touchHandlerNames = [
            'touchstart', 'touchend', 'touchmove'
        ];
        var pointerEventNameMap = {
            pointerdown: 1, pointerup: 1, pointermove: 1, pointerout: 1
        };
        var pointerHandlerNames = map(mouseHandlerNames, function (name) {
            var nm = name.replace('mouse', 'pointer');
            return pointerEventNameMap.hasOwnProperty(nm) ? nm : name;
        });
        return {
            mouse: mouseHandlerNames,
            touch: touchHandlerNames,
            pointer: pointerHandlerNames
        };
    })();
    var globalNativeListenerNames = {
        mouse: ['mousemove', 'mouseup'],
        pointer: ['pointermove', 'pointerup']
    };
    var wheelEventSupported = false;
    // Although firfox has 'DOMMouseScroll' event and do not has 'mousewheel' event,
    // the 'DOMMouseScroll' event do not performe the same behavior on touch pad device
    // (like on Mac) ('DOMMouseScroll' will be triggered only if a big wheel delta).
    // So we should not use it.
    // function eventNameFix(name: string) {
    //     return (name === 'mousewheel' && env.browser.firefox) ? 'DOMMouseScroll' : name;
    // }
    function isPointerFromTouch(event) {
        var pointerType = event.pointerType;
        return pointerType === 'pen' || pointerType === 'touch';
    }
    // function useMSGuesture(handlerProxy, event) {
    //     return isPointerFromTouch(event) && !!handlerProxy._msGesture;
    // }
    // function onMSGestureChange(proxy, event) {
    //     if (event.translationX || event.translationY) {
    //         // mousemove is carried by MSGesture to reduce the sensitivity.
    //         proxy.handler.dispatchToElement(event.target, 'mousemove', event);
    //     }
    //     if (event.scale !== 1) {
    //         event.pinchX = event.offsetX;
    //         event.pinchY = event.offsetY;
    //         event.pinchScale = event.scale;
    //         proxy.handler.dispatchToElement(event.target, 'pinch', event);
    //     }
    // }
    /**
     * Prevent mouse event from being dispatched after Touch Events action
     * @see <https://github.com/deltakosh/handjs/blob/master/src/hand.base.js>
     * 1. Mobile browsers dispatch mouse events 300ms after touchend.
     * 2. Chrome for Android dispatch mousedown for long-touch about 650ms
     * Result: Blocking Mouse Events for 700ms.
     *
     * @param {DOMHandlerScope} scope
     */
    function setTouchTimer(scope) {
        scope.touching = true;
        if (scope.touchTimer != null) {
            clearTimeout(scope.touchTimer);
            scope.touchTimer = null;
        }
        scope.touchTimer = setTimeout(function () {
            scope.touching = false;
            scope.touchTimer = null;
        }, 700);
    }
    // Mark touch, which is useful in distinguish touch and
    // mouse event in upper applicatoin.
    function markTouch(event) {
        event && (event.zrByTouch = true);
    }
    // function markTriggeredFromLocal(event) {
    //     event && (event.__zrIsFromLocal = true);
    // }
    // function isTriggeredFromLocal(instance, event) {
    //     return !!(event && event.__zrIsFromLocal);
    // }
    function normalizeGlobalEvent(instance, event) {
        // offsetX, offsetY still need to be calculated. They are necessary in the event
        // handlers of the upper applications. Set `true` to force calculate them.
        return normalizeEvent(instance.dom, 
        // TODO ANY TYPE
        new FakeGlobalEvent(instance, event), true);
    }
    /**
     * Detect whether the given el is in `painterRoot`.
     */
    function isLocalEl(instance, el) {
        var elTmp = el;
        var isLocal = false;
        while (elTmp && elTmp.nodeType !== 9
            && !(isLocal = elTmp.domBelongToZr
                || (elTmp !== el && elTmp === instance.painterRoot))) {
            elTmp = elTmp.parentNode;
        }
        return isLocal;
    }
    /**
     * Make a fake event but not change the original event,
     * becuase the global event probably be used by other
     * listeners not belonging to zrender.
     * @class
     */
    var FakeGlobalEvent = /** @class */ (function () {
        function FakeGlobalEvent(instance, event) {
            // we make the default methods on the event do nothing,
            // otherwise it is dangerous. See more details in
            // [DRAG_OUTSIDE] in `Handler.js`.
            this.stopPropagation = noop;
            this.stopImmediatePropagation = noop;
            this.preventDefault = noop;
            this.type = event.type;
            this.target = this.currentTarget = instance.dom;
            this.pointerType = event.pointerType;
            // Necessray for the force calculation of zrX, zrY
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            // Because we do not mount global listeners to touch events,
            // we do not copy `targetTouches` and `changedTouches` here.
        }
        return FakeGlobalEvent;
    }());
    /**
     * Local DOM Handlers
     * @this {HandlerProxy}
     */
    var localDOMHandlers = {
        mousedown: function (event) {
            event = normalizeEvent(this.dom, event);
            this.__mayPointerCapture = [event.zrX, event.zrY];
            this.trigger('mousedown', event);
        },
        mousemove: function (event) {
            event = normalizeEvent(this.dom, event);
            var downPoint = this.__mayPointerCapture;
            if (downPoint && (event.zrX !== downPoint[0] || event.zrY !== downPoint[1])) {
                this.__togglePointerCapture(true);
            }
            this.trigger('mousemove', event);
        },
        mouseup: function (event) {
            event = normalizeEvent(this.dom, event);
            this.__togglePointerCapture(false);
            this.trigger('mouseup', event);
        },
        mouseout: function (event) {
            event = normalizeEvent(this.dom, event);
            // There might be some doms created by upper layer application
            // at the same level of painter.getViewportRoot() (e.g., tooltip
            // dom created by echarts), where 'globalout' event should not
            // be triggered when mouse enters these doms. (But 'mouseout'
            // should be triggered at the original hovered element as usual).
            var element = event.toElement || event.relatedTarget;
            // For SVG rendering, there are SVG elements inside `this.dom`.
            // (especially in decal case). Should not to handle those "mouseout"..
            if (!isLocalEl(this, element)) {
                // Similarly to the browser did on `document` and touch event,
                // `globalout` will be delayed to final pointer cature release.
                if (this.__pointerCapturing) {
                    event.zrEventControl = 'no_globalout';
                }
                this.trigger('mouseout', event);
            }
        },
        wheel: function (event) {
            // Morden agent has supported event `wheel` instead of `mousewheel`.
            // About the polyfill of the props "delta", see "arc/core/event.ts".
            // Firefox only support `wheel` rather than `mousewheel`. Although firfox has been supporting
            // event `DOMMouseScroll`, it do not act the same behavior as `wheel` on touch pad device
            // like on Mac, where `DOMMouseScroll` will be triggered only if a big wheel delta occurs,
            // and it results in no chance to "preventDefault". So we should not use `DOMMouseScroll`.
            wheelEventSupported = true;
            event = normalizeEvent(this.dom, event);
            // Follow the definition of the previous version, the zrender event name is still 'mousewheel'.
            this.trigger('mousewheel', event);
        },
        mousewheel: function (event) {
            // IE8- and some other lagacy agent do not support event `wheel`, so we still listen
            // to the legacy event `mouseevent`.
            // Typically if event `wheel` is suppored and the handler has been mounted on a
            // DOM element, the lagecy `mousewheel` event will not be triggered (Chrome and Safari).
            // But we still do this guard to avoid to duplicated handle.
            if (wheelEventSupported) {
                return;
            }
            event = normalizeEvent(this.dom, event);
            this.trigger('mousewheel', event);
        },
        touchstart: function (event) {
            // Default mouse behaviour should not be disabled here.
            // For example, page may needs to be slided.
            event = normalizeEvent(this.dom, event);
            markTouch(event);
            this.__lastTouchMoment = new Date();
            this.handler.processGesture(event, 'start');
            // For consistent event listener for both touch device and mouse device,
            // we simulate "mouseover-->mousedown" in touch device. So we trigger
            // `mousemove` here (to trigger `mouseover` inside), and then trigger
            // `mousedown`.
            localDOMHandlers.mousemove.call(this, event);
            localDOMHandlers.mousedown.call(this, event);
        },
        touchmove: function (event) {
            event = normalizeEvent(this.dom, event);
            markTouch(event);
            this.handler.processGesture(event, 'change');
            // Mouse move should always be triggered no matter whether
            // there is gestrue event, because mouse move and pinch may
            // be used at the same time.
            localDOMHandlers.mousemove.call(this, event);
        },
        touchend: function (event) {
            event = normalizeEvent(this.dom, event);
            markTouch(event);
            this.handler.processGesture(event, 'end');
            localDOMHandlers.mouseup.call(this, event);
            // Do not trigger `mouseout` here, in spite of `mousemove`(`mouseover`) is
            // triggered in `touchstart`. This seems to be illogical, but by this mechanism,
            // we can conveniently implement "hover style" in both PC and touch device just
            // by listening to `mouseover` to add "hover style" and listening to `mouseout`
            // to remove "hover style" on an element, without any additional code for
            // compatibility. (`mouseout` will not be triggered in `touchend`, so "hover
            // style" will remain for user view)
            // click event should always be triggered no matter whether
            // there is gestrue event. System click can not be prevented.
            if (+new Date() - (+this.__lastTouchMoment) < TOUCH_CLICK_DELAY) {
                localDOMHandlers.click.call(this, event);
            }
        },
        pointerdown: function (event) {
            localDOMHandlers.mousedown.call(this, event);
            // if (useMSGuesture(this, event)) {
            //     this._msGesture.addPointer(event.pointerId);
            // }
        },
        pointermove: function (event) {
            // FIXME
            // pointermove is so sensitive that it always triggered when
            // tap(click) on touch screen, which affect some judgement in
            // upper application. So, we dont support mousemove on MS touch
            // device yet.
            if (!isPointerFromTouch(event)) {
                localDOMHandlers.mousemove.call(this, event);
            }
        },
        pointerup: function (event) {
            localDOMHandlers.mouseup.call(this, event);
        },
        pointerout: function (event) {
            // pointerout will be triggered when tap on touch screen
            // (IE11+/Edge on MS Surface) after click event triggered,
            // which is inconsistent with the mousout behavior we defined
            // in touchend. So we unify them.
            // (check localDOMHandlers.touchend for detailed explanation)
            if (!isPointerFromTouch(event)) {
                localDOMHandlers.mouseout.call(this, event);
            }
        }
    };
    /**
     * Othere DOM UI Event handlers for zr dom.
     * @this {HandlerProxy}
     */
    each(['click', 'dblclick', 'contextmenu'], function (name) {
        localDOMHandlers[name] = function (event) {
            event = normalizeEvent(this.dom, event);
            this.trigger(name, event);
        };
    });
    /**
     * DOM UI Event handlers for global page.
     *
     * [Caution]:
     * those handlers should both support in capture phase and bubble phase!
     */
    var globalDOMHandlers = {
        pointermove: function (event) {
            // FIXME
            // pointermove is so sensitive that it always triggered when
            // tap(click) on touch screen, which affect some judgement in
            // upper application. So, we dont support mousemove on MS touch
            // device yet.
            if (!isPointerFromTouch(event)) {
                globalDOMHandlers.mousemove.call(this, event);
            }
        },
        pointerup: function (event) {
            globalDOMHandlers.mouseup.call(this, event);
        },
        mousemove: function (event) {
            this.trigger('mousemove', event);
        },
        mouseup: function (event) {
            var pointerCaptureReleasing = this.__pointerCapturing;
            this.__togglePointerCapture(false);
            this.trigger('mouseup', event);
            if (pointerCaptureReleasing) {
                event.zrEventControl = 'only_globalout';
                this.trigger('mouseout', event);
            }
        }
    };
    function mountLocalDOMEventListeners(instance, scope) {
        var domHandlers = scope.domHandlers;
        if (env.pointerEventsSupported) { // Only IE11+/Edge
            // 1. On devices that both enable touch and mouse (e.g., MS Surface and lenovo X240),
            // IE11+/Edge do not trigger touch event, but trigger pointer event and mouse event
            // at the same time.
            // 2. On MS Surface, it probablely only trigger mousedown but no mouseup when tap on
            // screen, which do not occurs in pointer event.
            // So we use pointer event to both detect touch gesture and mouse behavior.
            each(localNativeListenerNames.pointer, function (nativeEventName) {
                mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                    // markTriggeredFromLocal(event);
                    domHandlers[nativeEventName].call(instance, event);
                });
            });
            // FIXME
            // Note: MS Gesture require CSS touch-action set. But touch-action is not reliable,
            // which does not prevent defuault behavior occasionally (which may cause view port
            // zoomed in but use can not zoom it back). And event.preventDefault() does not work.
            // So we have to not to use MSGesture and not to support touchmove and pinch on MS
            // touch screen. And we only support click behavior on MS touch screen now.
            // MS Gesture Event is only supported on IE11+/Edge and on Windows 8+.
            // We dont support touch on IE on win7.
            // See <https://msdn.microsoft.com/en-us/library/dn433243(v=vs.85).aspx>
            // if (typeof MSGesture === 'function') {
            //     (this._msGesture = new MSGesture()).target = dom; // jshint ignore:line
            //     dom.addEventListener('MSGestureChange', onMSGestureChange);
            // }
        }
        else {
            if (env.touchEventsSupported) {
                each(localNativeListenerNames.touch, function (nativeEventName) {
                    mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                        // markTriggeredFromLocal(event);
                        domHandlers[nativeEventName].call(instance, event);
                        setTouchTimer(scope);
                    });
                });
                // Handler of 'mouseout' event is needed in touch mode, which will be mounted below.
                // addEventListener(root, 'mouseout', this._mouseoutHandler);
            }
            // 1. Considering some devices that both enable touch and mouse event (like on MS Surface
            // and lenovo X240, @see #2350), we make mouse event be always listened, otherwise
            // mouse event can not be handle in those devices.
            // 2. On MS Surface, Chrome will trigger both touch event and mouse event. How to prevent
            // mouseevent after touch event triggered, see `setTouchTimer`.
            each(localNativeListenerNames.mouse, function (nativeEventName) {
                mountSingleDOMEventListener(scope, nativeEventName, function (event) {
                    event = getNativeEvent(event);
                    if (!scope.touching) {
                        // markTriggeredFromLocal(event);
                        domHandlers[nativeEventName].call(instance, event);
                    }
                });
            });
        }
    }
    function mountGlobalDOMEventListeners(instance, scope) {
        // Only IE11+/Edge. See the comment in `mountLocalDOMEventListeners`.
        if (env.pointerEventsSupported) {
            each(globalNativeListenerNames.pointer, mount);
        }
        // Touch event has implemented "drag outside" so we do not mount global listener for touch event.
        // (see https://www.w3.org/TR/touch-events/#the-touchmove-event) (see also `DRAG_OUTSIDE`).
        // We do not consider "both-support-touch-and-mouse device" for this feature (see the comment of
        // `mountLocalDOMEventListeners`) to avoid bugs util some requirements come.
        else if (!env.touchEventsSupported) {
            each(globalNativeListenerNames.mouse, mount);
        }
        function mount(nativeEventName) {
            function nativeEventListener(event) {
                event = getNativeEvent(event);
                // See the reason in [DRAG_OUTSIDE] in `Handler.js`
                // This checking supports both `useCapture` or not.
                // PENDING: if there is performance issue in some devices,
                // we probably can not use `useCapture` and change a easier
                // to judes whether local (mark).
                if (!isLocalEl(instance, event.target)) {
                    event = normalizeGlobalEvent(instance, event);
                    scope.domHandlers[nativeEventName].call(instance, event);
                }
            }
            mountSingleDOMEventListener(scope, nativeEventName, nativeEventListener, { capture: true } // See [DRAG_OUTSIDE] in `Handler.js`
            );
        }
    }
    function mountSingleDOMEventListener(scope, nativeEventName, listener, opt) {
        scope.mounted[nativeEventName] = listener;
        scope.listenerOpts[nativeEventName] = opt;
        addEventListener(scope.domTarget, nativeEventName, listener, opt);
    }
    function unmountDOMEventListeners(scope) {
        var mounted = scope.mounted;
        for (var nativeEventName in mounted) {
            if (mounted.hasOwnProperty(nativeEventName)) {
                removeEventListener(scope.domTarget, nativeEventName, mounted[nativeEventName], scope.listenerOpts[nativeEventName]);
            }
        }
        scope.mounted = {};
    }
    var DOMHandlerScope = /** @class */ (function () {
        function DOMHandlerScope(domTarget, domHandlers) {
            // Key: eventName, value: mounted handler funcitons.
            // Used for unmount.
            this.mounted = {};
            this.listenerOpts = {};
            this.touching = false;
            this.domTarget = domTarget;
            this.domHandlers = domHandlers;
        }
        return DOMHandlerScope;
    }());
    var HandlerDomProxy = /** @class */ (function (_super) {
        __extends(HandlerDomProxy, _super);
        function HandlerDomProxy(dom, painterRoot) {
            var _this = _super.call(this) || this;
            // See [DRAG_OUTSIDE] in `Handler.ts`.
            _this.__pointerCapturing = false;
            _this.dom = dom;
            _this.painterRoot = painterRoot;
            _this._localHandlerScope = new DOMHandlerScope(dom, localDOMHandlers);
            if (globalEventSupported) {
                _this._globalHandlerScope = new DOMHandlerScope(document, globalDOMHandlers);
            }
            mountLocalDOMEventListeners(_this, _this._localHandlerScope);
            return _this;
        }
        HandlerDomProxy.prototype.dispose = function () {
            unmountDOMEventListeners(this._localHandlerScope);
            if (globalEventSupported) {
                unmountDOMEventListeners(this._globalHandlerScope);
            }
        };
        HandlerDomProxy.prototype.setCursor = function (cursorStyle) {
            this.dom.style && (this.dom.style.cursor = cursorStyle || 'default');
        };
        /**
         * See [DRAG_OUTSIDE] in `Handler.js`.
         * @implement
         * @param isPointerCapturing Should never be `null`/`undefined`.
         *        `true`: start to capture pointer if it is not capturing.
         *        `false`: end the capture if it is capturing.
         */
        HandlerDomProxy.prototype.__togglePointerCapture = function (isPointerCapturing) {
            this.__mayPointerCapture = null;
            if (globalEventSupported
                && ((+this.__pointerCapturing) ^ (+isPointerCapturing))) {
                this.__pointerCapturing = isPointerCapturing;
                var globalHandlerScope = this._globalHandlerScope;
                isPointerCapturing
                    ? mountGlobalDOMEventListeners(this, globalHandlerScope)
                    : unmountDOMEventListeners(globalHandlerScope);
            }
        };
        return HandlerDomProxy;
    }(Eventful));

    var dpr = 1;
    // If in browser environment
    if (typeof window !== 'undefined') {
        dpr = Math.max(window.devicePixelRatio
            || (window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI)
            || 1, 1);
    }
    // retina 屏幕优化
    var devicePixelRatio = dpr;
    /**
     * Determine when to turn on dark mode based on the luminance of backgroundColor
     */
    var DARK_MODE_THRESHOLD = 0.4;
    /**
     * Color of default dark label.
     */
    var DARK_LABEL_COLOR = '#333';
    /**
     * Color of default light label.
     */
    var LIGHT_LABEL_COLOR = '#ccc';
    /**
     * Color of default light label.
     */
    var LIGHTER_LABEL_COLOR = '#eee';

    /**
     * 3x2矩阵操作类
     * @exports zrender/tool/matrix
     */
    /**
     * Create a identity matrix.
     */
    function create() {
        return [1, 0, 0, 1, 0, 0];
    }
    /**
     * 设置矩阵为单位矩阵
     */
    function identity(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = 0;
        out[5] = 0;
        return out;
    }
    /**
     * 复制矩阵
     */
    function copy(out, m) {
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = m[3];
        out[4] = m[4];
        out[5] = m[5];
        return out;
    }
    /**
     * 矩阵相乘
     */
    function mul(out, m1, m2) {
        // Consider matrix.mul(m, m2, m);
        // where out is the same as m2.
        // So use temp constiable to escape error.
        var out0 = m1[0] * m2[0] + m1[2] * m2[1];
        var out1 = m1[1] * m2[0] + m1[3] * m2[1];
        var out2 = m1[0] * m2[2] + m1[2] * m2[3];
        var out3 = m1[1] * m2[2] + m1[3] * m2[3];
        var out4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
        var out5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
        out[0] = out0;
        out[1] = out1;
        out[2] = out2;
        out[3] = out3;
        out[4] = out4;
        out[5] = out5;
        return out;
    }
    /**
     * 平移变换
     */
    function translate(out, a, v) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4] + v[0];
        out[5] = a[5] + v[1];
        return out;
    }
    /**
     * 旋转变换
     */
    function rotate(out, a, rad) {
        var aa = a[0];
        var ac = a[2];
        var atx = a[4];
        var ab = a[1];
        var ad = a[3];
        var aty = a[5];
        var st = Math.sin(rad);
        var ct = Math.cos(rad);
        out[0] = aa * ct + ab * st;
        out[1] = -aa * st + ab * ct;
        out[2] = ac * ct + ad * st;
        out[3] = -ac * st + ct * ad;
        out[4] = ct * atx + st * aty;
        out[5] = ct * aty - st * atx;
        return out;
    }
    /**
     * 缩放变换
     */
    function scale(out, a, v) {
        var vx = v[0];
        var vy = v[1];
        out[0] = a[0] * vx;
        out[1] = a[1] * vy;
        out[2] = a[2] * vx;
        out[3] = a[3] * vy;
        out[4] = a[4] * vx;
        out[5] = a[5] * vy;
        return out;
    }
    /**
     * 求逆矩阵
     */
    function invert(out, a) {
        var aa = a[0];
        var ac = a[2];
        var atx = a[4];
        var ab = a[1];
        var ad = a[3];
        var aty = a[5];
        var det = aa * ad - ab * ac;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = ad * det;
        out[1] = -ab * det;
        out[2] = -ac * det;
        out[3] = aa * det;
        out[4] = (ac * aty - ad * atx) * det;
        out[5] = (ab * atx - aa * aty) * det;
        return out;
    }

    var mIdentity = identity;
    var EPSILON$2 = 5e-5;
    function isNotAroundZero$1(val) {
        return val > EPSILON$2 || val < -EPSILON$2;
    }
    var scaleTmp = [];
    var tmpTransform = [];
    var originTransform = create();
    var abs = Math.abs;
    var Transformable = /** @class */ (function () {
        function Transformable() {
        }
        /**
         * Get computed local transform
         */
        Transformable.prototype.getLocalTransform = function (m) {
            return Transformable.getLocalTransform(this, m);
        };
        /**
         * Set position from array
         */
        Transformable.prototype.setPosition = function (arr) {
            this.x = arr[0];
            this.y = arr[1];
        };
        /**
         * Set scale from array
         */
        Transformable.prototype.setScale = function (arr) {
            this.scaleX = arr[0];
            this.scaleY = arr[1];
        };
        /**
         * Set skew from array
         */
        Transformable.prototype.setSkew = function (arr) {
            this.skewX = arr[0];
            this.skewY = arr[1];
        };
        /**
         * Set origin from array
         */
        Transformable.prototype.setOrigin = function (arr) {
            this.originX = arr[0];
            this.originY = arr[1];
        };
        /**
         * If needs to compute transform
         */
        Transformable.prototype.needLocalTransform = function () {
            return isNotAroundZero$1(this.rotation)
                || isNotAroundZero$1(this.x)
                || isNotAroundZero$1(this.y)
                || isNotAroundZero$1(this.scaleX - 1)
                || isNotAroundZero$1(this.scaleY - 1);
        };
        /**
         * Update global transform
         */
        Transformable.prototype.updateTransform = function () {
            var parentTransform = this.parent && this.parent.transform;
            var needLocalTransform = this.needLocalTransform();
            var m = this.transform;
            if (!(needLocalTransform || parentTransform)) {
                m && mIdentity(m);
                return;
            }
            m = m || create();
            if (needLocalTransform) {
                this.getLocalTransform(m);
            }
            else {
                mIdentity(m);
            }
            // 应用父节点变换
            if (parentTransform) {
                if (needLocalTransform) {
                    mul(m, parentTransform, m);
                }
                else {
                    copy(m, parentTransform);
                }
            }
            // 保存这个变换矩阵
            this.transform = m;
            this._resolveGlobalScaleRatio(m);
        };
        Transformable.prototype._resolveGlobalScaleRatio = function (m) {
            var globalScaleRatio = this.globalScaleRatio;
            if (globalScaleRatio != null && globalScaleRatio !== 1) {
                this.getGlobalScale(scaleTmp);
                var relX = scaleTmp[0] < 0 ? -1 : 1;
                var relY = scaleTmp[1] < 0 ? -1 : 1;
                var sx = ((scaleTmp[0] - relX) * globalScaleRatio + relX) / scaleTmp[0] || 0;
                var sy = ((scaleTmp[1] - relY) * globalScaleRatio + relY) / scaleTmp[1] || 0;
                m[0] *= sx;
                m[1] *= sx;
                m[2] *= sy;
                m[3] *= sy;
            }
            this.invTransform = this.invTransform || create();
            invert(this.invTransform, m);
        };
        /**
         * Get computed global transform
         * NOTE: this method will force update transform on all ancestors.
         * Please be aware of the potential performance cost.
         */
        Transformable.prototype.getComputedTransform = function () {
            var transformNode = this;
            var ancestors = [];
            while (transformNode) {
                ancestors.push(transformNode);
                transformNode = transformNode.parent;
            }
            // Update from topdown.
            while (transformNode = ancestors.pop()) {
                transformNode.updateTransform();
            }
            return this.transform;
        };
        Transformable.prototype.setLocalTransform = function (m) {
            if (!m) {
                // TODO return or set identity?
                return;
            }
            var sx = m[0] * m[0] + m[1] * m[1];
            var sy = m[2] * m[2] + m[3] * m[3];
            var rotation = Math.atan2(m[1], m[0]);
            var shearX = Math.PI / 2 + rotation - Math.atan2(m[3], m[2]);
            sy = Math.sqrt(sy) * Math.cos(shearX);
            sx = Math.sqrt(sx);
            this.skewX = shearX;
            this.skewY = 0;
            this.rotation = -rotation;
            this.x = +m[4];
            this.y = +m[5];
            this.scaleX = sx;
            this.scaleY = sy;
            this.originX = 0;
            this.originY = 0;
        };
        /**
         * 分解`transform`矩阵到`position`, `rotation`, `scale`
         */
        Transformable.prototype.decomposeTransform = function () {
            if (!this.transform) {
                return;
            }
            var parent = this.parent;
            var m = this.transform;
            if (parent && parent.transform) {
                // Get local transform and decompose them to position, scale, rotation
                mul(tmpTransform, parent.invTransform, m);
                m = tmpTransform;
            }
            var ox = this.originX;
            var oy = this.originY;
            if (ox || oy) {
                originTransform[4] = ox;
                originTransform[5] = oy;
                mul(tmpTransform, m, originTransform);
                tmpTransform[4] -= ox;
                tmpTransform[5] -= oy;
                m = tmpTransform;
            }
            this.setLocalTransform(m);
        };
        /**
         * Get global scale
         */
        Transformable.prototype.getGlobalScale = function (out) {
            var m = this.transform;
            out = out || [];
            if (!m) {
                out[0] = 1;
                out[1] = 1;
                return out;
            }
            out[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
            out[1] = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
            if (m[0] < 0) {
                out[0] = -out[0];
            }
            if (m[3] < 0) {
                out[1] = -out[1];
            }
            return out;
        };
        /**
         * 变换坐标位置到 shape 的局部坐标空间
         */
        Transformable.prototype.transformCoordToLocal = function (x, y) {
            var v2 = [x, y];
            var invTransform = this.invTransform;
            if (invTransform) {
                applyTransform(v2, v2, invTransform);
            }
            return v2;
        };
        /**
         * 变换局部坐标位置到全局坐标空间
         */
        Transformable.prototype.transformCoordToGlobal = function (x, y) {
            var v2 = [x, y];
            var transform = this.transform;
            if (transform) {
                applyTransform(v2, v2, transform);
            }
            return v2;
        };
        Transformable.prototype.getLineScale = function () {
            var m = this.transform;
            // Get the line scale.
            // Determinant of `m` means how much the area is enlarged by the
            // transformation. So its square root can be used as a scale factor
            // for width.
            return m && abs(m[0] - 1) > 1e-10 && abs(m[3] - 1) > 1e-10
                ? Math.sqrt(abs(m[0] * m[3] - m[2] * m[1]))
                : 1;
        };
        Transformable.prototype.copyTransform = function (source) {
            var target = this;
            for (var i = 0; i < TRANSFORMABLE_PROPS.length; i++) {
                var propName = TRANSFORMABLE_PROPS[i];
                target[propName] = source[propName];
            }
        };
        Transformable.getLocalTransform = function (target, m) {
            m = m || [];
            var ox = target.originX || 0;
            var oy = target.originY || 0;
            var sx = target.scaleX;
            var sy = target.scaleY;
            var rotation = target.rotation || 0;
            var x = target.x;
            var y = target.y;
            var skewX = target.skewX ? Math.tan(target.skewX) : 0;
            // TODO: zrender use different hand in coordinate system and y axis is inversed.
            var skewY = target.skewY ? Math.tan(-target.skewY) : 0;
            // The order of transform (-origin * scale * skew * rotate * origin * translate).
            // We merge (-origin * scale * skew) into one. Also did identity in these operations.
            // origin
            if (ox || oy) {
                m[4] = -ox * sx - skewX * oy * sy;
                m[5] = -oy * sy - skewY * ox * sx;
            }
            else {
                m[4] = m[5] = 0;
            }
            // scale
            m[0] = sx;
            m[3] = sy;
            // skew
            m[1] = skewY * sx;
            m[2] = skewX * sy;
            // Apply rotation
            rotation && rotate(m, m, rotation);
            // Translate back from origin and apply translation
            m[4] += ox + x;
            m[5] += oy + y;
            return m;
        };
        Transformable.initDefaultProps = (function () {
            var proto = Transformable.prototype;
            proto.x = 0;
            proto.y = 0;
            proto.scaleX = 1;
            proto.scaleY = 1;
            proto.originX = 0;
            proto.originY = 0;
            proto.skewX = 0;
            proto.skewY = 0;
            proto.rotation = 0;
            proto.globalScaleRatio = 1;
        })();
        return Transformable;
    }());
    var TRANSFORMABLE_PROPS = [
        'x', 'y', 'originX', 'originY', 'rotation', 'scaleX', 'scaleY', 'skewX', 'skewY'
    ];

    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        /**
         * Copy from another point
         */
        Point.prototype.copy = function (other) {
            this.x = other.x;
            this.y = other.y;
            return this;
        };
        /**
         * Clone a point
         */
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        /**
         * Set x and y
         */
        Point.prototype.set = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        /**
         * If equal to another point
         */
        Point.prototype.equal = function (other) {
            return other.x === this.x && other.y === this.y;
        };
        /**
         * Add another point
         */
        Point.prototype.add = function (other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        };
        Point.prototype.scale = function (scalar) {
            this.x *= scalar;
            this.y *= scalar;
        };
        Point.prototype.scaleAndAdd = function (other, scalar) {
            this.x += other.x * scalar;
            this.y += other.y * scalar;
        };
        /**
         * Sub another point
         */
        Point.prototype.sub = function (other) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        };
        /**
         * Dot product with other point
         */
        Point.prototype.dot = function (other) {
            return this.x * other.x + this.y * other.y;
        };
        /**
         * Get length of point
         */
        Point.prototype.len = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        /**
         * Get squared length
         */
        Point.prototype.lenSquare = function () {
            return this.x * this.x + this.y * this.y;
        };
        /**
         * Normalize
         */
        Point.prototype.normalize = function () {
            var len = this.len();
            this.x /= len;
            this.y /= len;
            return this;
        };
        /**
         * Distance to another point
         */
        Point.prototype.distance = function (other) {
            var dx = this.x - other.x;
            var dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        /**
         * Square distance to another point
         */
        Point.prototype.distanceSquare = function (other) {
            var dx = this.x - other.x;
            var dy = this.y - other.y;
            return dx * dx + dy * dy;
        };
        /**
         * Negate
         */
        Point.prototype.negate = function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        };
        /**
         * Apply a transform matrix array.
         */
        Point.prototype.transform = function (m) {
            if (!m) {
                return;
            }
            var x = this.x;
            var y = this.y;
            this.x = m[0] * x + m[2] * y + m[4];
            this.y = m[1] * x + m[3] * y + m[5];
            return this;
        };
        Point.prototype.toArray = function (out) {
            out[0] = this.x;
            out[1] = this.y;
            return out;
        };
        Point.prototype.fromArray = function (input) {
            this.x = input[0];
            this.y = input[1];
        };
        Point.set = function (p, x, y) {
            p.x = x;
            p.y = y;
        };
        Point.copy = function (p, p2) {
            p.x = p2.x;
            p.y = p2.y;
        };
        Point.len = function (p) {
            return Math.sqrt(p.x * p.x + p.y * p.y);
        };
        Point.lenSquare = function (p) {
            return p.x * p.x + p.y * p.y;
        };
        Point.dot = function (p0, p1) {
            return p0.x * p1.x + p0.y * p1.y;
        };
        Point.add = function (out, p0, p1) {
            out.x = p0.x + p1.x;
            out.y = p0.y + p1.y;
        };
        Point.sub = function (out, p0, p1) {
            out.x = p0.x - p1.x;
            out.y = p0.y - p1.y;
        };
        Point.scale = function (out, p0, scalar) {
            out.x = p0.x * scalar;
            out.y = p0.y * scalar;
        };
        Point.scaleAndAdd = function (out, p0, p1, scalar) {
            out.x = p0.x + p1.x * scalar;
            out.y = p0.y + p1.y * scalar;
        };
        Point.lerp = function (out, p0, p1, t) {
            var onet = 1 - t;
            out.x = onet * p0.x + t * p1.x;
            out.y = onet * p0.y + t * p1.y;
        };
        return Point;
    }());

    /**
     * @module echarts/core/BoundingRect
     */
    var mathMin$2 = Math.min;
    var mathMax$2 = Math.max;
    var lt = new Point();
    var rb = new Point();
    var lb = new Point();
    var rt = new Point();
    var minTv = new Point();
    var maxTv = new Point();
    var BoundingRect = /** @class */ (function () {
        function BoundingRect(x, y, width, height) {
            if (width < 0) {
                x = x + width;
                width = -width;
            }
            if (height < 0) {
                y = y + height;
                height = -height;
            }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        BoundingRect.prototype.union = function (other) {
            var x = mathMin$2(other.x, this.x);
            var y = mathMin$2(other.y, this.y);
            // If x is -Infinity and width is Infinity (like in the case of
            // IncrementalDisplayble), x + width would be NaN
            if (isFinite(this.x) && isFinite(this.width)) {
                this.width = mathMax$2(other.x + other.width, this.x + this.width) - x;
            }
            else {
                this.width = other.width;
            }
            if (isFinite(this.y) && isFinite(this.height)) {
                this.height = mathMax$2(other.y + other.height, this.y + this.height) - y;
            }
            else {
                this.height = other.height;
            }
            this.x = x;
            this.y = y;
        };
        BoundingRect.prototype.applyTransform = function (m) {
            BoundingRect.applyTransform(this, this, m);
        };
        BoundingRect.prototype.calculateTransform = function (b) {
            var a = this;
            var sx = b.width / a.width;
            var sy = b.height / a.height;
            var m = create();
            // 矩阵右乘
            translate(m, m, [-a.x, -a.y]);
            scale(m, m, [sx, sy]);
            translate(m, m, [b.x, b.y]);
            return m;
        };
        BoundingRect.prototype.intersect = function (b, mtv) {
            if (!b) {
                return false;
            }
            if (!(b instanceof BoundingRect)) {
                // Normalize negative width/height.
                b = BoundingRect.create(b);
            }
            var a = this;
            var ax0 = a.x;
            var ax1 = a.x + a.width;
            var ay0 = a.y;
            var ay1 = a.y + a.height;
            var bx0 = b.x;
            var bx1 = b.x + b.width;
            var by0 = b.y;
            var by1 = b.y + b.height;
            var overlap = !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
            if (mtv) {
                var dMin = Infinity;
                var dMax = 0;
                var d0 = Math.abs(ax1 - bx0);
                var d1 = Math.abs(bx1 - ax0);
                var d2 = Math.abs(ay1 - by0);
                var d3 = Math.abs(by1 - ay0);
                var dx = Math.min(d0, d1);
                var dy = Math.min(d2, d3);
                // On x axis
                if (ax1 < bx0 || bx1 < ax0) {
                    if (dx > dMax) {
                        dMax = dx;
                        if (d0 < d1) {
                            Point.set(maxTv, -d0, 0); // b is on the right
                        }
                        else {
                            Point.set(maxTv, d1, 0); // b is on the left
                        }
                    }
                }
                else {
                    if (dx < dMin) {
                        dMin = dx;
                        if (d0 < d1) {
                            Point.set(minTv, d0, 0); // b is on the right
                        }
                        else {
                            Point.set(minTv, -d1, 0); // b is on the left
                        }
                    }
                }
                // On y axis
                if (ay1 < by0 || by1 < ay0) {
                    if (dy > dMax) {
                        dMax = dy;
                        if (d2 < d3) {
                            Point.set(maxTv, 0, -d2); // b is on the bottom(larger y)
                        }
                        else {
                            Point.set(maxTv, 0, d3); // b is on the top(smaller y)
                        }
                    }
                }
                else {
                    if (dx < dMin) {
                        dMin = dx;
                        if (d2 < d3) {
                            Point.set(minTv, 0, d2); // b is on the bottom
                        }
                        else {
                            Point.set(minTv, 0, -d3); // b is on the top
                        }
                    }
                }
            }
            if (mtv) {
                Point.copy(mtv, overlap ? minTv : maxTv);
            }
            return overlap;
        };
        BoundingRect.prototype.contain = function (x, y) {
            var rect = this;
            return x >= rect.x
                && x <= (rect.x + rect.width)
                && y >= rect.y
                && y <= (rect.y + rect.height);
        };
        BoundingRect.prototype.clone = function () {
            return new BoundingRect(this.x, this.y, this.width, this.height);
        };
        /**
         * Copy from another rect
         */
        BoundingRect.prototype.copy = function (other) {
            BoundingRect.copy(this, other);
        };
        BoundingRect.prototype.plain = function () {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
        };
        /**
         * If not having NaN or Infinity with attributes
         */
        BoundingRect.prototype.isFinite = function () {
            return isFinite(this.x)
                && isFinite(this.y)
                && isFinite(this.width)
                && isFinite(this.height);
        };
        BoundingRect.prototype.isZero = function () {
            return this.width === 0 || this.height === 0;
        };
        BoundingRect.create = function (rect) {
            return new BoundingRect(rect.x, rect.y, rect.width, rect.height);
        };
        BoundingRect.copy = function (target, source) {
            target.x = source.x;
            target.y = source.y;
            target.width = source.width;
            target.height = source.height;
        };
        BoundingRect.applyTransform = function (target, source, m) {
            // In case usage like this
            // el.getBoundingRect().applyTransform(el.transform)
            // And element has no transform
            if (!m) {
                if (target !== source) {
                    BoundingRect.copy(target, source);
                }
                return;
            }
            // Fast path when there is no rotation in matrix.
            if (m[1] < 1e-5 && m[1] > -1e-5 && m[2] < 1e-5 && m[2] > -1e-5) {
                var sx = m[0];
                var sy = m[3];
                var tx = m[4];
                var ty = m[5];
                target.x = source.x * sx + tx;
                target.y = source.y * sy + ty;
                target.width = source.width * sx;
                target.height = source.height * sy;
                if (target.width < 0) {
                    target.x += target.width;
                    target.width = -target.width;
                }
                if (target.height < 0) {
                    target.y += target.height;
                    target.height = -target.height;
                }
                return;
            }
            // source and target can be same instance.
            lt.x = lb.x = source.x;
            lt.y = rt.y = source.y;
            rb.x = rt.x = source.x + source.width;
            rb.y = lb.y = source.y + source.height;
            lt.transform(m);
            rt.transform(m);
            rb.transform(m);
            lb.transform(m);
            target.x = mathMin$2(lt.x, rb.x, lb.x, rt.x);
            target.y = mathMin$2(lt.y, rb.y, lb.y, rt.y);
            var maxX = mathMax$2(lt.x, rb.x, lb.x, rt.x);
            var maxY = mathMax$2(lt.y, rb.y, lb.y, rt.y);
            target.width = maxX - target.x;
            target.height = maxY - target.y;
        };
        return BoundingRect;
    }());

    var textWidthCache = {};
    var DEFAULT_FONT = '12px sans-serif';
    var _ctx;
    var _cachedFont;
    function defaultMeasureText(text, font) {
        if (!_ctx) {
            _ctx = createCanvas().getContext('2d');
        }
        if (_cachedFont !== font) {
            _cachedFont = _ctx.font = font || DEFAULT_FONT;
        }
        return _ctx.measureText(text);
    }
    var methods = {
        measureText: defaultMeasureText
    };
    // let cacheMissCount = 0;
    // let totalCount = 0;
    function getWidth(text, font) {
        font = font || DEFAULT_FONT;
        var cacheOfFont = textWidthCache[font];
        if (!cacheOfFont) {
            cacheOfFont = textWidthCache[font] = new LRU(500);
        }
        var width = cacheOfFont.get(text);
        if (width == null) {
            width = methods.measureText(text, font).width;
            cacheOfFont.put(text, width);
            // cacheMissCount++;
        }
        // totalCount++;
        return width;
    }
    /**
     *
     * Get bounding rect for inner usage(TSpan)
     * Which not include text newline.
     */
    function innerGetBoundingRect(text, font, textAlign, textBaseline) {
        var width = getWidth(text, font);
        var height = getLineHeight(font);
        var x = adjustTextX(0, width, textAlign);
        var y = adjustTextY(0, height, textBaseline);
        var rect = new BoundingRect(x, y, width, height);
        return rect;
    }
    /**
     *
     * Get bounding rect for outer usage. Compatitable with old implementation
     * Which includes text newline.
     */
    function getBoundingRect(text, font, textAlign, textBaseline) {
        var textLines = ((text || '') + '').split('\n');
        var len = textLines.length;
        if (len === 1) {
            return innerGetBoundingRect(textLines[0], font, textAlign, textBaseline);
        }
        else {
            var uniondRect = new BoundingRect(0, 0, 0, 0);
            for (var i = 0; i < textLines.length; i++) {
                var rect = innerGetBoundingRect(textLines[i], font, textAlign, textBaseline);
                i === 0 ? uniondRect.copy(rect) : uniondRect.union(rect);
            }
            return uniondRect;
        }
    }
    function adjustTextX(x, width, textAlign) {
        // TODO Right to left language
        if (textAlign === 'right') {
            x -= width;
        }
        else if (textAlign === 'center') {
            x -= width / 2;
        }
        return x;
    }
    function adjustTextY(y, height, verticalAlign) {
        if (verticalAlign === 'middle') {
            y -= height / 2;
        }
        else if (verticalAlign === 'bottom') {
            y -= height;
        }
        return y;
    }
    function getLineHeight(font) {
        // FIXME A rough approach.
        return getWidth('国', font);
    }
    function parsePercent(value, maxValue) {
        if (typeof value === 'string') {
            if (value.lastIndexOf('%') >= 0) {
                return parseFloat(value) / 100 * maxValue;
            }
            return parseFloat(value);
        }
        return value;
    }
    /**
     * Follow same interface to `Displayable.prototype.calculateTextPosition`.
     * @public
     * @param out Prepared out object. If not input, auto created in the method.
     * @param style where `textPosition` and `textDistance` are visited.
     * @param rect {x, y, width, height} Rect of the host elment, according to which the text positioned.
     * @return The input `out`. Set: {x, y, textAlign, textVerticalAlign}
     */
    function calculateTextPosition(out, opts, rect) {
        var textPosition = opts.position || 'inside';
        var distance = opts.distance != null ? opts.distance : 5;
        var height = rect.height;
        var width = rect.width;
        var halfHeight = height / 2;
        var x = rect.x;
        var y = rect.y;
        var textAlign = 'left';
        var textVerticalAlign = 'top';
        if (textPosition instanceof Array) {
            x += parsePercent(textPosition[0], rect.width);
            y += parsePercent(textPosition[1], rect.height);
            // Not use textAlign / textVerticalAlign
            textAlign = null;
            textVerticalAlign = null;
        }
        else {
            switch (textPosition) {
                case 'left':
                    x -= distance;
                    y += halfHeight;
                    textAlign = 'right';
                    textVerticalAlign = 'middle';
                    break;
                case 'right':
                    x += distance + width;
                    y += halfHeight;
                    textVerticalAlign = 'middle';
                    break;
                case 'top':
                    x += width / 2;
                    y -= distance;
                    textAlign = 'center';
                    textVerticalAlign = 'bottom';
                    break;
                case 'bottom':
                    x += width / 2;
                    y += height + distance;
                    textAlign = 'center';
                    break;
                case 'inside':
                    x += width / 2;
                    y += halfHeight;
                    textAlign = 'center';
                    textVerticalAlign = 'middle';
                    break;
                case 'insideLeft':
                    x += distance;
                    y += halfHeight;
                    textVerticalAlign = 'middle';
                    break;
                case 'insideRight':
                    x += width - distance;
                    y += halfHeight;
                    textAlign = 'right';
                    textVerticalAlign = 'middle';
                    break;
                case 'insideTop':
                    x += width / 2;
                    y += distance;
                    textAlign = 'center';
                    break;
                case 'insideBottom':
                    x += width / 2;
                    y += height - distance;
                    textAlign = 'center';
                    textVerticalAlign = 'bottom';
                    break;
                case 'insideTopLeft':
                    x += distance;
                    y += distance;
                    break;
                case 'insideTopRight':
                    x += width - distance;
                    y += distance;
                    textAlign = 'right';
                    break;
                case 'insideBottomLeft':
                    x += distance;
                    y += height - distance;
                    textVerticalAlign = 'bottom';
                    break;
                case 'insideBottomRight':
                    x += width - distance;
                    y += height - distance;
                    textAlign = 'right';
                    textVerticalAlign = 'bottom';
                    break;
            }
        }
        out = out || {};
        out.x = x;
        out.y = y;
        out.align = textAlign;
        out.verticalAlign = textVerticalAlign;
        return out;
    }

    // Properties can be used in state.
    var PRESERVED_NORMAL_STATE = '__zr_normal__';
    // export const PRESERVED_MERGED_STATE = '__zr_merged__';
    var PRIMARY_STATES_KEYS$1 = ['x', 'y', 'scaleX', 'scaleY', 'originX', 'originY', 'rotation', 'ignore'];
    var DEFAULT_ANIMATABLE_MAP = {
        x: true,
        y: true,
        scaleX: true,
        scaleY: true,
        originX: true,
        originY: true,
        rotation: true,
        ignore: false
    };
    var tmpTextPosCalcRes = {};
    var tmpBoundingRect = new BoundingRect(0, 0, 0, 0);
    var Element = /** @class */ (function () {
        function Element(props) {
            this.id = guid();
            this.animators = [];
            this.currentStates = [];
            /**
             * Store of element state.
             * '__normal__' key is preserved for default properties.
             */
            this.states = {};
            this._init(props);
        }
        Element.prototype._init = function (props) {
            // Init default properties
            this.attr(props);
        };
        /**
         * Drift element
         * @param {number} dx dx on the global space
         * @param {number} dy dy on the global space
         */
        Element.prototype.drift = function (dx, dy, e) {
            switch (this.draggable) {
                case 'horizontal':
                    dy = 0;
                    break;
                case 'vertical':
                    dx = 0;
                    break;
            }
            var m = this.transform;
            if (!m) {
                m = this.transform = [1, 0, 0, 1, 0, 0];
            }
            m[4] += dx;
            m[5] += dy;
            this.decomposeTransform();
            this.markRedraw();
        };
        /**
         * Hook before update
         */
        Element.prototype.beforeUpdate = function () { };
        /**
         * Hook after update
         */
        Element.prototype.afterUpdate = function () { };
        /**
         * Update each frame
         */
        Element.prototype.update = function () {
            this.updateTransform();
            if (this.__dirty) {
                this.updateInnerText();
            }
        };
        Element.prototype.updateInnerText = function (forceUpdate) {
            // Update textContent
            var textEl = this._textContent;
            if (textEl && (!textEl.ignore || forceUpdate)) {
                if (!this.textConfig) {
                    this.textConfig = {};
                }
                var textConfig = this.textConfig;
                var isLocal = textConfig.local;
                var innerTransformable = textEl.innerTransformable;
                var textAlign = void 0;
                var textVerticalAlign = void 0;
                var textStyleChanged = false;
                // Apply host's transform.
                innerTransformable.parent = isLocal ? this : null;
                var innerOrigin = false;
                // Reset x/y/rotation
                innerTransformable.copyTransform(textEl);
                // Force set attached text's position if `position` is in config.
                if (textConfig.position != null) {
                    var layoutRect = tmpBoundingRect;
                    if (textConfig.layoutRect) {
                        layoutRect.copy(textConfig.layoutRect);
                    }
                    else {
                        layoutRect.copy(this.getBoundingRect());
                    }
                    if (!isLocal) {
                        layoutRect.applyTransform(this.transform);
                    }
                    if (this.calculateTextPosition) {
                        this.calculateTextPosition(tmpTextPosCalcRes, textConfig, layoutRect);
                    }
                    else {
                        calculateTextPosition(tmpTextPosCalcRes, textConfig, layoutRect);
                    }
                    // TODO Should modify back if textConfig.position is set to null again.
                    // Or textContent is detached.
                    innerTransformable.x = tmpTextPosCalcRes.x;
                    innerTransformable.y = tmpTextPosCalcRes.y;
                    // User specified align/verticalAlign has higher priority, which is
                    // useful in the case that attached text is rotated 90 degree.
                    textAlign = tmpTextPosCalcRes.align;
                    textVerticalAlign = tmpTextPosCalcRes.verticalAlign;
                    var textOrigin = textConfig.origin;
                    if (textOrigin && textConfig.rotation != null) {
                        var relOriginX = void 0;
                        var relOriginY = void 0;
                        if (textOrigin === 'center') {
                            relOriginX = layoutRect.width * 0.5;
                            relOriginY = layoutRect.height * 0.5;
                        }
                        else {
                            relOriginX = parsePercent(textOrigin[0], layoutRect.width);
                            relOriginY = parsePercent(textOrigin[1], layoutRect.height);
                        }
                        innerOrigin = true;
                        innerTransformable.originX = -innerTransformable.x + relOriginX + (isLocal ? 0 : layoutRect.x);
                        innerTransformable.originY = -innerTransformable.y + relOriginY + (isLocal ? 0 : layoutRect.y);
                    }
                }
                if (textConfig.rotation != null) {
                    innerTransformable.rotation = textConfig.rotation;
                }
                // TODO
                var textOffset = textConfig.offset;
                if (textOffset) {
                    innerTransformable.x += textOffset[0];
                    innerTransformable.y += textOffset[1];
                    // Not change the user set origin.
                    if (!innerOrigin) {
                        innerTransformable.originX = -textOffset[0];
                        innerTransformable.originY = -textOffset[1];
                    }
                }
                // Calculate text color
                var isInside = textConfig.inside == null // Force to be inside or not.
                    ? (typeof textConfig.position === 'string' && textConfig.position.indexOf('inside') >= 0)
                    : textConfig.inside;
                var innerTextDefaultStyle = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {});
                var textFill = void 0;
                var textStroke = void 0;
                var autoStroke = void 0;
                if (isInside && this.canBeInsideText()) {
                    // In most cases `textContent` need this "auto" strategy.
                    // So by default be 'auto'. Otherwise users need to literally
                    // set `insideFill: 'auto', insideStroke: 'auto'` each time.
                    textFill = textConfig.insideFill;
                    textStroke = textConfig.insideStroke;
                    if (textFill == null || textFill === 'auto') {
                        textFill = this.getInsideTextFill();
                    }
                    if (textStroke == null || textStroke === 'auto') {
                        textStroke = this.getInsideTextStroke(textFill);
                        autoStroke = true;
                    }
                }
                else {
                    textFill = textConfig.outsideFill;
                    textStroke = textConfig.outsideStroke;
                    if (textFill == null || textFill === 'auto') {
                        textFill = this.getOutsideFill();
                    }
                    // By default give a stroke to distinguish "front end" label with
                    // messy background (like other text label, line or other graphic).
                    // If textContent.style.fill specified, this auto stroke will not be used.
                    if (textStroke == null || textStroke === 'auto') {
                        // If some time need to customize the default stroke getter,
                        // add some kind of override method.
                        textStroke = this.getOutsideStroke(textFill);
                        autoStroke = true;
                    }
                }
                // Default `textFill` should must have a value to ensure text can be displayed.
                textFill = textFill || '#000';
                if (textFill !== innerTextDefaultStyle.fill
                    || textStroke !== innerTextDefaultStyle.stroke
                    || autoStroke !== innerTextDefaultStyle.autoStroke
                    || textAlign !== innerTextDefaultStyle.align
                    || textVerticalAlign !== innerTextDefaultStyle.verticalAlign) {
                    textStyleChanged = true;
                    innerTextDefaultStyle.fill = textFill;
                    innerTextDefaultStyle.stroke = textStroke;
                    innerTextDefaultStyle.autoStroke = autoStroke;
                    innerTextDefaultStyle.align = textAlign;
                    innerTextDefaultStyle.verticalAlign = textVerticalAlign;
                    textEl.setDefaultTextStyle(innerTextDefaultStyle);
                }
                // Mark textEl to update transform.
                // DON'T use markRedraw. It will cause Element itself to dirty again.
                textEl.__dirty |= REDRAW_BIT;
                if (textStyleChanged) {
                    // Only mark style dirty if necessary. Update ZRText is costly.
                    textEl.dirtyStyle(true);
                }
            }
        };
        Element.prototype.canBeInsideText = function () {
            return true;
        };
        Element.prototype.getInsideTextFill = function () {
            return '#fff';
        };
        Element.prototype.getInsideTextStroke = function (textFill) {
            return '#000';
        };
        Element.prototype.getOutsideFill = function () {
            return this.__zr && this.__zr.isDarkMode() ? LIGHT_LABEL_COLOR : DARK_LABEL_COLOR;
        };
        Element.prototype.getOutsideStroke = function (textFill) {
            var backgroundColor = this.__zr && this.__zr.getBackgroundColor();
            var colorArr = typeof backgroundColor === 'string' && parse(backgroundColor);
            if (!colorArr) {
                colorArr = [255, 255, 255, 1];
            }
            // Assume blending on a white / black(dark) background.
            var alpha = colorArr[3];
            var isDark = this.__zr.isDarkMode();
            for (var i = 0; i < 3; i++) {
                colorArr[i] = colorArr[i] * alpha + (isDark ? 0 : 255) * (1 - alpha);
            }
            colorArr[3] = 1;
            return stringify(colorArr, 'rgba');
        };
        Element.prototype.traverse = function (cb, context) { };
        Element.prototype.attrKV = function (key, value) {
            if (key === 'textConfig') {
                this.setTextConfig(value);
            }
            else if (key === 'textContent') {
                this.setTextContent(value);
            }
            else if (key === 'clipPath') {
                this.setClipPath(value);
            }
            else if (key === 'extra') {
                this.extra = this.extra || {};
                extend(this.extra, value);
            }
            else {
                this[key] = value;
            }
        };
        /**
         * Hide the element
         */
        Element.prototype.hide = function () {
            this.ignore = true;
            this.markRedraw();
        };
        /**
         * Show the element
         */
        Element.prototype.show = function () {
            this.ignore = false;
            this.markRedraw();
        };
        Element.prototype.attr = function (keyOrObj, value) {
            if (typeof keyOrObj === 'string') {
                this.attrKV(keyOrObj, value);
            }
            else if (isObject(keyOrObj)) {
                var obj = keyOrObj;
                var keysArr = keys(obj);
                for (var i = 0; i < keysArr.length; i++) {
                    var key = keysArr[i];
                    this.attrKV(key, keyOrObj[key]);
                }
            }
            this.markRedraw();
            return this;
        };
        // Save current state to normal
        Element.prototype.saveCurrentToNormalState = function (toState) {
            this._innerSaveToNormal(toState);
            // If we are switching from normal to other state during animation.
            // We need to save final value of animation to the normal state. Not interpolated value.
            var normalState = this._normalState;
            for (var i = 0; i < this.animators.length; i++) {
                var animator = this.animators[i];
                var fromStateTransition = animator.__fromStateTransition;
                // Ignore animation from state transition(except normal).
                if (fromStateTransition && fromStateTransition !== PRESERVED_NORMAL_STATE) {
                    continue;
                }
                var targetName = animator.targetName;
                // Respecting the order of animation if multiple animator is
                // animating on the same property(If additive animation is used)
                var target = targetName
                    ? normalState[targetName] : normalState;
                // Only save keys that are changed by the states.
                animator.saveFinalToTarget(target);
            }
        };
        Element.prototype._innerSaveToNormal = function (toState) {
            var normalState = this._normalState;
            if (!normalState) {
                // Clear previous stored normal states when switching from normalState to otherState.
                normalState = this._normalState = {};
            }
            if (toState.textConfig && !normalState.textConfig) {
                normalState.textConfig = this.textConfig;
            }
            this._savePrimaryToNormal(toState, normalState, PRIMARY_STATES_KEYS$1);
        };
        Element.prototype._savePrimaryToNormal = function (toState, normalState, primaryKeys) {
            for (var i = 0; i < primaryKeys.length; i++) {
                var key = primaryKeys[i];
                // Only save property that will be changed by toState
                // and has not been saved to normalState yet.
                if (toState[key] != null && !(key in normalState)) {
                    normalState[key] = this[key];
                }
            }
        };
        /**
         * If has any state.
         */
        Element.prototype.hasState = function () {
            return this.currentStates.length > 0;
        };
        /**
         * Get state object
         */
        Element.prototype.getState = function (name) {
            return this.states[name];
        };
        /**
         * Ensure state exists. If not, will create one and return.
         */
        Element.prototype.ensureState = function (name) {
            var states = this.states;
            if (!states[name]) {
                states[name] = {};
            }
            return states[name];
        };
        /**
         * Clear all states.
         */
        Element.prototype.clearStates = function (noAnimation) {
            this.useState(PRESERVED_NORMAL_STATE, false, noAnimation);
            // TODO set _normalState to null?
        };
        /**
         * Use state. State is a collection of properties.
         * Will return current state object if state exists and stateName has been changed.
         *
         * @param stateName State name to be switched to
         * @param keepCurrentState If keep current states.
         *      If not, it will inherit from the normal state.
         */
        Element.prototype.useState = function (stateName, keepCurrentStates, noAnimation, forceUseHoverLayer) {
            // Use preserved word __normal__
            // TODO: Only restore changed properties when restore to normal???
            var toNormalState = stateName === PRESERVED_NORMAL_STATE;
            var hasStates = this.hasState();
            if (!hasStates && toNormalState) {
                // If switched from normal to normal.
                return;
            }
            var currentStates = this.currentStates;
            var animationCfg = this.stateTransition;
            // No need to change in following cases:
            // 1. Keep current states. and already being applied before.
            // 2. Don't keep current states. And new state is same with the only one exists state.
            if (indexOf(currentStates, stateName) >= 0 && (keepCurrentStates || currentStates.length === 1)) {
                return;
            }
            var state;
            if (this.stateProxy && !toNormalState) {
                state = this.stateProxy(stateName);
            }
            if (!state) {
                state = (this.states && this.states[stateName]);
            }
            if (!state && !toNormalState) {
                logError("State " + stateName + " not exists.");
                return;
            }
            if (!toNormalState) {
                this.saveCurrentToNormalState(state);
            }
            var useHoverLayer = !!((state && state.hoverLayer) || forceUseHoverLayer);
            if (useHoverLayer) {
                // Enter hover layer before states update.
                this._toggleHoverLayerFlag(true);
            }
            this._applyStateObj(stateName, state, this._normalState, keepCurrentStates, !noAnimation && !this.__inHover && animationCfg && animationCfg.duration > 0, animationCfg);
            // Also set text content.
            var textContent = this._textContent;
            var textGuide = this._textGuide;
            if (textContent) {
                // Force textContent use hover layer if self is using it.
                textContent.useState(stateName, keepCurrentStates, noAnimation, useHoverLayer);
            }
            if (textGuide) {
                textGuide.useState(stateName, keepCurrentStates, noAnimation, useHoverLayer);
            }
            if (toNormalState) {
                // Clear state
                this.currentStates = [];
                // Reset normal state.
                this._normalState = {};
            }
            else {
                if (!keepCurrentStates) {
                    this.currentStates = [stateName];
                }
                else {
                    this.currentStates.push(stateName);
                }
            }
            // Update animating target to the new object after state changed.
            this._updateAnimationTargets();
            this.markRedraw();
            if (!useHoverLayer && this.__inHover) {
                // Leave hover layer after states update and markRedraw.
                this._toggleHoverLayerFlag(false);
                // NOTE: avoid unexpected refresh when moving out from hover layer!!
                // Only clear from hover layer.
                this.__dirty &= ~REDRAW_BIT;
            }
            // Return used state.
            return state;
        };
        /**
         * Apply multiple states.
         * @param states States list.
         */
        Element.prototype.useStates = function (states, noAnimation, forceUseHoverLayer) {
            if (!states.length) {
                this.clearStates();
            }
            else {
                var stateObjects = [];
                var currentStates = this.currentStates;
                var len = states.length;
                var notChange = len === currentStates.length;
                if (notChange) {
                    for (var i = 0; i < len; i++) {
                        if (states[i] !== currentStates[i]) {
                            notChange = false;
                            break;
                        }
                    }
                }
                if (notChange) {
                    return;
                }
                for (var i = 0; i < len; i++) {
                    var stateName = states[i];
                    var stateObj = void 0;
                    if (this.stateProxy) {
                        stateObj = this.stateProxy(stateName, states);
                    }
                    if (!stateObj) {
                        stateObj = this.states[stateName];
                    }
                    if (stateObj) {
                        stateObjects.push(stateObj);
                    }
                }
                var lastStateObj = stateObjects[len - 1];
                var useHoverLayer = !!((lastStateObj && lastStateObj.hoverLayer) || forceUseHoverLayer);
                if (useHoverLayer) {
                    // Enter hover layer before states update.
                    this._toggleHoverLayerFlag(true);
                }
                var mergedState = this._mergeStates(stateObjects);
                var animationCfg = this.stateTransition;
                this.saveCurrentToNormalState(mergedState);
                this._applyStateObj(states.join(','), mergedState, this._normalState, false, !noAnimation && !this.__inHover && animationCfg && animationCfg.duration > 0, animationCfg);
                var textContent = this._textContent;
                var textGuide = this._textGuide;
                if (textContent) {
                    textContent.useStates(states, noAnimation, useHoverLayer);
                }
                if (textGuide) {
                    textGuide.useStates(states, noAnimation, useHoverLayer);
                }
                this._updateAnimationTargets();
                // Create a copy
                this.currentStates = states.slice();
                this.markRedraw();
                if (!useHoverLayer && this.__inHover) {
                    // Leave hover layer after states update and markRedraw.
                    this._toggleHoverLayerFlag(false);
                    // NOTE: avoid unexpected refresh when moving out from hover layer!!
                    // Only clear from hover layer.
                    this.__dirty &= ~REDRAW_BIT;
                }
            }
        };
        /**
         * Update animation targets when reference is changed.
         */
        Element.prototype._updateAnimationTargets = function () {
            for (var i = 0; i < this.animators.length; i++) {
                var animator = this.animators[i];
                if (animator.targetName) {
                    animator.changeTarget(this[animator.targetName]);
                }
            }
        };
        /**
         * Remove state
         * @param state State to remove
         */
        Element.prototype.removeState = function (state) {
            var idx = indexOf(this.currentStates, state);
            if (idx >= 0) {
                var currentStates = this.currentStates.slice();
                currentStates.splice(idx, 1);
                this.useStates(currentStates);
            }
        };
        /**
         * Replace exists state.
         * @param oldState
         * @param newState
         * @param forceAdd If still add when even if replaced target not exists.
         */
        Element.prototype.replaceState = function (oldState, newState, forceAdd) {
            var currentStates = this.currentStates.slice();
            var idx = indexOf(currentStates, oldState);
            var newStateExists = indexOf(currentStates, newState) >= 0;
            if (idx >= 0) {
                if (!newStateExists) {
                    // Replace the old with the new one.
                    currentStates[idx] = newState;
                }
                else {
                    // Only remove the old one.
                    currentStates.splice(idx, 1);
                }
            }
            else if (forceAdd && !newStateExists) {
                currentStates.push(newState);
            }
            this.useStates(currentStates);
        };
        /**
         * Toogle state.
         */
        Element.prototype.toggleState = function (state, enable) {
            if (enable) {
                this.useState(state, true);
            }
            else {
                this.removeState(state);
            }
        };
        Element.prototype._mergeStates = function (states) {
            var mergedState = {};
            var mergedTextConfig;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                extend(mergedState, state);
                if (state.textConfig) {
                    mergedTextConfig = mergedTextConfig || {};
                    extend(mergedTextConfig, state.textConfig);
                }
            }
            if (mergedTextConfig) {
                mergedState.textConfig = mergedTextConfig;
            }
            return mergedState;
        };
        Element.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
            var needsRestoreToNormal = !(state && keepCurrentStates);
            // TODO: Save current state to normal?
            // TODO: Animation
            if (state && state.textConfig) {
                // Inherit from current state or normal state.
                this.textConfig = extend({}, keepCurrentStates ? this.textConfig : normalState.textConfig);
                extend(this.textConfig, state.textConfig);
            }
            else if (needsRestoreToNormal) {
                if (normalState.textConfig) { // Only restore if changed and saved.
                    this.textConfig = normalState.textConfig;
                }
            }
            var transitionTarget = {};
            var hasTransition = false;
            for (var i = 0; i < PRIMARY_STATES_KEYS$1.length; i++) {
                var key = PRIMARY_STATES_KEYS$1[i];
                var propNeedsTransition = transition && DEFAULT_ANIMATABLE_MAP[key];
                if (state && state[key] != null) {
                    if (propNeedsTransition) {
                        hasTransition = true;
                        transitionTarget[key] = state[key];
                    }
                    else {
                        // Replace if it exist in target state
                        this[key] = state[key];
                    }
                }
                else if (needsRestoreToNormal) {
                    if (normalState[key] != null) {
                        if (propNeedsTransition) {
                            hasTransition = true;
                            transitionTarget[key] = normalState[key];
                        }
                        else {
                            // Restore to normal state
                            this[key] = normalState[key];
                        }
                    }
                }
            }
            if (!transition) {
                // Keep the running animation to the new values after states changed.
                // Not simply stop animation. Or it may have jump effect.
                for (var i = 0; i < this.animators.length; i++) {
                    var animator = this.animators[i];
                    var targetName = animator.targetName;
                    animator.__changeFinalValue(targetName
                        ? (state || normalState)[targetName]
                        : (state || normalState));
                }
            }
            if (hasTransition) {
                this._transitionState(stateName, transitionTarget, animationCfg);
            }
        };
        /**
         * Component is some elements attached on this element for specific purpose.
         * Like clipPath, textContent
         */
        Element.prototype._attachComponent = function (componentEl) {
            if (componentEl.__zr && !componentEl.__hostTarget) {
                throw new Error('Text element has been added to zrender.');
            }
            if (componentEl === this) {
                throw new Error('Recursive component attachment.');
            }
            var zr = this.__zr;
            if (zr) {
                // Needs to add self to zrender. For rerender triggering, or animation.
                componentEl.addSelfToZr(zr);
            }
            componentEl.__zr = zr;
            componentEl.__hostTarget = this;
        };
        Element.prototype._detachComponent = function (componentEl) {
            if (componentEl.__zr) {
                componentEl.removeSelfFromZr(componentEl.__zr);
            }
            componentEl.__zr = null;
            componentEl.__hostTarget = null;
        };
        /**
         * Get clip path
         */
        Element.prototype.getClipPath = function () {
            return this._clipPath;
        };
        /**
         * Set clip path
         *
         * clipPath can't be shared between two elements.
         */
        Element.prototype.setClipPath = function (clipPath) {
            // Remove previous clip path
            if (this._clipPath && this._clipPath !== clipPath) {
                this.removeClipPath();
            }
            this._attachComponent(clipPath);
            this._clipPath = clipPath;
            this.markRedraw();
        };
        /**
         * Remove clip path
         */
        Element.prototype.removeClipPath = function () {
            var clipPath = this._clipPath;
            if (clipPath) {
                this._detachComponent(clipPath);
                this._clipPath = null;
                this.markRedraw();
            }
        };
        /**
         * Get attached text content.
         */
        Element.prototype.getTextContent = function () {
            return this._textContent;
        };
        /**
         * Attach text on element
         */
        Element.prototype.setTextContent = function (textEl) {
            var previousTextContent = this._textContent;
            if (previousTextContent === textEl) {
                return;
            }
            // Remove previous textContent
            if (previousTextContent && previousTextContent !== textEl) {
                this.removeTextContent();
            }
            if (textEl.__zr && !textEl.__hostTarget) {
                throw new Error('Text element has been added to zrender.');
            }
            textEl.innerTransformable = new Transformable();
            this._attachComponent(textEl);
            this._textContent = textEl;
            this.markRedraw();
        };
        /**
         * Set layout of attached text. Will merge with the previous.
         */
        Element.prototype.setTextConfig = function (cfg) {
            // TODO hide cfg property?
            if (!this.textConfig) {
                this.textConfig = {};
            }
            extend(this.textConfig, cfg);
            this.markRedraw();
        };
        /**
         * Remove text config
         */
        Element.prototype.removeTextConfig = function () {
            this.textConfig = null;
            this.markRedraw();
        };
        /**
         * Remove attached text element.
         */
        Element.prototype.removeTextContent = function () {
            var textEl = this._textContent;
            if (textEl) {
                textEl.innerTransformable = null;
                this._detachComponent(textEl);
                this._textContent = null;
                this._innerTextDefaultStyle = null;
                this.markRedraw();
            }
        };
        Element.prototype.getTextGuideLine = function () {
            return this._textGuide;
        };
        Element.prototype.setTextGuideLine = function (guideLine) {
            // Remove previous clip path
            if (this._textGuide && this._textGuide !== guideLine) {
                this.removeTextGuideLine();
            }
            this._attachComponent(guideLine);
            this._textGuide = guideLine;
            this.markRedraw();
        };
        Element.prototype.removeTextGuideLine = function () {
            var textGuide = this._textGuide;
            if (textGuide) {
                this._detachComponent(textGuide);
                this._textGuide = null;
                this.markRedraw();
            }
        };
        /**
         * Mark element needs to be repainted
         */
        Element.prototype.markRedraw = function () {
            this.__dirty |= REDRAW_BIT;
            var zr = this.__zr;
            if (zr) {
                if (this.__inHover) {
                    zr.refreshHover();
                }
                else {
                    zr.refresh();
                }
            }
            // Used as a clipPath or textContent
            if (this.__hostTarget) {
                this.__hostTarget.markRedraw();
            }
        };
        /**
         * Besides marking elements to be refreshed.
         * It will also invalid all cache and doing recalculate next frame.
         */
        Element.prototype.dirty = function () {
            this.markRedraw();
        };
        Element.prototype._toggleHoverLayerFlag = function (inHover) {
            this.__inHover = inHover;
            var textContent = this._textContent;
            var textGuide = this._textGuide;
            if (textContent) {
                textContent.__inHover = inHover;
            }
            if (textGuide) {
                textGuide.__inHover = inHover;
            }
        };
        /**
         * Add self from zrender instance.
         * Not recursively because it will be invoked when element added to storage.
         */
        Element.prototype.addSelfToZr = function (zr) {
            if (this.__zr === zr) {
                return;
            }
            this.__zr = zr;
            // 添加动画
            var animators = this.animators;
            if (animators) {
                for (var i = 0; i < animators.length; i++) {
                    zr.animation.addAnimator(animators[i]);
                }
            }
            if (this._clipPath) {
                this._clipPath.addSelfToZr(zr);
            }
            if (this._textContent) {
                this._textContent.addSelfToZr(zr);
            }
            if (this._textGuide) {
                this._textGuide.addSelfToZr(zr);
            }
        };
        /**
         * Remove self from zrender instance.
         * Not recursively because it will be invoked when element added to storage.
         */
        Element.prototype.removeSelfFromZr = function (zr) {
            if (!this.__zr) {
                return;
            }
            this.__zr = null;
            // Remove animation
            var animators = this.animators;
            if (animators) {
                for (var i = 0; i < animators.length; i++) {
                    zr.animation.removeAnimator(animators[i]);
                }
            }
            if (this._clipPath) {
                this._clipPath.removeSelfFromZr(zr);
            }
            if (this._textContent) {
                this._textContent.removeSelfFromZr(zr);
            }
            if (this._textGuide) {
                this._textGuide.removeSelfFromZr(zr);
            }
        };
        /**
         * 动画
         *
         * @param path The key to fetch value from object. Mostly style or shape.
         * @param loop Whether to loop animation.
         * @example:
         *     el.animate('style', false)
         *         .when(1000, {x: 10} )
         *         .done(function(){ // Animation done })
         *         .start()
         */
        Element.prototype.animate = function (key, loop) {
            var target = key ? this[key] : this;
            if (!target) {
                logError('Property "'
                    + key
                    + '" is not existed in element '
                    + this.id);
                return;
            }
            var animator = new Animator(target, loop);
            this.addAnimator(animator, key);
            return animator;
        };
        Element.prototype.addAnimator = function (animator, key) {
            var zr = this.__zr;
            var el = this;
            animator.during(function () {
                el.updateDuringAnimation(key);
            }).done(function () {
                var animators = el.animators;
                // FIXME Animator will not be removed if use `Animator#stop` to stop animation
                var idx = indexOf(animators, animator);
                if (idx >= 0) {
                    animators.splice(idx, 1);
                }
            });
            this.animators.push(animator);
            // If animate after added to the zrender
            if (zr) {
                zr.animation.addAnimator(animator);
            }
            // Wake up zrender to start the animation loop.
            zr && zr.wakeUp();
        };
        Element.prototype.updateDuringAnimation = function (key) {
            this.markRedraw();
        };
        /**
         * 停止动画
         * @param {boolean} forwardToLast If move to last frame before stop
         */
        Element.prototype.stopAnimation = function (scope, forwardToLast) {
            var animators = this.animators;
            var len = animators.length;
            var leftAnimators = [];
            for (var i = 0; i < len; i++) {
                var animator = animators[i];
                if (!scope || scope === animator.scope) {
                    animator.stop(forwardToLast);
                }
                else {
                    leftAnimators.push(animator);
                }
            }
            this.animators = leftAnimators;
            return this;
        };
        /**
         * @param animationProps A map to specify which property to animate. If not specified, will animate all.
         * @example
         *  // Animate position
         *  el.animateTo({
         *      position: [10, 10]
         *  }, { done: () => { // done } })
         *
         *  // Animate shape, style and position in 100ms, delayed 100ms, with cubicOut easing
         *  el.animateTo({
         *      shape: {
         *          width: 500
         *      },
         *      style: {
         *          fill: 'red'
         *      }
         *      position: [10, 10]
         *  }, {
         *      duration: 100,
         *      delay: 100,
         *      easing: 'cubicOut',
         *      done: () => { // done }
         *  })
         */
        Element.prototype.animateTo = function (target, cfg, animationProps) {
            animateTo(this, target, cfg, animationProps);
        };
        /**
         * Animate from the target state to current state.
         * The params and the value are the same as `this.animateTo`.
         */
        // Overload definitions
        Element.prototype.animateFrom = function (target, cfg, animationProps) {
            animateTo(this, target, cfg, animationProps, true);
        };
        Element.prototype._transitionState = function (stateName, target, cfg, animationProps) {
            var animators = animateTo(this, target, cfg, animationProps);
            for (var i = 0; i < animators.length; i++) {
                animators[i].__fromStateTransition = stateName;
            }
        };
        /**
         * Interface of getting the minimum bounding box.
         */
        Element.prototype.getBoundingRect = function () {
            return null;
        };
        Element.prototype.getPaintRect = function () {
            return null;
        };
        Element.initDefaultProps = (function () {
            var elProto = Element.prototype;
            elProto.type = 'element';
            elProto.name = '';
            elProto.ignore = false;
            elProto.silent = false;
            elProto.isGroup = false;
            elProto.draggable = false;
            elProto.dragging = false;
            elProto.ignoreClip = false;
            elProto.__inHover = false;
            elProto.__dirty = REDRAW_BIT;
            var logs = {};
            function logDeprecatedError(key, xKey, yKey) {
                if (!logs[key + xKey + yKey]) {
                    console.warn("DEPRECATED: '" + key + "' has been deprecated. use '" + xKey + "', '" + yKey + "' instead");
                    logs[key + xKey + yKey] = true;
                }
            }
            // Legacy transform properties. position and scale
            function createLegacyProperty(key, privateKey, xKey, yKey) {
                Object.defineProperty(elProto, key, {
                    get: function () {
                        logDeprecatedError(key, xKey, yKey);
                        if (!this[privateKey]) {
                            var pos = this[privateKey] = [];
                            enhanceArray(this, pos);
                        }
                        return this[privateKey];
                    },
                    set: function (pos) {
                        logDeprecatedError(key, xKey, yKey);
                        this[xKey] = pos[0];
                        this[yKey] = pos[1];
                        this[privateKey] = pos;
                        enhanceArray(this, pos);
                    }
                });
                function enhanceArray(self, pos) {
                    Object.defineProperty(pos, 0, {
                        get: function () {
                            return self[xKey];
                        },
                        set: function (val) {
                            self[xKey] = val;
                        }
                    });
                    Object.defineProperty(pos, 1, {
                        get: function () {
                            return self[yKey];
                        },
                        set: function (val) {
                            self[yKey] = val;
                        }
                    });
                }
            }
            if (Object.defineProperty && (!env.browser.ie || env.browser.version > 8)) {
                createLegacyProperty('position', '_legacyPos', 'x', 'y');
                createLegacyProperty('scale', '_legacyScale', 'scaleX', 'scaleY');
                createLegacyProperty('origin', '_legacyOrigin', 'originX', 'originY');
            }
        })();
        return Element;
    }());
    mixin(Element, Eventful);
    mixin(Element, Transformable);
    function animateTo(animatable, target, cfg, animationProps, reverse) {
        cfg = cfg || {};
        var animators = [];
        animateToShallow(animatable, '', animatable, target, cfg, animationProps, animators, reverse);
        var finishCount = animators.length;
        var doneHappened = false;
        var cfgDone = cfg.done;
        var cfgAborted = cfg.aborted;
        var doneCb = function () {
            doneHappened = true;
            finishCount--;
            if (finishCount <= 0) {
                doneHappened
                    ? (cfgDone && cfgDone())
                    : (cfgAborted && cfgAborted());
            }
        };
        var abortedCb = function () {
            finishCount--;
            if (finishCount <= 0) {
                doneHappened
                    ? (cfgDone && cfgDone())
                    : (cfgAborted && cfgAborted());
            }
        };
        // No animators. This should be checked before animators[i].start(),
        // because 'done' may be executed immediately if no need to animate.
        if (!finishCount) {
            cfgDone && cfgDone();
        }
        // Adding during callback to the first animator
        if (animators.length > 0 && cfg.during) {
            // TODO If there are two animators in animateTo, and the first one is stopped by other animator.
            animators[0].during(function (target, percent) {
                cfg.during(percent);
            });
        }
        // Start after all animators created
        // Incase any animator is done immediately when all animation properties are not changed
        for (var i = 0; i < animators.length; i++) {
            var animator = animators[i];
            if (doneCb) {
                animator.done(doneCb);
            }
            if (abortedCb) {
                animator.aborted(abortedCb);
            }
            animator.start(cfg.easing, cfg.force);
        }
        return animators;
    }
    function copyArrShallow(source, target, len) {
        for (var i = 0; i < len; i++) {
            source[i] = target[i];
        }
    }
    function is2DArray(value) {
        return isArrayLike(value[0]);
    }
    function copyValue(target, source, key) {
        if (isArrayLike(source[key])) {
            if (!isArrayLike(target[key])) {
                target[key] = [];
            }
            if (isTypedArray(source[key])) {
                var len = source[key].length;
                if (target[key].length !== len) {
                    target[key] = new (source[key].constructor)(len);
                    copyArrShallow(target[key], source[key], len);
                }
            }
            else {
                var sourceArr = source[key];
                var targetArr = target[key];
                var len0 = sourceArr.length;
                if (is2DArray(sourceArr)) {
                    // NOTE: each item should have same length
                    var len1 = sourceArr[0].length;
                    for (var i = 0; i < len0; i++) {
                        if (!targetArr[i]) {
                            targetArr[i] = Array.prototype.slice.call(sourceArr[i]);
                        }
                        else {
                            copyArrShallow(targetArr[i], sourceArr[i], len1);
                        }
                    }
                }
                else {
                    copyArrShallow(targetArr, sourceArr, len0);
                }
                targetArr.length = sourceArr.length;
            }
        }
        else {
            target[key] = source[key];
        }
    }
    function animateToShallow(animatable, topKey, source, target, cfg, animationProps, animators, reverse // If `true`, animate from the `target` to current state.
    ) {
        var animatableKeys = [];
        var changedKeys = [];
        var targetKeys = keys(target);
        var duration = cfg.duration;
        var delay = cfg.delay;
        var additive = cfg.additive;
        var setToFinal = cfg.setToFinal;
        var animateAll = !isObject(animationProps);
        for (var k = 0; k < targetKeys.length; k++) {
            var innerKey = targetKeys[k];
            if (source[innerKey] != null
                && target[innerKey] != null // Can't animate between null value. assign directly. For example. stroke animate from #fff to null.
                && (animateAll || animationProps[innerKey])) {
                if (isObject(target[innerKey]) && !isArrayLike(target[innerKey])) {
                    if (topKey) {
                        // logError('Only support 1 depth nest object animation.');
                        // Assign directly.
                        // TODO richText?
                        if (!reverse) {
                            source[innerKey] = target[innerKey];
                            animatable.updateDuringAnimation(topKey);
                        }
                        continue;
                    }
                    animateToShallow(animatable, innerKey, source[innerKey], target[innerKey], cfg, animationProps && animationProps[innerKey], animators, reverse);
                }
                else {
                    animatableKeys.push(innerKey);
                    changedKeys.push(innerKey);
                }
            }
            else if (!reverse) {
                // Assign target value directly.
                source[innerKey] = target[innerKey];
                animatable.updateDuringAnimation(topKey);
                // Previous animation will be stopped on the changed keys.
                // So direct assign is also included.
                changedKeys.push(innerKey);
            }
        }
        var keyLen = animatableKeys.length;
        if (keyLen > 0
            // cfg.force is mainly for keep invoking onframe and ondone callback even if animation is not necessary.
            // So if there is already has animators. There is no need to create another animator if not necessary.
            // Or it will always add one more with empty target.
            || (cfg.force && !animators.length)) {
            // Find last animator animating same prop.
            var existsAnimators = animatable.animators;
            var existsAnimatorsOnSameTarget = [];
            for (var i = 0; i < existsAnimators.length; i++) {
                // Use key string instead object reference because ref may be changed.
                if (existsAnimators[i].targetName === topKey) {
                    existsAnimatorsOnSameTarget.push(existsAnimators[i]);
                }
            }
            if (!additive && existsAnimatorsOnSameTarget.length) {
                // Stop exists animation on specific tracks. Only one animator available for each property.
                // TODO Should invoke previous animation callback?
                for (var i = 0; i < existsAnimatorsOnSameTarget.length; i++) {
                    var allAborted = existsAnimatorsOnSameTarget[i].stopTracks(changedKeys);
                    if (allAborted) { // This animator can't be used.
                        var idx = indexOf(existsAnimators, existsAnimatorsOnSameTarget[i]);
                        existsAnimators.splice(idx, 1);
                    }
                }
            }
            var revertedSource = void 0;
            var reversedTarget = void 0;
            var sourceClone = void 0;
            if (reverse) {
                reversedTarget = {};
                if (setToFinal) {
                    revertedSource = {};
                }
                for (var i = 0; i < keyLen; i++) {
                    var innerKey = animatableKeys[i];
                    reversedTarget[innerKey] = source[innerKey];
                    if (setToFinal) {
                        revertedSource[innerKey] = target[innerKey];
                    }
                    else {
                        // The usage of "animateFrom" expects that the element props has been updated dirctly to
                        // "final" values outside, and input the "from" values here (i.e., in variable `target` here).
                        // So here we assign the "from" values directly to element here (rather that in the next frame)
                        // to prevent the "final" values from being read in any other places (like other running
                        // animator during callbacks).
                        // But if `setToFinal: true` this feature can not be satisfied.
                        source[innerKey] = target[innerKey];
                    }
                }
            }
            else if (setToFinal) {
                sourceClone = {};
                for (var i = 0; i < keyLen; i++) {
                    var innerKey = animatableKeys[i];
                    // NOTE: Must clone source after the stopTracks. The property may be modified in stopTracks.
                    sourceClone[innerKey] = cloneValue(source[innerKey]);
                    // Use copy, not change the original reference
                    // Copy from target to source.
                    copyValue(source, target, innerKey);
                }
            }
            var animator = new Animator(source, false, additive ? existsAnimatorsOnSameTarget : null);
            animator.targetName = topKey;
            if (cfg.scope) {
                animator.scope = cfg.scope;
            }
            if (setToFinal && revertedSource) {
                animator.whenWithKeys(0, revertedSource, animatableKeys);
            }
            if (sourceClone) {
                animator.whenWithKeys(0, sourceClone, animatableKeys);
            }
            animator.whenWithKeys(duration == null ? 500 : duration, reverse ? reversedTarget : target, animatableKeys).delay(delay || 0);
            animatable.addAnimator(animator, topKey);
            animators.push(animator);
        }
    }

    /**
     * Group是一个容器，可以插入子节点，Group的变换也会被应用到子节点上
     * @module zrender/graphic/Group
     * @example
     *     const Group = require('zrender/graphic/Group');
     *     const Circle = require('zrender/graphic/shape/Circle');
     *     const g = new Group();
     *     g.position[0] = 100;
     *     g.position[1] = 100;
     *     g.add(new Circle({
     *         style: {
     *             x: 100,
     *             y: 100,
     *             r: 20,
     *         }
     *     }));
     *     zr.add(g);
     */
    var Group = /** @class */ (function (_super) {
        __extends(Group, _super);
        function Group(opts) {
            var _this = _super.call(this) || this;
            _this.isGroup = true;
            _this._children = [];
            _this.attr(opts);
            return _this;
        }
        /**
         * Get children reference.
         */
        Group.prototype.childrenRef = function () {
            return this._children;
        };
        /**
         * Get children copy.
         */
        Group.prototype.children = function () {
            return this._children.slice();
        };
        /**
         * 获取指定 index 的儿子节点
         */
        Group.prototype.childAt = function (idx) {
            return this._children[idx];
        };
        /**
         * 获取指定名字的儿子节点
         */
        Group.prototype.childOfName = function (name) {
            var children = this._children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].name === name) {
                    return children[i];
                }
            }
        };
        Group.prototype.childCount = function () {
            return this._children.length;
        };
        /**
         * 添加子节点到最后
         */
        Group.prototype.add = function (child) {
            if (child) {
                if (child !== this && child.parent !== this) {
                    this._children.push(child);
                    this._doAdd(child);
                }
                if (child.__hostTarget) {
                    throw 'This elemenet has been used as an attachment';
                }
            }
            return this;
        };
        /**
         * 添加子节点在 nextSibling 之前
         */
        Group.prototype.addBefore = function (child, nextSibling) {
            if (child && child !== this && child.parent !== this
                && nextSibling && nextSibling.parent === this) {
                var children = this._children;
                var idx = children.indexOf(nextSibling);
                if (idx >= 0) {
                    children.splice(idx, 0, child);
                    this._doAdd(child);
                }
            }
            return this;
        };
        Group.prototype.replace = function (oldChild, newChild) {
            var idx = indexOf(this._children, oldChild);
            if (idx >= 0) {
                this.replaceAt(newChild, idx);
            }
            return this;
        };
        Group.prototype.replaceAt = function (child, index) {
            var children = this._children;
            var old = children[index];
            if (child && child !== this && child.parent !== this && child !== old) {
                children[index] = child;
                old.parent = null;
                var zr = this.__zr;
                if (zr) {
                    old.removeSelfFromZr(zr);
                }
                this._doAdd(child);
            }
            return this;
        };
        Group.prototype._doAdd = function (child) {
            if (child.parent) {
                // Parent must be a group
                child.parent.remove(child);
            }
            child.parent = this;
            var zr = this.__zr;
            if (zr && zr !== child.__zr) { // Only group has __storage
                child.addSelfToZr(zr);
            }
            zr && zr.refresh();
        };
        /**
         * Remove child
         * @param child
         */
        Group.prototype.remove = function (child) {
            var zr = this.__zr;
            var children = this._children;
            var idx = indexOf(children, child);
            if (idx < 0) {
                return this;
            }
            children.splice(idx, 1);
            child.parent = null;
            if (zr) {
                child.removeSelfFromZr(zr);
            }
            zr && zr.refresh();
            return this;
        };
        /**
         * Remove all children
         */
        Group.prototype.removeAll = function () {
            var children = this._children;
            var zr = this.__zr;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (zr) {
                    child.removeSelfFromZr(zr);
                }
                child.parent = null;
            }
            children.length = 0;
            return this;
        };
        /**
         * 遍历所有子节点
         */
        Group.prototype.eachChild = function (cb, context) {
            var children = this._children;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                cb.call(context, child, i);
            }
            return this;
        };
        /**
         * Visit all descendants.
         * Return false in callback to stop visit descendants of current node
         */
        // TODO Group itself should also invoke the callback.
        Group.prototype.traverse = function (cb, context) {
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                var stopped = cb.call(context, child);
                if (child.isGroup && !stopped) {
                    child.traverse(cb, context);
                }
            }
            return this;
        };
        Group.prototype.addSelfToZr = function (zr) {
            _super.prototype.addSelfToZr.call(this, zr);
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                child.addSelfToZr(zr);
            }
        };
        Group.prototype.removeSelfFromZr = function (zr) {
            _super.prototype.removeSelfFromZr.call(this, zr);
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                child.removeSelfFromZr(zr);
            }
        };
        Group.prototype.getBoundingRect = function (includeChildren) {
            // TODO Caching
            var tmpRect = new BoundingRect(0, 0, 0, 0);
            var children = includeChildren || this._children;
            var tmpMat = [];
            var rect = null;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                // TODO invisible?
                if (child.ignore || child.invisible) {
                    continue;
                }
                var childRect = child.getBoundingRect();
                var transform = child.getLocalTransform(tmpMat);
                // TODO
                // The boundingRect cacluated by transforming original
                // rect may be bigger than the actual bundingRect when rotation
                // is used. (Consider a circle rotated aginst its center, where
                // the actual boundingRect should be the same as that not be
                // rotated.) But we can not find better approach to calculate
                // actual boundingRect yet, considering performance.
                if (transform) {
                    BoundingRect.applyTransform(tmpRect, childRect, transform);
                    rect = rect || tmpRect.clone();
                    rect.union(tmpRect);
                }
                else {
                    rect = rect || childRect.clone();
                    rect.union(childRect);
                }
            }
            return rect || tmpRect;
        };
        return Group;
    }(Element));
    Group.prototype.type = 'group';

    /*!
    * ZRender, a high performance 2d drawing library.
    *
    * Copyright (c) 2013, Baidu Inc.
    * All rights reserved.
    *
    * LICENSE
    * https://github.com/ecomfe/zrender/blob/master/LICENSE.txt
    */
    var useVML = !env.canvasSupported;
    var painterCtors = {};
    var instances = {};
    function delInstance(id) {
        delete instances[id];
    }
    function isDarkMode(backgroundColor) {
        if (!backgroundColor) {
            return false;
        }
        if (typeof backgroundColor === 'string') {
            return lum(backgroundColor, 1) < DARK_MODE_THRESHOLD;
        }
        else if (backgroundColor.colorStops) {
            var colorStops = backgroundColor.colorStops;
            var totalLum = 0;
            var len = colorStops.length;
            // Simply do the math of average the color. Not consider the offset
            for (var i = 0; i < len; i++) {
                totalLum += lum(colorStops[i].color, 1);
            }
            totalLum /= len;
            return totalLum < DARK_MODE_THRESHOLD;
        }
        // Can't determine
        return false;
    }
    var ZRender = /** @class */ (function () {
        function ZRender(id, dom, opts) {
            var _this = this;
            this._sleepAfterStill = 10;
            this._stillFrameAccum = 0;
            this._needsRefresh = true;
            this._needsRefreshHover = true;
            /**
             * If theme is dark mode. It will determine the color strategy for labels.
             */
            this._darkMode = false;
            opts = opts || {};
            /**
             * @type {HTMLDomElement}
             */
            this.dom = dom;
            this.id = id;
            var storage = new Storage();
            var rendererType = opts.renderer || 'canvas';
            // TODO WebGL
            if (useVML) {
                throw new Error('IE8 support has been dropped since 5.0');
            }
            if (!painterCtors[rendererType]) {
                // Use the first registered renderer.
                rendererType = keys(painterCtors)[0];
            }
            if (!painterCtors[rendererType]) {
                throw new Error("Renderer '" + rendererType + "' is not imported. Please import it first.");
            }
            opts.useDirtyRect = opts.useDirtyRect == null
                ? false
                : opts.useDirtyRect;
            var painter = new painterCtors[rendererType](dom, storage, opts, id);
            this.storage = storage;
            this.painter = painter;
            var handerProxy = (!env.node && !env.worker)
                ? new HandlerDomProxy(painter.getViewportRoot(), painter.root)
                : null;
            this.handler = new Handler(storage, painter, handerProxy, painter.root);
            this.animation = new Animation({
                stage: {
                    update: function () { return _this._flush(true); }
                }
            });
            this.animation.start();
        }
        /**
         * 添加元素
         */
        ZRender.prototype.add = function (el) {
            if (!el) {
                return;
            }
            this.storage.addRoot(el);
            el.addSelfToZr(this);
            this.refresh();
        };
        /**
         * 删除元素
         */
        ZRender.prototype.remove = function (el) {
            if (!el) {
                return;
            }
            this.storage.delRoot(el);
            el.removeSelfFromZr(this);
            this.refresh();
        };
        /**
         * Change configuration of layer
        */
        ZRender.prototype.configLayer = function (zLevel, config) {
            if (this.painter.configLayer) {
                this.painter.configLayer(zLevel, config);
            }
            this.refresh();
        };
        /**
         * Set background color
         */
        ZRender.prototype.setBackgroundColor = function (backgroundColor) {
            if (this.painter.setBackgroundColor) {
                this.painter.setBackgroundColor(backgroundColor);
            }
            this.refresh();
            this._backgroundColor = backgroundColor;
            this._darkMode = isDarkMode(backgroundColor);
        };
        ZRender.prototype.getBackgroundColor = function () {
            return this._backgroundColor;
        };
        /**
         * Force to set dark mode
         */
        ZRender.prototype.setDarkMode = function (darkMode) {
            this._darkMode = darkMode;
        };
        ZRender.prototype.isDarkMode = function () {
            return this._darkMode;
        };
        /**
         * Repaint the canvas immediately
         */
        ZRender.prototype.refreshImmediately = function (fromInside) {
            // const start = new Date();
            if (!fromInside) {
                // Update animation if refreshImmediately is invoked from outside.
                // Not trigger stage update to call flush again. Which may refresh twice
                this.animation.update(true);
            }
            // Clear needsRefresh ahead to avoid something wrong happens in refresh
            // Or it will cause zrender refreshes again and again.
            this._needsRefresh = false;
            this.painter.refresh();
            // Avoid trigger zr.refresh in Element#beforeUpdate hook
            this._needsRefresh = false;
            // const end = new Date();
            // const log = document.getElementById('log');
            // if (log) {
            //     log.innerHTML = log.innerHTML + '<br>' + (end - start);
            // }
        };
        /**
         * Mark and repaint the canvas in the next frame of browser
         */
        ZRender.prototype.refresh = function () {
            this._needsRefresh = true;
            // Active the animation again.
            this.animation.start();
        };
        /**
         * Perform all refresh
         */
        ZRender.prototype.flush = function () {
            this._flush(false);
        };
        ZRender.prototype._flush = function (fromInside) {
            var triggerRendered;
            var start = new Date().getTime();
            if (this._needsRefresh) {
                triggerRendered = true;
                this.refreshImmediately(fromInside);
            }
            if (this._needsRefreshHover) {
                triggerRendered = true;
                this.refreshHoverImmediately();
            }
            var end = new Date().getTime();
            if (triggerRendered) {
                this._stillFrameAccum = 0;
                this.trigger('rendered', {
                    elapsedTime: end - start
                });
            }
            else if (this._sleepAfterStill > 0) {
                this._stillFrameAccum++;
                // Stop the animiation after still for 10 frames.
                if (this._stillFrameAccum > this._sleepAfterStill) {
                    this.animation.stop();
                }
            }
        };
        /**
         * Set sleep after still for frames.
         * Disable auto sleep when it's 0.
         */
        ZRender.prototype.setSleepAfterStill = function (stillFramesCount) {
            this._sleepAfterStill = stillFramesCount;
        };
        /**
         * Wake up animation loop. But not render.
         */
        ZRender.prototype.wakeUp = function () {
            this.animation.start();
            // Reset the frame count.
            this._stillFrameAccum = 0;
        };
        /**
         * Add element to hover layer
         */
        ZRender.prototype.addHover = function (el) {
            // deprecated.
        };
        /**
         * Add element from hover layer
         */
        ZRender.prototype.removeHover = function (el) {
            // deprecated.
        };
        /**
         * Clear all hover elements in hover layer
         */
        ZRender.prototype.clearHover = function () {
            // deprecated.
        };
        /**
         * Refresh hover in next frame
         */
        ZRender.prototype.refreshHover = function () {
            this._needsRefreshHover = true;
        };
        /**
         * Refresh hover immediately
         */
        ZRender.prototype.refreshHoverImmediately = function () {
            this._needsRefreshHover = false;
            if (this.painter.refreshHover && this.painter.getType() === 'canvas') {
                this.painter.refreshHover();
            }
        };
        /**
         * Resize the canvas.
         * Should be invoked when container size is changed
         */
        ZRender.prototype.resize = function (opts) {
            opts = opts || {};
            this.painter.resize(opts.width, opts.height);
            this.handler.resize();
        };
        /**
         * Stop and clear all animation immediately
         */
        ZRender.prototype.clearAnimation = function () {
            this.animation.clear();
        };
        /**
         * Get container width
         */
        ZRender.prototype.getWidth = function () {
            return this.painter.getWidth();
        };
        /**
         * Get container height
         */
        ZRender.prototype.getHeight = function () {
            return this.painter.getHeight();
        };
        /**
         * Export the canvas as Base64 URL
         * @param {string} type
         * @param {string} [backgroundColor='#fff']
         * @return {string} Base64 URL
         */
        // toDataURL: function(type, backgroundColor) {
        //     return this.painter.getRenderedCanvas({
        //         backgroundColor: backgroundColor
        //     }).toDataURL(type);
        // },
        /**
         * Converting a path to image.
         * It has much better performance of drawing image rather than drawing a vector path.
         */
        ZRender.prototype.pathToImage = function (e, dpr) {
            if (this.painter.pathToImage) {
                return this.painter.pathToImage(e, dpr);
            }
        };
        /**
         * Set default cursor
         * @param cursorStyle='default' 例如 crosshair
         */
        ZRender.prototype.setCursorStyle = function (cursorStyle) {
            this.handler.setCursorStyle(cursorStyle);
        };
        /**
         * Find hovered element
         * @param x
         * @param y
         * @return {target, topTarget}
         */
        ZRender.prototype.findHover = function (x, y) {
            return this.handler.findHover(x, y);
        };
        // eslint-disable-next-line max-len
        ZRender.prototype.on = function (eventName, eventHandler, context) {
            this.handler.on(eventName, eventHandler, context);
            return this;
        };
        /**
         * Unbind event
         * @param eventName Event name
         * @param eventHandler Handler function
         */
        // eslint-disable-next-line max-len
        ZRender.prototype.off = function (eventName, eventHandler) {
            this.handler.off(eventName, eventHandler);
        };
        /**
         * Trigger event manually
         *
         * @param eventName Event name
         * @param event Event object
         */
        ZRender.prototype.trigger = function (eventName, event) {
            this.handler.trigger(eventName, event);
        };
        /**
         * Clear all objects and the canvas.
         */
        ZRender.prototype.clear = function () {
            var roots = this.storage.getRoots();
            for (var i = 0; i < roots.length; i++) {
                if (roots[i] instanceof Group) {
                    roots[i].removeSelfFromZr(this);
                }
            }
            this.storage.delAllRoots();
            this.painter.clear();
        };
        /**
         * Dispose self.
         */
        ZRender.prototype.dispose = function () {
            this.animation.stop();
            this.clear();
            this.storage.dispose();
            this.painter.dispose();
            this.handler.dispose();
            this.animation =
                this.storage =
                    this.painter =
                        this.handler = null;
            delInstance(this.id);
        };
        return ZRender;
    }());
    /**
     * Initializing a zrender instance
     */
    function init(dom, opts) {
        var zr = new ZRender(guid(), dom, opts);
        instances[zr.id] = zr;
        return zr;
    }
    function registerPainter(name, Ctor) {
        painterCtors[name] = Ctor;
    }

    function createLinearGradient(ctx, obj, rect) {
        var x = obj.x == null ? 0 : obj.x;
        var x2 = obj.x2 == null ? 1 : obj.x2;
        var y = obj.y == null ? 0 : obj.y;
        var y2 = obj.y2 == null ? 0 : obj.y2;
        if (!obj.global) {
            x = x * rect.width + rect.x;
            x2 = x2 * rect.width + rect.x;
            y = y * rect.height + rect.y;
            y2 = y2 * rect.height + rect.y;
        }
        // Fix NaN when rect is Infinity
        x = isNaN(x) ? 0 : x;
        x2 = isNaN(x2) ? 1 : x2;
        y = isNaN(y) ? 0 : y;
        y2 = isNaN(y2) ? 0 : y2;
        var canvasGradient = ctx.createLinearGradient(x, y, x2, y2);
        return canvasGradient;
    }
    function createRadialGradient(ctx, obj, rect) {
        var width = rect.width;
        var height = rect.height;
        var min = Math.min(width, height);
        var x = obj.x == null ? 0.5 : obj.x;
        var y = obj.y == null ? 0.5 : obj.y;
        var r = obj.r == null ? 0.5 : obj.r;
        if (!obj.global) {
            x = x * width + rect.x;
            y = y * height + rect.y;
            r = r * min;
        }
        var canvasGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        return canvasGradient;
    }
    function getCanvasGradient(ctx, obj, rect) {
        // TODO Cache?
        var canvasGradient = obj.type === 'radial'
            ? createRadialGradient(ctx, obj, rect)
            : createLinearGradient(ctx, obj, rect);
        var colorStops = obj.colorStops;
        for (var i = 0; i < colorStops.length; i++) {
            canvasGradient.addColorStop(colorStops[i].offset, colorStops[i].color);
        }
        return canvasGradient;
    }
    function isClipPathChanged(clipPaths, prevClipPaths) {
        // displayable.__clipPaths can only be `null`/`undefined` or an non-empty array.
        if (clipPaths === prevClipPaths || (!clipPaths && !prevClipPaths)) {
            return false;
        }
        if (!clipPaths || !prevClipPaths || (clipPaths.length !== prevClipPaths.length)) {
            return true;
        }
        for (var i = 0; i < clipPaths.length; i++) {
            if (clipPaths[i] !== prevClipPaths[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Base class of all displayable graphic objects
     */
    // type CalculateTextPositionResult = ReturnType<typeof calculateTextPosition>
    var STYLE_MAGIC_KEY = '__zr_style_' + Math.round((Math.random() * 10));
    var DEFAULT_COMMON_STYLE = {
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: '#000',
        opacity: 1,
        blend: 'source-over'
    };
    var DEFAULT_COMMON_ANIMATION_PROPS = {
        style: {
            shadowBlur: true,
            shadowOffsetX: true,
            shadowOffsetY: true,
            shadowColor: true,
            opacity: true
        }
    };
    DEFAULT_COMMON_STYLE[STYLE_MAGIC_KEY] = true;
    var PRIMARY_STATES_KEYS = ['z', 'z2', 'invisible'];
    var PRIMARY_STATES_KEYS_IN_HOVER_LAYER = ['invisible'];
    var Displayable = /** @class */ (function (_super) {
        __extends(Displayable, _super);
        function Displayable(props) {
            return _super.call(this, props) || this;
        }
        Displayable.prototype._init = function (props) {
            // Init default properties
            var keysArr = keys(props);
            for (var i = 0; i < keysArr.length; i++) {
                var key = keysArr[i];
                if (key === 'style') {
                    this.useStyle(props[key]);
                }
                else {
                    _super.prototype.attrKV.call(this, key, props[key]);
                }
            }
            // Give a empty style
            if (!this.style) {
                this.useStyle({});
            }
        };
        // Hook provided to developers.
        Displayable.prototype.beforeBrush = function () { };
        Displayable.prototype.afterBrush = function () { };
        // Hook provided to inherited classes.
        // Executed between beforeBrush / afterBrush
        Displayable.prototype.innerBeforeBrush = function () { };
        Displayable.prototype.innerAfterBrush = function () { };
        Displayable.prototype.shouldBePainted = function (viewWidth, viewHeight, considerClipPath, considerAncestors) {
            var m = this.transform;
            if (this.ignore
                // Ignore invisible element
                || this.invisible
                // Ignore transparent element
                || this.style.opacity === 0
                // Ignore culled element
                || (this.culling
                    && isDisplayableCulled(this, viewWidth, viewHeight))
                // Ignore scale 0 element, in some environment like node-canvas
                // Draw a scale 0 element can cause all following draw wrong
                // And setTransform with scale 0 will cause set back transform failed.
                || (m && !m[0] && !m[3])) {
                return false;
            }
            if (considerClipPath && this.__clipPaths) {
                for (var i = 0; i < this.__clipPaths.length; ++i) {
                    if (this.__clipPaths[i].isZeroArea()) {
                        return false;
                    }
                }
            }
            if (considerAncestors && this.parent) {
                var parent_1 = this.parent;
                while (parent_1) {
                    if (parent_1.ignore) {
                        return false;
                    }
                    parent_1 = parent_1.parent;
                }
            }
            return true;
        };
        /**
         * If displayable element contain coord x, y
         */
        Displayable.prototype.contain = function (x, y) {
            return this.rectContain(x, y);
        };
        Displayable.prototype.traverse = function (cb, context) {
            cb.call(context, this);
        };
        /**
         * If bounding rect of element contain coord x, y
         */
        Displayable.prototype.rectContain = function (x, y) {
            var coord = this.transformCoordToLocal(x, y);
            var rect = this.getBoundingRect();
            return rect.contain(coord[0], coord[1]);
        };
        Displayable.prototype.getPaintRect = function () {
            var rect = this._paintRect;
            if (!this._paintRect || this.__dirty) {
                var transform = this.transform;
                var elRect = this.getBoundingRect();
                var style = this.style;
                var shadowSize = style.shadowBlur || 0;
                var shadowOffsetX = style.shadowOffsetX || 0;
                var shadowOffsetY = style.shadowOffsetY || 0;
                rect = this._paintRect || (this._paintRect = new BoundingRect(0, 0, 0, 0));
                if (transform) {
                    BoundingRect.applyTransform(rect, elRect, transform);
                }
                else {
                    rect.copy(elRect);
                }
                if (shadowSize || shadowOffsetX || shadowOffsetY) {
                    rect.width += shadowSize * 2 + Math.abs(shadowOffsetX);
                    rect.height += shadowSize * 2 + Math.abs(shadowOffsetY);
                    rect.x = Math.min(rect.x, rect.x + shadowOffsetX - shadowSize);
                    rect.y = Math.min(rect.y, rect.y + shadowOffsetY - shadowSize);
                }
                // For the accuracy tolerance of text height or line joint point
                var tolerance = this.dirtyRectTolerance;
                if (!rect.isZero()) {
                    rect.x = Math.floor(rect.x - tolerance);
                    rect.y = Math.floor(rect.y - tolerance);
                    rect.width = Math.ceil(rect.width + 1 + tolerance * 2);
                    rect.height = Math.ceil(rect.height + 1 + tolerance * 2);
                }
            }
            return rect;
        };
        Displayable.prototype.setPrevPaintRect = function (paintRect) {
            if (paintRect) {
                this._prevPaintRect = this._prevPaintRect || new BoundingRect(0, 0, 0, 0);
                this._prevPaintRect.copy(paintRect);
            }
            else {
                this._prevPaintRect = null;
            }
        };
        Displayable.prototype.getPrevPaintRect = function () {
            return this._prevPaintRect;
        };
        /**
         * Alias for animate('style')
         * @param loop
         */
        Displayable.prototype.animateStyle = function (loop) {
            return this.animate('style', loop);
        };
        // Override updateDuringAnimation
        Displayable.prototype.updateDuringAnimation = function (targetKey) {
            if (targetKey === 'style') {
                this.dirtyStyle();
            }
            else {
                this.markRedraw();
            }
        };
        Displayable.prototype.attrKV = function (key, value) {
            if (key !== 'style') {
                _super.prototype.attrKV.call(this, key, value);
            }
            else {
                if (!this.style) {
                    this.useStyle(value);
                }
                else {
                    this.setStyle(value);
                }
            }
        };
        Displayable.prototype.setStyle = function (keyOrObj, value) {
            if (typeof keyOrObj === 'string') {
                this.style[keyOrObj] = value;
            }
            else {
                extend(this.style, keyOrObj);
            }
            this.dirtyStyle();
            return this;
        };
        // getDefaultStyleValue<T extends keyof Props['style']>(key: T): Props['style'][T] {
        //     // Default value is on the prototype.
        //     return this.style.prototype[key];
        // }
        Displayable.prototype.dirtyStyle = function (notRedraw) {
            if (!notRedraw) {
                this.markRedraw();
            }
            this.__dirty |= STYLE_CHANGED_BIT;
            // Clear bounding rect.
            if (this._rect) {
                this._rect = null;
            }
        };
        Displayable.prototype.dirty = function () {
            this.dirtyStyle();
        };
        /**
         * Is style changed. Used with dirtyStyle.
         */
        Displayable.prototype.styleChanged = function () {
            return !!(this.__dirty & STYLE_CHANGED_BIT);
        };
        /**
         * Mark style updated. Only useful when style is used for caching. Like in the text.
         */
        Displayable.prototype.styleUpdated = function () {
            this.__dirty &= ~STYLE_CHANGED_BIT;
        };
        /**
         * Create a style object with default values in it's prototype.
         */
        Displayable.prototype.createStyle = function (obj) {
            return createObject(DEFAULT_COMMON_STYLE, obj);
        };
        /**
         * Replace style property.
         * It will create a new style if given obj is not a valid style object.
         */
        // PENDING should not createStyle if it's an style object.
        Displayable.prototype.useStyle = function (obj) {
            if (!obj[STYLE_MAGIC_KEY]) {
                obj = this.createStyle(obj);
            }
            if (this.__inHover) {
                this.__hoverStyle = obj; // Not affect exists style.
            }
            else {
                this.style = obj;
            }
            this.dirtyStyle();
        };
        /**
         * Determine if an object is a valid style object.
         * Which means it is created by `createStyle.`
         *
         * A valid style object will have all default values in it's prototype.
         * To avoid get null/undefined values.
         */
        Displayable.prototype.isStyleObject = function (obj) {
            return obj[STYLE_MAGIC_KEY];
        };
        Displayable.prototype._innerSaveToNormal = function (toState) {
            _super.prototype._innerSaveToNormal.call(this, toState);
            var normalState = this._normalState;
            if (toState.style && !normalState.style) {
                // Clone style object.
                // TODO: Only save changed style.
                normalState.style = this._mergeStyle(this.createStyle(), this.style);
            }
            this._savePrimaryToNormal(toState, normalState, PRIMARY_STATES_KEYS);
        };
        Displayable.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
            _super.prototype._applyStateObj.call(this, stateName, state, normalState, keepCurrentStates, transition, animationCfg);
            var needsRestoreToNormal = !(state && keepCurrentStates);
            var targetStyle;
            if (state && state.style) {
                // Only animate changed properties.
                if (transition) {
                    if (keepCurrentStates) {
                        targetStyle = state.style;
                    }
                    else {
                        targetStyle = this._mergeStyle(this.createStyle(), normalState.style);
                        this._mergeStyle(targetStyle, state.style);
                    }
                }
                else {
                    targetStyle = this._mergeStyle(this.createStyle(), keepCurrentStates ? this.style : normalState.style);
                    this._mergeStyle(targetStyle, state.style);
                }
            }
            else if (needsRestoreToNormal) {
                targetStyle = normalState.style;
            }
            if (targetStyle) {
                if (transition) {
                    // Clone a new style. Not affect the original one.
                    var sourceStyle = this.style;
                    this.style = this.createStyle(needsRestoreToNormal ? {} : sourceStyle);
                    // const sourceStyle = this.style = this.createStyle(this.style);
                    if (needsRestoreToNormal) {
                        var changedKeys = keys(sourceStyle);
                        for (var i = 0; i < changedKeys.length; i++) {
                            var key = changedKeys[i];
                            if (key in targetStyle) { // Not use `key == null` because == null may means no stroke/fill.
                                // Pick out from prototype. Or the property won't be animated.
                                targetStyle[key] = targetStyle[key];
                                // Omit the property has no default value.
                                this.style[key] = sourceStyle[key];
                            }
                        }
                    }
                    // If states is switched twice in ONE FRAME, for example:
                    // one property(for example shadowBlur) changed from default value to a specifed value,
                    // then switched back in immediately. this.style may don't set this property yet when switching back.
                    // It won't treat it as an changed property when switching back. And it won't be animated.
                    // So here we make sure the properties will be animated from default value to a specifed value are set.
                    var targetKeys = keys(targetStyle);
                    for (var i = 0; i < targetKeys.length; i++) {
                        var key = targetKeys[i];
                        this.style[key] = this.style[key];
                    }
                    this._transitionState(stateName, {
                        style: targetStyle
                    }, animationCfg, this.getAnimationStyleProps());
                }
                else {
                    this.useStyle(targetStyle);
                }
            }
            // Don't change z, z2 for element moved into hover layer.
            // It's not necessary and will cause paint list order changed.
            var statesKeys = this.__inHover ? PRIMARY_STATES_KEYS_IN_HOVER_LAYER : PRIMARY_STATES_KEYS;
            for (var i = 0; i < statesKeys.length; i++) {
                var key = statesKeys[i];
                if (state && state[key] != null) {
                    // Replace if it exist in target state
                    this[key] = state[key];
                }
                else if (needsRestoreToNormal) {
                    // Restore to normal state
                    if (normalState[key] != null) {
                        this[key] = normalState[key];
                    }
                }
            }
        };
        Displayable.prototype._mergeStates = function (states) {
            var mergedState = _super.prototype._mergeStates.call(this, states);
            var mergedStyle;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state.style) {
                    mergedStyle = mergedStyle || {};
                    this._mergeStyle(mergedStyle, state.style);
                }
            }
            if (mergedStyle) {
                mergedState.style = mergedStyle;
            }
            return mergedState;
        };
        Displayable.prototype._mergeStyle = function (targetStyle, sourceStyle) {
            extend(targetStyle, sourceStyle);
            return targetStyle;
        };
        Displayable.prototype.getAnimationStyleProps = function () {
            return DEFAULT_COMMON_ANIMATION_PROPS;
        };
        /**
         * The string value of `textPosition` needs to be calculated to a real postion.
         * For example, `'inside'` is calculated to `[rect.width/2, rect.height/2]`
         * by default. See `contain/text.js#calculateTextPosition` for more details.
         * But some coutom shapes like "pin", "flag" have center that is not exactly
         * `[width/2, height/2]`. So we provide this hook to customize the calculation
         * for those shapes. It will be called if the `style.textPosition` is a string.
         * @param out Prepared out object. If not provided, this method should
         *        be responsible for creating one.
         * @param style
         * @param rect {x, y, width, height}
         * @return out The same as the input out.
         *         {
         *             x: number. mandatory.
         *             y: number. mandatory.
         *             textAlign: string. optional. use style.textAlign by default.
         *             textVerticalAlign: string. optional. use style.textVerticalAlign by default.
         *         }
         */
        // calculateTextPosition: (out: CalculateTextPositionResult, style: Dictionary<any>, rect: RectLike) => CalculateTextPositionResult
        Displayable.initDefaultProps = (function () {
            var dispProto = Displayable.prototype;
            dispProto.type = 'displayable';
            dispProto.invisible = false;
            dispProto.z = 0;
            dispProto.z2 = 0;
            dispProto.zlevel = 0;
            dispProto.culling = false;
            dispProto.cursor = 'pointer';
            dispProto.rectHover = false;
            dispProto.incremental = false;
            dispProto._rect = null;
            dispProto.dirtyRectTolerance = 0;
            dispProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT;
        })();
        return Displayable;
    }(Element));
    var tmpRect = new BoundingRect(0, 0, 0, 0);
    var viewRect = new BoundingRect(0, 0, 0, 0);
    function isDisplayableCulled(el, width, height) {
        tmpRect.copy(el.getBoundingRect());
        if (el.transform) {
            tmpRect.applyTransform(el.transform);
        }
        viewRect.width = width;
        viewRect.height = height;
        return !tmpRect.intersect(viewRect);
    }

    /**
     * 曲线辅助模块
     */
    var mathPow = Math.pow;
    var mathSqrt$1 = Math.sqrt;
    var EPSILON$1 = 1e-8;
    var EPSILON_NUMERIC = 1e-4;
    var THREE_SQRT = mathSqrt$1(3);
    var ONE_THIRD = 1 / 3;
    // 临时变量
    var _v0 = create$1();
    var _v1 = create$1();
    var _v2 = create$1();
    function isAroundZero(val) {
        return val > -EPSILON$1 && val < EPSILON$1;
    }
    function isNotAroundZero(val) {
        return val > EPSILON$1 || val < -EPSILON$1;
    }
    /**
     * 计算三次贝塞尔值
     */
    function cubicAt(p0, p1, p2, p3, t) {
        var onet = 1 - t;
        return onet * onet * (onet * p0 + 3 * t * p1)
            + t * t * (t * p3 + 3 * onet * p2);
    }
    /**
     * 计算三次贝塞尔方程根，使用盛金公式
     */
    function cubicRootAt(p0, p1, p2, p3, val, roots) {
        // Evaluate roots of cubic functions
        var a = p3 + 3 * (p1 - p2) - p0;
        var b = 3 * (p2 - p1 * 2 + p0);
        var c = 3 * (p1 - p0);
        var d = p0 - val;
        var A = b * b - 3 * a * c;
        var B = b * c - 9 * a * d;
        var C = c * c - 3 * b * d;
        var n = 0;
        if (isAroundZero(A) && isAroundZero(B)) {
            if (isAroundZero(b)) {
                roots[0] = 0;
            }
            else {
                var t1 = -c / b; //t1, t2, t3, b is not zero
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
            }
        }
        else {
            var disc = B * B - 4 * A * C;
            if (isAroundZero(disc)) {
                var K = B / A;
                var t1 = -b / a + K; // t1, a is not zero
                var t2 = -K / 2; // t2, t3
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
                if (t2 >= 0 && t2 <= 1) {
                    roots[n++] = t2;
                }
            }
            else if (disc > 0) {
                var discSqrt = mathSqrt$1(disc);
                var Y1 = A * b + 1.5 * a * (-B + discSqrt);
                var Y2 = A * b + 1.5 * a * (-B - discSqrt);
                if (Y1 < 0) {
                    Y1 = -mathPow(-Y1, ONE_THIRD);
                }
                else {
                    Y1 = mathPow(Y1, ONE_THIRD);
                }
                if (Y2 < 0) {
                    Y2 = -mathPow(-Y2, ONE_THIRD);
                }
                else {
                    Y2 = mathPow(Y2, ONE_THIRD);
                }
                var t1 = (-b - (Y1 + Y2)) / (3 * a);
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
            }
            else {
                var T = (2 * A * b - 3 * a * B) / (2 * mathSqrt$1(A * A * A));
                var theta = Math.acos(T) / 3;
                var ASqrt = mathSqrt$1(A);
                var tmp = Math.cos(theta);
                var t1 = (-b - 2 * ASqrt * tmp) / (3 * a);
                var t2 = (-b + ASqrt * (tmp + THREE_SQRT * Math.sin(theta))) / (3 * a);
                var t3 = (-b + ASqrt * (tmp - THREE_SQRT * Math.sin(theta))) / (3 * a);
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
                if (t2 >= 0 && t2 <= 1) {
                    roots[n++] = t2;
                }
                if (t3 >= 0 && t3 <= 1) {
                    roots[n++] = t3;
                }
            }
        }
        return n;
    }
    /**
     * 计算三次贝塞尔方程极限值的位置
     * @return 有效数目
     */
    function cubicExtrema(p0, p1, p2, p3, extrema) {
        var b = 6 * p2 - 12 * p1 + 6 * p0;
        var a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
        var c = 3 * p1 - 3 * p0;
        var n = 0;
        if (isAroundZero(a)) {
            if (isNotAroundZero(b)) {
                var t1 = -c / b;
                if (t1 >= 0 && t1 <= 1) {
                    extrema[n++] = t1;
                }
            }
        }
        else {
            var disc = b * b - 4 * a * c;
            if (isAroundZero(disc)) {
                extrema[0] = -b / (2 * a);
            }
            else if (disc > 0) {
                var discSqrt = mathSqrt$1(disc);
                var t1 = (-b + discSqrt) / (2 * a);
                var t2 = (-b - discSqrt) / (2 * a);
                if (t1 >= 0 && t1 <= 1) {
                    extrema[n++] = t1;
                }
                if (t2 >= 0 && t2 <= 1) {
                    extrema[n++] = t2;
                }
            }
        }
        return n;
    }
    /**
     * 细分三次贝塞尔曲线
     */
    function cubicSubdivide(p0, p1, p2, p3, t, out) {
        var p01 = (p1 - p0) * t + p0;
        var p12 = (p2 - p1) * t + p1;
        var p23 = (p3 - p2) * t + p2;
        var p012 = (p12 - p01) * t + p01;
        var p123 = (p23 - p12) * t + p12;
        var p0123 = (p123 - p012) * t + p012;
        // Seg0
        out[0] = p0;
        out[1] = p01;
        out[2] = p012;
        out[3] = p0123;
        // Seg1
        out[4] = p0123;
        out[5] = p123;
        out[6] = p23;
        out[7] = p3;
    }
    /**
     * 投射点到三次贝塞尔曲线上，返回投射距离。
     * 投射点有可能会有一个或者多个，这里只返回其中距离最短的一个。
     */
    function cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, out) {
        // http://pomax.github.io/bezierinfo/#projections
        var t;
        var interval = 0.005;
        var d = Infinity;
        var prev;
        var next;
        var d1;
        var d2;
        _v0[0] = x;
        _v0[1] = y;
        // 先粗略估计一下可能的最小距离的 t 值
        // PENDING
        for (var _t = 0; _t < 1; _t += 0.05) {
            _v1[0] = cubicAt(x0, x1, x2, x3, _t);
            _v1[1] = cubicAt(y0, y1, y2, y3, _t);
            d1 = distSquare(_v0, _v1);
            if (d1 < d) {
                t = _t;
                d = d1;
            }
        }
        d = Infinity;
        // At most 32 iteration
        for (var i = 0; i < 32; i++) {
            if (interval < EPSILON_NUMERIC) {
                break;
            }
            prev = t - interval;
            next = t + interval;
            // t - interval
            _v1[0] = cubicAt(x0, x1, x2, x3, prev);
            _v1[1] = cubicAt(y0, y1, y2, y3, prev);
            d1 = distSquare(_v1, _v0);
            if (prev >= 0 && d1 < d) {
                t = prev;
                d = d1;
            }
            else {
                // t + interval
                _v2[0] = cubicAt(x0, x1, x2, x3, next);
                _v2[1] = cubicAt(y0, y1, y2, y3, next);
                d2 = distSquare(_v2, _v0);
                if (next <= 1 && d2 < d) {
                    t = next;
                    d = d2;
                }
                else {
                    interval *= 0.5;
                }
            }
        }
        // t
        if (out) {
            out[0] = cubicAt(x0, x1, x2, x3, t);
            out[1] = cubicAt(y0, y1, y2, y3, t);
        }
        // console.log(interval, i);
        return mathSqrt$1(d);
    }
    /**
     * 计算三次贝塞尔曲线长度
     */
    function cubicLength(x0, y0, x1, y1, x2, y2, x3, y3, iteration) {
        var px = x0;
        var py = y0;
        var d = 0;
        var step = 1 / iteration;
        for (var i = 1; i <= iteration; i++) {
            var t = i * step;
            var x = cubicAt(x0, x1, x2, x3, t);
            var y = cubicAt(y0, y1, y2, y3, t);
            var dx = x - px;
            var dy = y - py;
            d += Math.sqrt(dx * dx + dy * dy);
            px = x;
            py = y;
        }
        return d;
    }
    /**
     * 计算二次方贝塞尔值
     */
    function quadraticAt(p0, p1, p2, t) {
        var onet = 1 - t;
        return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
    }
    /**
     * 计算二次方贝塞尔方程根
     * @return 有效根数目
     */
    function quadraticRootAt(p0, p1, p2, val, roots) {
        var a = p0 - 2 * p1 + p2;
        var b = 2 * (p1 - p0);
        var c = p0 - val;
        var n = 0;
        if (isAroundZero(a)) {
            if (isNotAroundZero(b)) {
                var t1 = -c / b;
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
            }
        }
        else {
            var disc = b * b - 4 * a * c;
            if (isAroundZero(disc)) {
                var t1 = -b / (2 * a);
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
            }
            else if (disc > 0) {
                var discSqrt = mathSqrt$1(disc);
                var t1 = (-b + discSqrt) / (2 * a);
                var t2 = (-b - discSqrt) / (2 * a);
                if (t1 >= 0 && t1 <= 1) {
                    roots[n++] = t1;
                }
                if (t2 >= 0 && t2 <= 1) {
                    roots[n++] = t2;
                }
            }
        }
        return n;
    }
    /**
     * 计算二次贝塞尔方程极限值
     */
    function quadraticExtremum(p0, p1, p2) {
        var divider = p0 + p2 - 2 * p1;
        if (divider === 0) {
            // p1 is center of p0 and p2
            return 0.5;
        }
        else {
            return (p0 - p1) / divider;
        }
    }
    /**
     * 细分二次贝塞尔曲线
     */
    function quadraticSubdivide(p0, p1, p2, t, out) {
        var p01 = (p1 - p0) * t + p0;
        var p12 = (p2 - p1) * t + p1;
        var p012 = (p12 - p01) * t + p01;
        // Seg0
        out[0] = p0;
        out[1] = p01;
        out[2] = p012;
        // Seg1
        out[3] = p012;
        out[4] = p12;
        out[5] = p2;
    }
    /**
     * 投射点到二次贝塞尔曲线上，返回投射距离。
     * 投射点有可能会有一个或者多个，这里只返回其中距离最短的一个。
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} x
     * @param {number} y
     * @param {Array.<number>} out 投射点
     * @return {number}
     */
    function quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, out) {
        // http://pomax.github.io/bezierinfo/#projections
        var t;
        var interval = 0.005;
        var d = Infinity;
        _v0[0] = x;
        _v0[1] = y;
        // 先粗略估计一下可能的最小距离的 t 值
        // PENDING
        for (var _t = 0; _t < 1; _t += 0.05) {
            _v1[0] = quadraticAt(x0, x1, x2, _t);
            _v1[1] = quadraticAt(y0, y1, y2, _t);
            var d1 = distSquare(_v0, _v1);
            if (d1 < d) {
                t = _t;
                d = d1;
            }
        }
        d = Infinity;
        // At most 32 iteration
        for (var i = 0; i < 32; i++) {
            if (interval < EPSILON_NUMERIC) {
                break;
            }
            var prev = t - interval;
            var next = t + interval;
            // t - interval
            _v1[0] = quadraticAt(x0, x1, x2, prev);
            _v1[1] = quadraticAt(y0, y1, y2, prev);
            var d1 = distSquare(_v1, _v0);
            if (prev >= 0 && d1 < d) {
                t = prev;
                d = d1;
            }
            else {
                // t + interval
                _v2[0] = quadraticAt(x0, x1, x2, next);
                _v2[1] = quadraticAt(y0, y1, y2, next);
                var d2 = distSquare(_v2, _v0);
                if (next <= 1 && d2 < d) {
                    t = next;
                    d = d2;
                }
                else {
                    interval *= 0.5;
                }
            }
        }
        // t
        if (out) {
            out[0] = quadraticAt(x0, x1, x2, t);
            out[1] = quadraticAt(y0, y1, y2, t);
        }
        // console.log(interval, i);
        return mathSqrt$1(d);
    }
    /**
     * 计算二次贝塞尔曲线长度
     */
    function quadraticLength(x0, y0, x1, y1, x2, y2, iteration) {
        var px = x0;
        var py = y0;
        var d = 0;
        var step = 1 / iteration;
        for (var i = 1; i <= iteration; i++) {
            var t = i * step;
            var x = quadraticAt(x0, x1, x2, t);
            var y = quadraticAt(y0, y1, y2, t);
            var dx = x - px;
            var dy = y - py;
            d += Math.sqrt(dx * dx + dy * dy);
            px = x;
            py = y;
        }
        return d;
    }

    /**
     * @author Yi Shen(https://github.com/pissang)
     */
    var mathMin$1 = Math.min;
    var mathMax$1 = Math.max;
    var mathSin$1 = Math.sin;
    var mathCos$1 = Math.cos;
    var PI2$4 = Math.PI * 2;
    var start = create$1();
    var end = create$1();
    var extremity = create$1();
    function fromLine(x0, y0, x1, y1, min, max) {
        min[0] = mathMin$1(x0, x1);
        min[1] = mathMin$1(y0, y1);
        max[0] = mathMax$1(x0, x1);
        max[1] = mathMax$1(y0, y1);
    }
    var xDim = [];
    var yDim = [];
    /**
     * 从三阶贝塞尔曲线(p0, p1, p2, p3)中计算出最小包围盒，写入`min`和`max`中
     */
    function fromCubic(x0, y0, x1, y1, x2, y2, x3, y3, min, max) {
        var cubicExtrema$1 = cubicExtrema;
        var cubicAt$1 = cubicAt;
        var n = cubicExtrema$1(x0, x1, x2, x3, xDim);
        min[0] = Infinity;
        min[1] = Infinity;
        max[0] = -Infinity;
        max[1] = -Infinity;
        for (var i = 0; i < n; i++) {
            var x = cubicAt$1(x0, x1, x2, x3, xDim[i]);
            min[0] = mathMin$1(x, min[0]);
            max[0] = mathMax$1(x, max[0]);
        }
        n = cubicExtrema$1(y0, y1, y2, y3, yDim);
        for (var i = 0; i < n; i++) {
            var y = cubicAt$1(y0, y1, y2, y3, yDim[i]);
            min[1] = mathMin$1(y, min[1]);
            max[1] = mathMax$1(y, max[1]);
        }
        min[0] = mathMin$1(x0, min[0]);
        max[0] = mathMax$1(x0, max[0]);
        min[0] = mathMin$1(x3, min[0]);
        max[0] = mathMax$1(x3, max[0]);
        min[1] = mathMin$1(y0, min[1]);
        max[1] = mathMax$1(y0, max[1]);
        min[1] = mathMin$1(y3, min[1]);
        max[1] = mathMax$1(y3, max[1]);
    }
    /**
     * 从二阶贝塞尔曲线(p0, p1, p2)中计算出最小包围盒，写入`min`和`max`中
     */
    function fromQuadratic(x0, y0, x1, y1, x2, y2, min, max) {
        var quadraticExtremum$1 = quadraticExtremum;
        var quadraticAt$1 = quadraticAt;
        // Find extremities, where derivative in x dim or y dim is zero
        var tx = mathMax$1(mathMin$1(quadraticExtremum$1(x0, x1, x2), 1), 0);
        var ty = mathMax$1(mathMin$1(quadraticExtremum$1(y0, y1, y2), 1), 0);
        var x = quadraticAt$1(x0, x1, x2, tx);
        var y = quadraticAt$1(y0, y1, y2, ty);
        min[0] = mathMin$1(x0, x2, x);
        min[1] = mathMin$1(y0, y2, y);
        max[0] = mathMax$1(x0, x2, x);
        max[1] = mathMax$1(y0, y2, y);
    }
    /**
     * 从圆弧中计算出最小包围盒，写入`min`和`max`中
     */
    function fromArc(x, y, rx, ry, startAngle, endAngle, anticlockwise, min, max) {
        var vec2Min = min$1;
        var vec2Max = max$1;
        var diff = Math.abs(startAngle - endAngle);
        if (diff % PI2$4 < 1e-4 && diff > 1e-4) {
            // Is a circle
            min[0] = x - rx;
            min[1] = y - ry;
            max[0] = x + rx;
            max[1] = y + ry;
            return;
        }
        start[0] = mathCos$1(startAngle) * rx + x;
        start[1] = mathSin$1(startAngle) * ry + y;
        end[0] = mathCos$1(endAngle) * rx + x;
        end[1] = mathSin$1(endAngle) * ry + y;
        vec2Min(min, start, end);
        vec2Max(max, start, end);
        // Thresh to [0, Math.PI * 2]
        startAngle = startAngle % (PI2$4);
        if (startAngle < 0) {
            startAngle = startAngle + PI2$4;
        }
        endAngle = endAngle % (PI2$4);
        if (endAngle < 0) {
            endAngle = endAngle + PI2$4;
        }
        if (startAngle > endAngle && !anticlockwise) {
            endAngle += PI2$4;
        }
        else if (startAngle < endAngle && anticlockwise) {
            startAngle += PI2$4;
        }
        if (anticlockwise) {
            var tmp = endAngle;
            endAngle = startAngle;
            startAngle = tmp;
        }
        // const number = 0;
        // const step = (anticlockwise ? -Math.PI : Math.PI) / 2;
        for (var angle = 0; angle < endAngle; angle += Math.PI / 2) {
            if (angle > startAngle) {
                extremity[0] = mathCos$1(angle) * rx + x;
                extremity[1] = mathSin$1(angle) * ry + y;
                vec2Min(min, extremity, min);
                vec2Max(max, extremity, max);
            }
        }
    }

    /**
     * Path 代理，可以在`buildPath`中用于替代`ctx`, 会保存每个path操作的命令到pathCommands属性中
     * 可以用于 isInsidePath 判断以及获取boundingRect
     */
    var CMD$1 = {
        M: 1,
        L: 2,
        C: 3,
        Q: 4,
        A: 5,
        Z: 6,
        // Rect
        R: 7
    };
    var tmpOutX = [];
    var tmpOutY = [];
    var min = [];
    var max = [];
    var min2 = [];
    var max2 = [];
    var mathMin = Math.min;
    var mathMax = Math.max;
    var mathCos = Math.cos;
    var mathSin = Math.sin;
    var mathSqrt = Math.sqrt;
    var mathAbs = Math.abs;
    var PI = Math.PI;
    var PI2$3 = PI * 2;
    var hasTypedArray = typeof Float32Array !== 'undefined';
    var tmpAngles = [];
    function modPI2(radian) {
        // It's much more stable to mod N instedof PI
        var n = Math.round(radian / PI * 1e8) / 1e8;
        return (n % 2) * PI;
    }
    /**
     * Normalize start and end angles.
     * startAngle will be normalized to 0 ~ PI*2
     * sweepAngle(endAngle - startAngle) will be normalized to 0 ~ PI*2 if clockwise.
     * -PI*2 ~ 0 if anticlockwise.
     */
    function normalizeArcAngles(angles, anticlockwise) {
        var newStartAngle = modPI2(angles[0]);
        if (newStartAngle < 0) {
            // Normlize to 0 - PI2
            newStartAngle += PI2$3;
        }
        var delta = newStartAngle - angles[0];
        var newEndAngle = angles[1];
        newEndAngle += delta;
        // https://github.com/chromium/chromium/blob/c20d681c9c067c4e15bb1408f17114b9e8cba294/third_party/blink/renderer/modules/canvas/canvas2d/canvas_path.cc#L184
        // Is circle
        if (!anticlockwise && newEndAngle - newStartAngle >= PI2$3) {
            newEndAngle = newStartAngle + PI2$3;
        }
        else if (anticlockwise && newStartAngle - newEndAngle >= PI2$3) {
            newEndAngle = newStartAngle - PI2$3;
        }
        // Make startAngle < endAngle when clockwise, otherwise endAngle < startAngle.
        // The sweep angle can never been larger than P2.
        else if (!anticlockwise && newStartAngle > newEndAngle) {
            newEndAngle = newStartAngle + (PI2$3 - modPI2(newStartAngle - newEndAngle));
        }
        else if (anticlockwise && newStartAngle < newEndAngle) {
            newEndAngle = newStartAngle - (PI2$3 - modPI2(newEndAngle - newStartAngle));
        }
        angles[0] = newStartAngle;
        angles[1] = newEndAngle;
    }
    var PathProxy = /** @class */ (function () {
        function PathProxy(notSaveData) {
            this.dpr = 1;
            this._xi = 0;
            this._yi = 0;
            this._x0 = 0;
            this._y0 = 0;
            this._len = 0;
            if (notSaveData) {
                this._saveData = false;
            }
            if (this._saveData) {
                this.data = [];
            }
        }
        PathProxy.prototype.increaseVersion = function () {
            this._version++;
        };
        /**
         * Version can be used outside for compare if the path is changed.
         * For example to determine if need to update svg d str in svg renderer.
         */
        PathProxy.prototype.getVersion = function () {
            return this._version;
        };
        /**
         * @readOnly
         */
        PathProxy.prototype.setScale = function (sx, sy, segmentIgnoreThreshold) {
            // Compat. Previously there is no segmentIgnoreThreshold.
            segmentIgnoreThreshold = segmentIgnoreThreshold || 0;
            if (segmentIgnoreThreshold > 0) {
                this._ux = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sx) || 0;
                this._uy = mathAbs(segmentIgnoreThreshold / devicePixelRatio / sy) || 0;
            }
        };
        PathProxy.prototype.setDPR = function (dpr) {
            this.dpr = dpr;
        };
        PathProxy.prototype.setContext = function (ctx) {
            this._ctx = ctx;
        };
        PathProxy.prototype.getContext = function () {
            return this._ctx;
        };
        PathProxy.prototype.beginPath = function () {
            this._ctx && this._ctx.beginPath();
            this.reset();
            return this;
        };
        /**
         * Reset path data.
         */
        PathProxy.prototype.reset = function () {
            // Reset
            if (this._saveData) {
                this._len = 0;
            }
            if (this._lineDash) {
                this._lineDash = null;
                this._dashOffset = 0;
            }
            if (this._pathSegLen) {
                this._pathSegLen = null;
                this._pathLen = 0;
            }
            // Update version
            this._version++;
        };
        PathProxy.prototype.moveTo = function (x, y) {
            // Add pending point for previous path.
            this._drawPendingPt();
            this.addData(CMD$1.M, x, y);
            this._ctx && this._ctx.moveTo(x, y);
            // x0, y0, xi, yi 是记录在 _dashedXXXXTo 方法中使用
            // xi, yi 记录当前点, x0, y0 在 closePath 的时候回到起始点。
            // 有可能在 beginPath 之后直接调用 lineTo，这时候 x0, y0 需要
            // 在 lineTo 方法中记录，这里先不考虑这种情况，dashed line 也只在 IE10- 中不支持
            this._x0 = x;
            this._y0 = y;
            this._xi = x;
            this._yi = y;
            return this;
        };
        PathProxy.prototype.lineTo = function (x, y) {
            var dx = mathAbs(x - this._xi);
            var dy = mathAbs(y - this._yi);
            var exceedUnit = dx > this._ux || dy > this._uy;
            this.addData(CMD$1.L, x, y);
            if (this._ctx && exceedUnit) {
                this._needsDash ? this._dashedLineTo(x, y)
                    : this._ctx.lineTo(x, y);
            }
            if (exceedUnit) {
                this._xi = x;
                this._yi = y;
                this._pendingPtDist = 0;
            }
            else {
                var d2 = dx * dx + dy * dy;
                // Only use the farthest pending point.
                if (d2 > this._pendingPtDist) {
                    this._pendingPtX = x;
                    this._pendingPtY = y;
                    this._pendingPtDist = d2;
                }
            }
            return this;
        };
        PathProxy.prototype.bezierCurveTo = function (x1, y1, x2, y2, x3, y3) {
            this._drawPendingPt();
            this.addData(CMD$1.C, x1, y1, x2, y2, x3, y3);
            if (this._ctx) {
                this._needsDash ? this._dashedBezierTo(x1, y1, x2, y2, x3, y3)
                    : this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
            }
            this._xi = x3;
            this._yi = y3;
            return this;
        };
        PathProxy.prototype.quadraticCurveTo = function (x1, y1, x2, y2) {
            this._drawPendingPt();
            this.addData(CMD$1.Q, x1, y1, x2, y2);
            if (this._ctx) {
                this._needsDash ? this._dashedQuadraticTo(x1, y1, x2, y2)
                    : this._ctx.quadraticCurveTo(x1, y1, x2, y2);
            }
            this._xi = x2;
            this._yi = y2;
            return this;
        };
        PathProxy.prototype.arc = function (cx, cy, r, startAngle, endAngle, anticlockwise) {
            this._drawPendingPt();
            tmpAngles[0] = startAngle;
            tmpAngles[1] = endAngle;
            normalizeArcAngles(tmpAngles, anticlockwise);
            startAngle = tmpAngles[0];
            endAngle = tmpAngles[1];
            var delta = endAngle - startAngle;
            this.addData(CMD$1.A, cx, cy, r, r, startAngle, delta, 0, anticlockwise ? 0 : 1);
            this._ctx && this._ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
            this._xi = mathCos(endAngle) * r + cx;
            this._yi = mathSin(endAngle) * r + cy;
            return this;
        };
        // TODO
        PathProxy.prototype.arcTo = function (x1, y1, x2, y2, radius) {
            this._drawPendingPt();
            if (this._ctx) {
                this._ctx.arcTo(x1, y1, x2, y2, radius);
            }
            return this;
        };
        // TODO
        PathProxy.prototype.rect = function (x, y, w, h) {
            this._drawPendingPt();
            this._ctx && this._ctx.rect(x, y, w, h);
            this.addData(CMD$1.R, x, y, w, h);
            return this;
        };
        PathProxy.prototype.closePath = function () {
            // Add pending point for previous path.
            this._drawPendingPt();
            this.addData(CMD$1.Z);
            var ctx = this._ctx;
            var x0 = this._x0;
            var y0 = this._y0;
            if (ctx) {
                this._needsDash && this._dashedLineTo(x0, y0);
                ctx.closePath();
            }
            this._xi = x0;
            this._yi = y0;
            return this;
        };
        PathProxy.prototype.fill = function (ctx) {
            ctx && ctx.fill();
            this.toStatic();
        };
        PathProxy.prototype.stroke = function (ctx) {
            ctx && ctx.stroke();
            this.toStatic();
        };
        /**
         * 必须在其它绘制命令前调用
         * Must be invoked before all other path drawing methods
         */
        PathProxy.prototype.setLineDash = function (lineDash) {
            if (lineDash instanceof Array) {
                this._lineDash = lineDash;
                this._dashIdx = 0;
                var lineDashSum = 0;
                for (var i = 0; i < lineDash.length; i++) {
                    lineDashSum += lineDash[i];
                }
                this._dashSum = lineDashSum;
                this._needsDash = true;
            }
            else {
                // Clear
                this._lineDash = null;
                this._needsDash = false;
            }
            return this;
        };
        /**
         * 必须在其它绘制命令前调用
         * Must be invoked before all other path drawing methods
         */
        PathProxy.prototype.setLineDashOffset = function (offset) {
            this._dashOffset = offset;
            return this;
        };
        PathProxy.prototype.len = function () {
            return this._len;
        };
        PathProxy.prototype.setData = function (data) {
            var len = data.length;
            if (!(this.data && this.data.length === len) && hasTypedArray) {
                this.data = new Float32Array(len);
            }
            for (var i = 0; i < len; i++) {
                this.data[i] = data[i];
            }
            this._len = len;
        };
        PathProxy.prototype.appendPath = function (path) {
            if (!(path instanceof Array)) {
                path = [path];
            }
            var len = path.length;
            var appendSize = 0;
            var offset = this._len;
            for (var i = 0; i < len; i++) {
                appendSize += path[i].len();
            }
            if (hasTypedArray && (this.data instanceof Float32Array)) {
                this.data = new Float32Array(offset + appendSize);
            }
            for (var i = 0; i < len; i++) {
                var appendPathData = path[i].data;
                for (var k = 0; k < appendPathData.length; k++) {
                    this.data[offset++] = appendPathData[k];
                }
            }
            this._len = offset;
        };
        /**
         * 填充 Path 数据。
         * 尽量复用而不申明新的数组。大部分图形重绘的指令数据长度都是不变的。
         */
        PathProxy.prototype.addData = function (cmd, a, b, c, d, e, f, g, h) {
            if (!this._saveData) {
                return;
            }
            var data = this.data;
            if (this._len + arguments.length > data.length) {
                // 因为之前的数组已经转换成静态的 Float32Array
                // 所以不够用时需要扩展一个新的动态数组
                this._expandData();
                data = this.data;
            }
            for (var i = 0; i < arguments.length; i++) {
                data[this._len++] = arguments[i];
            }
        };
        PathProxy.prototype._drawPendingPt = function () {
            if (this._pendingPtDist > 0) {
                this._ctx && this._ctx.lineTo(this._pendingPtX, this._pendingPtY);
                this._pendingPtDist = 0;
            }
        };
        PathProxy.prototype._expandData = function () {
            // Only if data is Float32Array
            if (!(this.data instanceof Array)) {
                var newData = [];
                for (var i = 0; i < this._len; i++) {
                    newData[i] = this.data[i];
                }
                this.data = newData;
            }
        };
        PathProxy.prototype._dashedLineTo = function (x1, y1) {
            var dashSum = this._dashSum;
            var lineDash = this._lineDash;
            var ctx = this._ctx;
            var offset = this._dashOffset;
            var x0 = this._xi;
            var y0 = this._yi;
            var dx = x1 - x0;
            var dy = y1 - y0;
            var dist = mathSqrt(dx * dx + dy * dy);
            var x = x0;
            var y = y0;
            var nDash = lineDash.length;
            var dash;
            var idx;
            dx /= dist;
            dy /= dist;
            if (offset < 0) {
                // Convert to positive offset
                offset = dashSum + offset;
            }
            offset %= dashSum;
            x -= offset * dx;
            y -= offset * dy;
            while ((dx > 0 && x <= x1) || (dx < 0 && x >= x1)
                || (dx === 0 && ((dy > 0 && y <= y1) || (dy < 0 && y >= y1)))) {
                idx = this._dashIdx;
                dash = lineDash[idx];
                x += dx * dash;
                y += dy * dash;
                this._dashIdx = (idx + 1) % nDash;
                // Skip positive offset
                if ((dx > 0 && x < x0) || (dx < 0 && x > x0) || (dy > 0 && y < y0) || (dy < 0 && y > y0)) {
                    continue;
                }
                ctx[idx % 2 ? 'moveTo' : 'lineTo'](dx >= 0 ? mathMin(x, x1) : mathMax(x, x1), dy >= 0 ? mathMin(y, y1) : mathMax(y, y1));
            }
            // Offset for next lineTo
            dx = x - x1;
            dy = y - y1;
            this._dashOffset = -mathSqrt(dx * dx + dy * dy);
        };
        // Not accurate dashed line to
        PathProxy.prototype._dashedBezierTo = function (x1, y1, x2, y2, x3, y3) {
            var ctx = this._ctx;
            var dashSum = this._dashSum;
            var offset = this._dashOffset;
            var lineDash = this._lineDash;
            var x0 = this._xi;
            var y0 = this._yi;
            var bezierLen = 0;
            var idx = this._dashIdx;
            var nDash = lineDash.length;
            var t;
            var dx;
            var dy;
            var x;
            var y;
            var tmpLen = 0;
            if (offset < 0) {
                // Convert to positive offset
                offset = dashSum + offset;
            }
            offset %= dashSum;
            // Bezier approx length
            for (t = 0; t < 1; t += 0.1) {
                dx = cubicAt(x0, x1, x2, x3, t + 0.1)
                    - cubicAt(x0, x1, x2, x3, t);
                dy = cubicAt(y0, y1, y2, y3, t + 0.1)
                    - cubicAt(y0, y1, y2, y3, t);
                bezierLen += mathSqrt(dx * dx + dy * dy);
            }
            // Find idx after add offset
            for (; idx < nDash; idx++) {
                tmpLen += lineDash[idx];
                if (tmpLen > offset) {
                    break;
                }
            }
            t = (tmpLen - offset) / bezierLen;
            while (t <= 1) {
                x = cubicAt(x0, x1, x2, x3, t);
                y = cubicAt(y0, y1, y2, y3, t);
                // Use line to approximate dashed bezier
                // Bad result if dash is long
                idx % 2 ? ctx.moveTo(x, y)
                    : ctx.lineTo(x, y);
                t += lineDash[idx] / bezierLen;
                idx = (idx + 1) % nDash;
            }
            // Finish the last segment and calculate the new offset
            (idx % 2 !== 0) && ctx.lineTo(x3, y3);
            dx = x3 - x;
            dy = y3 - y;
            this._dashOffset = -mathSqrt(dx * dx + dy * dy);
        };
        PathProxy.prototype._dashedQuadraticTo = function (x1, y1, x2, y2) {
            // Convert quadratic to cubic using degree elevation
            var x3 = x2;
            var y3 = y2;
            x2 = (x2 + 2 * x1) / 3;
            y2 = (y2 + 2 * y1) / 3;
            x1 = (this._xi + 2 * x1) / 3;
            y1 = (this._yi + 2 * y1) / 3;
            this._dashedBezierTo(x1, y1, x2, y2, x3, y3);
        };
        /**
         * Convert dynamic array to static Float32Array
         *
         * It will still use a normal array if command buffer length is less than 10
         * Because Float32Array itself may take more memory than a normal array.
         *
         * 10 length will make sure at least one M command and one A(arc) command.
         */
        PathProxy.prototype.toStatic = function () {
            if (!this._saveData) {
                return;
            }
            this._drawPendingPt();
            var data = this.data;
            if (data instanceof Array) {
                data.length = this._len;
                if (hasTypedArray && this._len > 11) {
                    this.data = new Float32Array(data);
                }
            }
        };
        PathProxy.prototype.getBoundingRect = function () {
            min[0] = min[1] = min2[0] = min2[1] = Number.MAX_VALUE;
            max[0] = max[1] = max2[0] = max2[1] = -Number.MAX_VALUE;
            var data = this.data;
            var xi = 0;
            var yi = 0;
            var x0 = 0;
            var y0 = 0;
            var i;
            for (i = 0; i < this._len;) {
                var cmd = data[i++];
                var isFirst = i === 1;
                if (isFirst) {
                    // 如果第一个命令是 L, C, Q
                    // 则 previous point 同绘制命令的第一个 point
                    // 第一个命令为 Arc 的情况下会在后面特殊处理
                    xi = data[i];
                    yi = data[i + 1];
                    x0 = xi;
                    y0 = yi;
                }
                switch (cmd) {
                    case CMD$1.M:
                        // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
                        // 在 closePath 的时候使用
                        xi = x0 = data[i++];
                        yi = y0 = data[i++];
                        min2[0] = x0;
                        min2[1] = y0;
                        max2[0] = x0;
                        max2[1] = y0;
                        break;
                    case CMD$1.L:
                        fromLine(xi, yi, data[i], data[i + 1], min2, max2);
                        xi = data[i++];
                        yi = data[i++];
                        break;
                    case CMD$1.C:
                        fromCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], min2, max2);
                        xi = data[i++];
                        yi = data[i++];
                        break;
                    case CMD$1.Q:
                        fromQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], min2, max2);
                        xi = data[i++];
                        yi = data[i++];
                        break;
                    case CMD$1.A:
                        var cx = data[i++];
                        var cy = data[i++];
                        var rx = data[i++];
                        var ry = data[i++];
                        var startAngle = data[i++];
                        var endAngle = data[i++] + startAngle;
                        // TODO Arc 旋转
                        i += 1;
                        var anticlockwise = !data[i++];
                        if (isFirst) {
                            // 直接使用 arc 命令
                            // 第一个命令起点还未定义
                            x0 = mathCos(startAngle) * rx + cx;
                            y0 = mathSin(startAngle) * ry + cy;
                        }
                        fromArc(cx, cy, rx, ry, startAngle, endAngle, anticlockwise, min2, max2);
                        xi = mathCos(endAngle) * rx + cx;
                        yi = mathSin(endAngle) * ry + cy;
                        break;
                    case CMD$1.R:
                        x0 = xi = data[i++];
                        y0 = yi = data[i++];
                        var width = data[i++];
                        var height = data[i++];
                        // Use fromLine
                        fromLine(x0, y0, x0 + width, y0 + height, min2, max2);
                        break;
                    case CMD$1.Z:
                        xi = x0;
                        yi = y0;
                        break;
                }
                // Union
                min$1(min, min, min2);
                max$1(max, max, max2);
            }
            // No data
            if (i === 0) {
                min[0] = min[1] = max[0] = max[1] = 0;
            }
            return new BoundingRect(min[0], min[1], max[0] - min[0], max[1] - min[1]);
        };
        PathProxy.prototype._calculateLength = function () {
            var data = this.data;
            var len = this._len;
            var ux = this._ux;
            var uy = this._uy;
            var xi = 0;
            var yi = 0;
            var x0 = 0;
            var y0 = 0;
            if (!this._pathSegLen) {
                this._pathSegLen = [];
            }
            var pathSegLen = this._pathSegLen;
            var pathTotalLen = 0;
            var segCount = 0;
            for (var i = 0; i < len;) {
                var cmd = data[i++];
                var isFirst = i === 1;
                if (isFirst) {
                    // 如果第一个命令是 L, C, Q
                    // 则 previous point 同绘制命令的第一个 point
                    // 第一个命令为 Arc 的情况下会在后面特殊处理
                    xi = data[i];
                    yi = data[i + 1];
                    x0 = xi;
                    y0 = yi;
                }
                var l = -1;
                switch (cmd) {
                    case CMD$1.M:
                        // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
                        // 在 closePath 的时候使用
                        xi = x0 = data[i++];
                        yi = y0 = data[i++];
                        break;
                    case CMD$1.L: {
                        var x2 = data[i++];
                        var y2 = data[i++];
                        var dx = x2 - xi;
                        var dy = y2 - yi;
                        if (mathAbs(dx) > ux || mathAbs(dy) > uy || i === len - 1) {
                            l = Math.sqrt(dx * dx + dy * dy);
                            xi = x2;
                            yi = y2;
                        }
                        break;
                    }
                    case CMD$1.C: {
                        var x1 = data[i++];
                        var y1 = data[i++];
                        var x2 = data[i++];
                        var y2 = data[i++];
                        var x3 = data[i++];
                        var y3 = data[i++];
                        // TODO adaptive iteration
                        l = cubicLength(xi, yi, x1, y1, x2, y2, x3, y3, 10);
                        xi = x3;
                        yi = y3;
                        break;
                    }
                    case CMD$1.Q: {
                        var x1 = data[i++];
                        var y1 = data[i++];
                        var x2 = data[i++];
                        var y2 = data[i++];
                        l = quadraticLength(xi, yi, x1, y1, x2, y2, 10);
                        xi = x2;
                        yi = y2;
                        break;
                    }
                    case CMD$1.A:
                        // TODO Arc 判断的开销比较大
                        var cx = data[i++];
                        var cy = data[i++];
                        var rx = data[i++];
                        var ry = data[i++];
                        var startAngle = data[i++];
                        var delta = data[i++];
                        var endAngle = delta + startAngle;
                        // TODO Arc 旋转
                        i += 1;
                        !data[i++];
                        if (isFirst) {
                            // 直接使用 arc 命令
                            // 第一个命令起点还未定义
                            x0 = mathCos(startAngle) * rx + cx;
                            y0 = mathSin(startAngle) * ry + cy;
                        }
                        // TODO Ellipse
                        l = mathMax(rx, ry) * mathMin(PI2$3, Math.abs(delta));
                        xi = mathCos(endAngle) * rx + cx;
                        yi = mathSin(endAngle) * ry + cy;
                        break;
                    case CMD$1.R: {
                        x0 = xi = data[i++];
                        y0 = yi = data[i++];
                        var width = data[i++];
                        var height = data[i++];
                        l = width * 2 + height * 2;
                        break;
                    }
                    case CMD$1.Z: {
                        var dx = x0 - xi;
                        var dy = y0 - yi;
                        l = Math.sqrt(dx * dx + dy * dy);
                        xi = x0;
                        yi = y0;
                        break;
                    }
                }
                if (l >= 0) {
                    pathSegLen[segCount++] = l;
                    pathTotalLen += l;
                }
            }
            // TODO Optimize memory cost.
            this._pathLen = pathTotalLen;
            return pathTotalLen;
        };
        /**
         * Rebuild path from current data
         * Rebuild path will not consider javascript implemented line dash.
         * @param {CanvasRenderingContext2D} ctx
         */
        PathProxy.prototype.rebuildPath = function (ctx, percent) {
            var d = this.data;
            var ux = this._ux;
            var uy = this._uy;
            var len = this._len;
            var x0;
            var y0;
            var xi;
            var yi;
            var x;
            var y;
            var drawPart = percent < 1;
            var pathSegLen;
            var pathTotalLen;
            var accumLength = 0;
            var segCount = 0;
            var displayedLength;
            var pendingPtDist = 0;
            var pendingPtX;
            var pendingPtY;
            if (drawPart) {
                if (!this._pathSegLen) {
                    this._calculateLength();
                }
                pathSegLen = this._pathSegLen;
                pathTotalLen = this._pathLen;
                displayedLength = percent * pathTotalLen;
                if (!displayedLength) {
                    return;
                }
            }
            lo: for (var i = 0; i < len;) {
                var cmd = d[i++];
                var isFirst = i === 1;
                if (isFirst) {
                    // 如果第一个命令是 L, C, Q
                    // 则 previous point 同绘制命令的第一个 point
                    // 第一个命令为 Arc 的情况下会在后面特殊处理
                    xi = d[i];
                    yi = d[i + 1];
                    x0 = xi;
                    y0 = yi;
                }
                // Only lineTo support ignoring small segments.
                // Otherwise if the pending point should always been flushed.
                if (cmd !== CMD$1.L && pendingPtDist > 0) {
                    ctx.lineTo(pendingPtX, pendingPtY);
                    pendingPtDist = 0;
                }
                switch (cmd) {
                    case CMD$1.M:
                        x0 = xi = d[i++];
                        y0 = yi = d[i++];
                        ctx.moveTo(xi, yi);
                        break;
                    case CMD$1.L: {
                        x = d[i++];
                        y = d[i++];
                        var dx = mathAbs(x - xi);
                        var dy = mathAbs(y - yi);
                        // Not draw too small seg between
                        if (dx > ux || dy > uy) {
                            if (drawPart) {
                                var l = pathSegLen[segCount++];
                                if (accumLength + l > displayedLength) {
                                    var t = (displayedLength - accumLength) / l;
                                    ctx.lineTo(xi * (1 - t) + x * t, yi * (1 - t) + y * t);
                                    break lo;
                                }
                                accumLength += l;
                            }
                            ctx.lineTo(x, y);
                            xi = x;
                            yi = y;
                            pendingPtDist = 0;
                        }
                        else {
                            var d2 = dx * dx + dy * dy;
                            // Only use the farthest pending point.
                            if (d2 > pendingPtDist) {
                                pendingPtX = x;
                                pendingPtY = y;
                                pendingPtDist = d2;
                            }
                        }
                        break;
                    }
                    case CMD$1.C: {
                        var x1 = d[i++];
                        var y1 = d[i++];
                        var x2 = d[i++];
                        var y2 = d[i++];
                        var x3 = d[i++];
                        var y3 = d[i++];
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                var t = (displayedLength - accumLength) / l;
                                cubicSubdivide(xi, x1, x2, x3, t, tmpOutX);
                                cubicSubdivide(yi, y1, y2, y3, t, tmpOutY);
                                ctx.bezierCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2], tmpOutX[3], tmpOutY[3]);
                                break lo;
                            }
                            accumLength += l;
                        }
                        ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
                        xi = x3;
                        yi = y3;
                        break;
                    }
                    case CMD$1.Q: {
                        var x1 = d[i++];
                        var y1 = d[i++];
                        var x2 = d[i++];
                        var y2 = d[i++];
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                var t = (displayedLength - accumLength) / l;
                                quadraticSubdivide(xi, x1, x2, t, tmpOutX);
                                quadraticSubdivide(yi, y1, y2, t, tmpOutY);
                                ctx.quadraticCurveTo(tmpOutX[1], tmpOutY[1], tmpOutX[2], tmpOutY[2]);
                                break lo;
                            }
                            accumLength += l;
                        }
                        ctx.quadraticCurveTo(x1, y1, x2, y2);
                        xi = x2;
                        yi = y2;
                        break;
                    }
                    case CMD$1.A:
                        var cx = d[i++];
                        var cy = d[i++];
                        var rx = d[i++];
                        var ry = d[i++];
                        var startAngle = d[i++];
                        var delta = d[i++];
                        var psi = d[i++];
                        var anticlockwise = !d[i++];
                        var r = (rx > ry) ? rx : ry;
                        // const scaleX = (rx > ry) ? 1 : rx / ry;
                        // const scaleY = (rx > ry) ? ry / rx : 1;
                        var isEllipse = mathAbs(rx - ry) > 1e-3;
                        var endAngle = startAngle + delta;
                        var breakBuild = false;
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                endAngle = startAngle + delta * (displayedLength - accumLength) / l;
                                breakBuild = true;
                            }
                            accumLength += l;
                        }
                        if (isEllipse && ctx.ellipse) {
                            ctx.ellipse(cx, cy, rx, ry, psi, startAngle, endAngle, anticlockwise);
                        }
                        else {
                            ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
                        }
                        if (breakBuild) {
                            break lo;
                        }
                        if (isFirst) {
                            // 直接使用 arc 命令
                            // 第一个命令起点还未定义
                            x0 = mathCos(startAngle) * rx + cx;
                            y0 = mathSin(startAngle) * ry + cy;
                        }
                        xi = mathCos(endAngle) * rx + cx;
                        yi = mathSin(endAngle) * ry + cy;
                        break;
                    case CMD$1.R:
                        x0 = xi = d[i];
                        y0 = yi = d[i + 1];
                        x = d[i++];
                        y = d[i++];
                        var width = d[i++];
                        var height = d[i++];
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                var d_1 = displayedLength - accumLength;
                                ctx.moveTo(x, y);
                                ctx.lineTo(x + mathMin(d_1, width), y);
                                d_1 -= width;
                                if (d_1 > 0) {
                                    ctx.lineTo(x + width, y + mathMin(d_1, height));
                                }
                                d_1 -= height;
                                if (d_1 > 0) {
                                    ctx.lineTo(x + mathMax(width - d_1, 0), y + height);
                                }
                                d_1 -= width;
                                if (d_1 > 0) {
                                    ctx.lineTo(x, y + mathMax(height - d_1, 0));
                                }
                                break lo;
                            }
                            accumLength += l;
                        }
                        ctx.rect(x, y, width, height);
                        break;
                    case CMD$1.Z:
                        if (drawPart) {
                            var l = pathSegLen[segCount++];
                            if (accumLength + l > displayedLength) {
                                var t = (displayedLength - accumLength) / l;
                                ctx.lineTo(xi * (1 - t) + x0 * t, yi * (1 - t) + y0 * t);
                                break lo;
                            }
                            accumLength += l;
                        }
                        ctx.closePath();
                        xi = x0;
                        yi = y0;
                }
            }
        };
        PathProxy.prototype.clone = function () {
            var newProxy = new PathProxy();
            var data = this.data;
            newProxy.data = data.slice ? data.slice()
                : Array.prototype.slice.call(data);
            newProxy._len = this._len;
            return newProxy;
        };
        PathProxy.CMD = CMD$1;
        PathProxy.initDefaultProps = (function () {
            var proto = PathProxy.prototype;
            proto._saveData = true;
            proto._needsDash = false;
            proto._dashOffset = 0;
            proto._dashIdx = 0;
            proto._dashSum = 0;
            proto._ux = 0;
            proto._uy = 0;
            proto._pendingPtDist = 0;
            proto._version = 0;
        })();
        return PathProxy;
    }());

    var globalImageCache = new LRU(50);
    /**
     * Caution: User should cache loaded images, but not just count on LRU.
     * Consider if required images more than LRU size, will dead loop occur?
     *
     * @param newImageOrSrc
     * @param image Existent image.
     * @param hostEl For calling `dirty`.
     * @param onload params: (image, cbPayload)
     * @param cbPayload Payload on cb calling.
     * @return image
     */
    function createOrUpdateImage(newImageOrSrc, image, hostEl, onload, cbPayload) {
        if (!newImageOrSrc) {
            return image;
        }
        else if (typeof newImageOrSrc === 'string') {
            // Image should not be loaded repeatly.
            if ((image && image.__zrImageSrc === newImageOrSrc) || !hostEl) {
                return image;
            }
            // Only when there is no existent image or existent image src
            // is different, this method is responsible for load.
            var cachedImgObj = globalImageCache.get(newImageOrSrc);
            var pendingWrap = { hostEl: hostEl, cb: onload, cbPayload: cbPayload };
            if (cachedImgObj) {
                image = cachedImgObj.image;
                !isImageReady(image) && cachedImgObj.pending.push(pendingWrap);
            }
            else {
                image = new Image();
                image.onload = image.onerror = imageOnLoad;
                globalImageCache.put(newImageOrSrc, image.__cachedImgObj = {
                    image: image,
                    pending: [pendingWrap]
                });
                image.src = image.__zrImageSrc = newImageOrSrc;
            }
            return image;
        }
        // newImageOrSrc is an HTMLImageElement or HTMLCanvasElement or Canvas
        else {
            return newImageOrSrc;
        }
    }
    function imageOnLoad() {
        var cachedImgObj = this.__cachedImgObj;
        this.onload = this.onerror = this.__cachedImgObj = null;
        for (var i = 0; i < cachedImgObj.pending.length; i++) {
            var pendingWrap = cachedImgObj.pending[i];
            var cb = pendingWrap.cb;
            cb && cb(this, pendingWrap.cbPayload);
            pendingWrap.hostEl.dirty();
        }
        cachedImgObj.pending.length = 0;
    }
    function isImageReady(image) {
        return image && image.width && image.height;
    }

    /**
     * 线段包含判断
     * @param  {number}  x0
     * @param  {number}  y0
     * @param  {number}  x1
     * @param  {number}  y1
     * @param  {number}  lineWidth
     * @param  {number}  x
     * @param  {number}  y
     * @return {boolean}
     */
    function containStroke$4(x0, y0, x1, y1, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        var _a = 0;
        var _b = x0;
        // Quick reject
        if ((y > y0 + _l && y > y1 + _l)
            || (y < y0 - _l && y < y1 - _l)
            || (x > x0 + _l && x > x1 + _l)
            || (x < x0 - _l && x < x1 - _l)) {
            return false;
        }
        if (x0 !== x1) {
            _a = (y0 - y1) / (x0 - x1);
            _b = (x0 * y1 - x1 * y0) / (x0 - x1);
        }
        else {
            return Math.abs(x - x0) <= _l / 2;
        }
        var tmp = _a * x - y + _b;
        var _s = tmp * tmp / (_a * _a + 1);
        return _s <= _l / 2 * _l / 2;
    }

    /**
     * 三次贝塞尔曲线描边包含判断
     */
    function containStroke$3(x0, y0, x1, y1, x2, y2, x3, y3, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        // Quick reject
        if ((y > y0 + _l && y > y1 + _l && y > y2 + _l && y > y3 + _l)
            || (y < y0 - _l && y < y1 - _l && y < y2 - _l && y < y3 - _l)
            || (x > x0 + _l && x > x1 + _l && x > x2 + _l && x > x3 + _l)
            || (x < x0 - _l && x < x1 - _l && x < x2 - _l && x < x3 - _l)) {
            return false;
        }
        var d = cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, null);
        return d <= _l / 2;
    }

    /**
     * 二次贝塞尔曲线描边包含判断
     */
    function containStroke$2(x0, y0, x1, y1, x2, y2, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        // Quick reject
        if ((y > y0 + _l && y > y1 + _l && y > y2 + _l)
            || (y < y0 - _l && y < y1 - _l && y < y2 - _l)
            || (x > x0 + _l && x > x1 + _l && x > x2 + _l)
            || (x < x0 - _l && x < x1 - _l && x < x2 - _l)) {
            return false;
        }
        var d = quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, null);
        return d <= _l / 2;
    }

    var PI2$2 = Math.PI * 2;
    function normalizeRadian(angle) {
        angle %= PI2$2;
        if (angle < 0) {
            angle += PI2$2;
        }
        return angle;
    }

    var PI2$1 = Math.PI * 2;
    /**
     * 圆弧描边包含判断
     */
    function containStroke$1(cx, cy, r, startAngle, endAngle, anticlockwise, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        x -= cx;
        y -= cy;
        var d = Math.sqrt(x * x + y * y);
        if ((d - _l > r) || (d + _l < r)) {
            return false;
        }
        // TODO
        if (Math.abs(startAngle - endAngle) % PI2$1 < 1e-4) {
            // Is a circle
            return true;
        }
        if (anticlockwise) {
            var tmp = startAngle;
            startAngle = normalizeRadian(endAngle);
            endAngle = normalizeRadian(tmp);
        }
        else {
            startAngle = normalizeRadian(startAngle);
            endAngle = normalizeRadian(endAngle);
        }
        if (startAngle > endAngle) {
            endAngle += PI2$1;
        }
        var angle = Math.atan2(y, x);
        if (angle < 0) {
            angle += PI2$1;
        }
        return (angle >= startAngle && angle <= endAngle)
            || (angle + PI2$1 >= startAngle && angle + PI2$1 <= endAngle);
    }

    function windingLine(x0, y0, x1, y1, x, y) {
        if ((y > y0 && y > y1) || (y < y0 && y < y1)) {
            return 0;
        }
        // Ignore horizontal line
        if (y1 === y0) {
            return 0;
        }
        var t = (y - y0) / (y1 - y0);
        var dir = y1 < y0 ? 1 : -1;
        // Avoid winding error when intersection point is the connect point of two line of polygon
        if (t === 1 || t === 0) {
            dir = y1 < y0 ? 0.5 : -0.5;
        }
        var x_ = t * (x1 - x0) + x0;
        // If (x, y) on the line, considered as "contain".
        return x_ === x ? Infinity : x_ > x ? dir : 0;
    }

    var CMD = PathProxy.CMD;
    var PI2 = Math.PI * 2;
    var EPSILON = 1e-4;
    function isAroundEqual(a, b) {
        return Math.abs(a - b) < EPSILON;
    }
    // 临时数组
    var roots = [-1, -1, -1];
    var extrema = [-1, -1];
    function swapExtrema() {
        var tmp = extrema[0];
        extrema[0] = extrema[1];
        extrema[1] = tmp;
    }
    function windingCubic(x0, y0, x1, y1, x2, y2, x3, y3, x, y) {
        // Quick reject
        if ((y > y0 && y > y1 && y > y2 && y > y3)
            || (y < y0 && y < y1 && y < y2 && y < y3)) {
            return 0;
        }
        var nRoots = cubicRootAt(y0, y1, y2, y3, y, roots);
        if (nRoots === 0) {
            return 0;
        }
        else {
            var w = 0;
            var nExtrema = -1;
            var y0_ = void 0;
            var y1_ = void 0;
            for (var i = 0; i < nRoots; i++) {
                var t = roots[i];
                // Avoid winding error when intersection point is the connect point of two line of polygon
                var unit = (t === 0 || t === 1) ? 0.5 : 1;
                var x_ = cubicAt(x0, x1, x2, x3, t);
                if (x_ < x) { // Quick reject
                    continue;
                }
                if (nExtrema < 0) {
                    nExtrema = cubicExtrema(y0, y1, y2, y3, extrema);
                    if (extrema[1] < extrema[0] && nExtrema > 1) {
                        swapExtrema();
                    }
                    y0_ = cubicAt(y0, y1, y2, y3, extrema[0]);
                    if (nExtrema > 1) {
                        y1_ = cubicAt(y0, y1, y2, y3, extrema[1]);
                    }
                }
                if (nExtrema === 2) {
                    // 分成三段单调函数
                    if (t < extrema[0]) {
                        w += y0_ < y0 ? unit : -unit;
                    }
                    else if (t < extrema[1]) {
                        w += y1_ < y0_ ? unit : -unit;
                    }
                    else {
                        w += y3 < y1_ ? unit : -unit;
                    }
                }
                else {
                    // 分成两段单调函数
                    if (t < extrema[0]) {
                        w += y0_ < y0 ? unit : -unit;
                    }
                    else {
                        w += y3 < y0_ ? unit : -unit;
                    }
                }
            }
            return w;
        }
    }
    function windingQuadratic(x0, y0, x1, y1, x2, y2, x, y) {
        // Quick reject
        if ((y > y0 && y > y1 && y > y2)
            || (y < y0 && y < y1 && y < y2)) {
            return 0;
        }
        var nRoots = quadraticRootAt(y0, y1, y2, y, roots);
        if (nRoots === 0) {
            return 0;
        }
        else {
            var t = quadraticExtremum(y0, y1, y2);
            if (t >= 0 && t <= 1) {
                var w = 0;
                var y_ = quadraticAt(y0, y1, y2, t);
                for (var i = 0; i < nRoots; i++) {
                    // Remove one endpoint.
                    var unit = (roots[i] === 0 || roots[i] === 1) ? 0.5 : 1;
                    var x_ = quadraticAt(x0, x1, x2, roots[i]);
                    if (x_ < x) { // Quick reject
                        continue;
                    }
                    if (roots[i] < t) {
                        w += y_ < y0 ? unit : -unit;
                    }
                    else {
                        w += y2 < y_ ? unit : -unit;
                    }
                }
                return w;
            }
            else {
                // Remove one endpoint.
                var unit = (roots[0] === 0 || roots[0] === 1) ? 0.5 : 1;
                var x_ = quadraticAt(x0, x1, x2, roots[0]);
                if (x_ < x) { // Quick reject
                    return 0;
                }
                return y2 < y0 ? unit : -unit;
            }
        }
    }
    // TODO
    // Arc 旋转
    // startAngle, endAngle has been normalized by normalizeArcAngles
    function windingArc(cx, cy, r, startAngle, endAngle, anticlockwise, x, y) {
        y -= cy;
        if (y > r || y < -r) {
            return 0;
        }
        var tmp = Math.sqrt(r * r - y * y);
        roots[0] = -tmp;
        roots[1] = tmp;
        var dTheta = Math.abs(startAngle - endAngle);
        if (dTheta < 1e-4) {
            return 0;
        }
        if (dTheta >= PI2 - 1e-4) {
            // Is a circle
            startAngle = 0;
            endAngle = PI2;
            var dir = anticlockwise ? 1 : -1;
            if (x >= roots[0] + cx && x <= roots[1] + cx) {
                return dir;
            }
            else {
                return 0;
            }
        }
        if (startAngle > endAngle) {
            // Swap, make sure startAngle is smaller than endAngle.
            var tmp_1 = startAngle;
            startAngle = endAngle;
            endAngle = tmp_1;
        }
        // endAngle - startAngle is normalized to 0 - 2*PI.
        // So following will normalize them to 0 - 4*PI
        if (startAngle < 0) {
            startAngle += PI2;
            endAngle += PI2;
        }
        var w = 0;
        for (var i = 0; i < 2; i++) {
            var x_ = roots[i];
            if (x_ + cx > x) {
                var angle = Math.atan2(y, x_);
                var dir = anticlockwise ? 1 : -1;
                if (angle < 0) {
                    angle = PI2 + angle;
                }
                if ((angle >= startAngle && angle <= endAngle)
                    || (angle + PI2 >= startAngle && angle + PI2 <= endAngle)) {
                    if (angle > Math.PI / 2 && angle < Math.PI * 1.5) {
                        dir = -dir;
                    }
                    w += dir;
                }
            }
        }
        return w;
    }
    function containPath(path, lineWidth, isStroke, x, y) {
        var data = path.data;
        var len = path.len();
        var w = 0;
        var xi = 0;
        var yi = 0;
        var x0 = 0;
        var y0 = 0;
        var x1;
        var y1;
        for (var i = 0; i < len;) {
            var cmd = data[i++];
            var isFirst = i === 1;
            // Begin a new subpath
            if (cmd === CMD.M && i > 1) {
                // Close previous subpath
                if (!isStroke) {
                    w += windingLine(xi, yi, x0, y0, x, y);
                }
                // 如果被任何一个 subpath 包含
                // if (w !== 0) {
                //     return true;
                // }
            }
            if (isFirst) {
                // 如果第一个命令是 L, C, Q
                // 则 previous point 同绘制命令的第一个 point
                //
                // 第一个命令为 Arc 的情况下会在后面特殊处理
                xi = data[i];
                yi = data[i + 1];
                x0 = xi;
                y0 = yi;
            }
            switch (cmd) {
                case CMD.M:
                    // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
                    // 在 closePath 的时候使用
                    x0 = data[i++];
                    y0 = data[i++];
                    xi = x0;
                    yi = y0;
                    break;
                case CMD.L:
                    if (isStroke) {
                        if (containStroke$4(xi, yi, data[i], data[i + 1], lineWidth, x, y)) {
                            return true;
                        }
                    }
                    else {
                        // NOTE 在第一个命令为 L, C, Q 的时候会计算出 NaN
                        w += windingLine(xi, yi, data[i], data[i + 1], x, y) || 0;
                    }
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD.C:
                    if (isStroke) {
                        if (containStroke$3(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
                            return true;
                        }
                    }
                    else {
                        w += windingCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
                    }
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD.Q:
                    if (isStroke) {
                        if (containStroke$2(xi, yi, data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
                            return true;
                        }
                    }
                    else {
                        w += windingQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
                    }
                    xi = data[i++];
                    yi = data[i++];
                    break;
                case CMD.A:
                    // TODO Arc 判断的开销比较大
                    var cx = data[i++];
                    var cy = data[i++];
                    var rx = data[i++];
                    var ry = data[i++];
                    var theta = data[i++];
                    var dTheta = data[i++];
                    // TODO Arc 旋转
                    i += 1;
                    var anticlockwise = !!(1 - data[i++]);
                    x1 = Math.cos(theta) * rx + cx;
                    y1 = Math.sin(theta) * ry + cy;
                    // 不是直接使用 arc 命令
                    if (!isFirst) {
                        w += windingLine(xi, yi, x1, y1, x, y);
                    }
                    else {
                        // 第一个命令起点还未定义
                        x0 = x1;
                        y0 = y1;
                    }
                    // zr 使用scale来模拟椭圆, 这里也对x做一定的缩放
                    var _x = (x - cx) * ry / rx + cx;
                    if (isStroke) {
                        if (containStroke$1(cx, cy, ry, theta, theta + dTheta, anticlockwise, lineWidth, _x, y)) {
                            return true;
                        }
                    }
                    else {
                        w += windingArc(cx, cy, ry, theta, theta + dTheta, anticlockwise, _x, y);
                    }
                    xi = Math.cos(theta + dTheta) * rx + cx;
                    yi = Math.sin(theta + dTheta) * ry + cy;
                    break;
                case CMD.R:
                    x0 = xi = data[i++];
                    y0 = yi = data[i++];
                    var width = data[i++];
                    var height = data[i++];
                    x1 = x0 + width;
                    y1 = y0 + height;
                    if (isStroke) {
                        if (containStroke$4(x0, y0, x1, y0, lineWidth, x, y)
                            || containStroke$4(x1, y0, x1, y1, lineWidth, x, y)
                            || containStroke$4(x1, y1, x0, y1, lineWidth, x, y)
                            || containStroke$4(x0, y1, x0, y0, lineWidth, x, y)) {
                            return true;
                        }
                    }
                    else {
                        // FIXME Clockwise ?
                        w += windingLine(x1, y0, x1, y1, x, y);
                        w += windingLine(x0, y1, x0, y0, x, y);
                    }
                    break;
                case CMD.Z:
                    if (isStroke) {
                        if (containStroke$4(xi, yi, x0, y0, lineWidth, x, y)) {
                            return true;
                        }
                    }
                    else {
                        // Close a subpath
                        w += windingLine(xi, yi, x0, y0, x, y);
                        // 如果被任何一个 subpath 包含
                        // FIXME subpaths may overlap
                        // if (w !== 0) {
                        //     return true;
                        // }
                    }
                    xi = x0;
                    yi = y0;
                    break;
            }
        }
        if (!isStroke && !isAroundEqual(yi, y0)) {
            w += windingLine(xi, yi, x0, y0, x, y) || 0;
        }
        return w !== 0;
    }
    function contain(pathProxy, x, y) {
        return containPath(pathProxy, 0, false, x, y);
    }
    function containStroke(pathProxy, lineWidth, x, y) {
        return containPath(pathProxy, lineWidth, true, x, y);
    }

    var DEFAULT_PATH_STYLE = defaults({
        fill: '#000',
        stroke: null,
        strokePercent: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        lineDashOffset: 0,
        lineWidth: 1,
        lineCap: 'butt',
        miterLimit: 10,
        strokeNoScale: false,
        strokeFirst: false
    }, DEFAULT_COMMON_STYLE);
    var DEFAULT_PATH_ANIMATION_PROPS = {
        style: defaults({
            fill: true,
            stroke: true,
            strokePercent: true,
            fillOpacity: true,
            strokeOpacity: true,
            lineDashOffset: true,
            lineWidth: true,
            miterLimit: true
        }, DEFAULT_COMMON_ANIMATION_PROPS.style)
    };
    var pathCopyParams = [
        'x', 'y', 'rotation', 'scaleX', 'scaleY', 'originX', 'originY', 'invisible',
        'culling', 'z', 'z2', 'zlevel', 'parent'
    ];
    var Path = /** @class */ (function (_super) {
        __extends(Path, _super);
        function Path(opts) {
            return _super.call(this, opts) || this;
        }
        Path.prototype.update = function () {
            var _this = this;
            _super.prototype.update.call(this);
            var style = this.style;
            if (style.decal) {
                var decalEl = this._decalEl = this._decalEl || new Path();
                if (decalEl.buildPath === Path.prototype.buildPath) {
                    decalEl.buildPath = function (ctx) {
                        _this.buildPath(ctx, _this.shape);
                    };
                }
                decalEl.silent = true;
                var decalElStyle = decalEl.style;
                for (var key in style) {
                    if (decalElStyle[key] !== style[key]) {
                        decalElStyle[key] = style[key];
                    }
                }
                decalElStyle.fill = style.fill ? style.decal : null;
                decalElStyle.decal = null;
                decalElStyle.shadowColor = null;
                style.strokeFirst && (decalElStyle.stroke = null);
                for (var i = 0; i < pathCopyParams.length; ++i) {
                    decalEl[pathCopyParams[i]] = this[pathCopyParams[i]];
                }
                decalEl.__dirty |= REDRAW_BIT;
            }
            else if (this._decalEl) {
                this._decalEl = null;
            }
        };
        Path.prototype.getDecalElement = function () {
            return this._decalEl;
        };
        Path.prototype._init = function (props) {
            // Init default properties
            var keysArr = keys(props);
            this.shape = this.getDefaultShape();
            var defaultStyle = this.getDefaultStyle();
            if (defaultStyle) {
                this.useStyle(defaultStyle);
            }
            for (var i = 0; i < keysArr.length; i++) {
                var key = keysArr[i];
                var value = props[key];
                if (key === 'style') {
                    if (!this.style) {
                        // PENDING Reuse style object if possible?
                        this.useStyle(value);
                    }
                    else {
                        extend(this.style, value);
                    }
                }
                else if (key === 'shape') {
                    // this.shape = value;
                    extend(this.shape, value);
                }
                else {
                    _super.prototype.attrKV.call(this, key, value);
                }
            }
            // Create an empty one if no style object exists.
            if (!this.style) {
                this.useStyle({});
            }
            // const defaultShape = this.getDefaultShape();
            // if (!this.shape) {
            //     this.shape = defaultShape;
            // }
            // else {
            //     defaults(this.shape, defaultShape);
            // }
        };
        Path.prototype.getDefaultStyle = function () {
            return null;
        };
        // Needs to override
        Path.prototype.getDefaultShape = function () {
            return {};
        };
        Path.prototype.canBeInsideText = function () {
            return this.hasFill();
        };
        Path.prototype.getInsideTextFill = function () {
            var pathFill = this.style.fill;
            if (pathFill !== 'none') {
                if (isString(pathFill)) {
                    var fillLum = lum(pathFill, 0);
                    // Determin text color based on the lum of path fill.
                    // TODO use (1 - DARK_MODE_THRESHOLD)?
                    if (fillLum > 0.5) { // TODO Consider background lum?
                        return DARK_LABEL_COLOR;
                    }
                    else if (fillLum > 0.2) {
                        return LIGHTER_LABEL_COLOR;
                    }
                    return LIGHT_LABEL_COLOR;
                }
                else if (pathFill) {
                    return LIGHT_LABEL_COLOR;
                }
            }
            return DARK_LABEL_COLOR;
        };
        Path.prototype.getInsideTextStroke = function (textFill) {
            var pathFill = this.style.fill;
            // Not stroke on none fill object or gradient object
            if (isString(pathFill)) {
                var zr = this.__zr;
                var isDarkMode = !!(zr && zr.isDarkMode());
                var isDarkLabel = lum(textFill, 0) < DARK_MODE_THRESHOLD;
                // All dark or all light.
                if (isDarkMode === isDarkLabel) {
                    return pathFill;
                }
            }
        };
        // When bundling path, some shape may decide if use moveTo to begin a new subpath or closePath
        // Like in circle
        Path.prototype.buildPath = function (ctx, shapeCfg, inBatch) { };
        Path.prototype.pathUpdated = function () {
            this.__dirty &= ~SHAPE_CHANGED_BIT;
        };
        Path.prototype.getUpdatedPathProxy = function (inBatch) {
            // Update path proxy data to latest.
            !this.path && this.createPathProxy();
            this.path.beginPath();
            this.buildPath(this.path, this.shape, inBatch);
            return this.path;
        };
        Path.prototype.createPathProxy = function () {
            this.path = new PathProxy(false);
        };
        Path.prototype.hasStroke = function () {
            var style = this.style;
            var stroke = style.stroke;
            return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0));
        };
        Path.prototype.hasFill = function () {
            var style = this.style;
            var fill = style.fill;
            return fill != null && fill !== 'none';
        };
        Path.prototype.getBoundingRect = function () {
            var rect = this._rect;
            var style = this.style;
            var needsUpdateRect = !rect;
            if (needsUpdateRect) {
                var firstInvoke = false;
                if (!this.path) {
                    firstInvoke = true;
                    // Create path on demand.
                    this.createPathProxy();
                }
                var path = this.path;
                if (firstInvoke || (this.__dirty & SHAPE_CHANGED_BIT)) {
                    path.beginPath();
                    this.buildPath(path, this.shape, false);
                    this.pathUpdated();
                }
                rect = path.getBoundingRect();
            }
            this._rect = rect;
            if (this.hasStroke() && this.path && this.path.len() > 0) {
                // Needs update rect with stroke lineWidth when
                // 1. Element changes scale or lineWidth
                // 2. Shape is changed
                var rectWithStroke = this._rectWithStroke || (this._rectWithStroke = rect.clone());
                if (this.__dirty || needsUpdateRect) {
                    rectWithStroke.copy(rect);
                    // PENDING, Min line width is needed when line is horizontal or vertical
                    var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
                    // FIXME Must after updateTransform
                    var w = style.lineWidth;
                    // Only add extra hover lineWidth when there are no fill
                    if (!this.hasFill()) {
                        var strokeContainThreshold = this.strokeContainThreshold;
                        w = Math.max(w, strokeContainThreshold == null ? 4 : strokeContainThreshold);
                    }
                    // Consider line width
                    // Line scale can't be 0;
                    if (lineScale > 1e-10) {
                        rectWithStroke.width += w / lineScale;
                        rectWithStroke.height += w / lineScale;
                        rectWithStroke.x -= w / lineScale / 2;
                        rectWithStroke.y -= w / lineScale / 2;
                    }
                }
                // Return rect with stroke
                return rectWithStroke;
            }
            return rect;
        };
        Path.prototype.contain = function (x, y) {
            var localPos = this.transformCoordToLocal(x, y);
            var rect = this.getBoundingRect();
            var style = this.style;
            x = localPos[0];
            y = localPos[1];
            if (rect.contain(x, y)) {
                var pathProxy = this.path;
                if (this.hasStroke()) {
                    var lineWidth = style.lineWidth;
                    var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
                    // Line scale can't be 0;
                    if (lineScale > 1e-10) {
                        // Only add extra hover lineWidth when there are no fill
                        if (!this.hasFill()) {
                            lineWidth = Math.max(lineWidth, this.strokeContainThreshold);
                        }
                        if (containStroke(pathProxy, lineWidth / lineScale, x, y)) {
                            return true;
                        }
                    }
                }
                if (this.hasFill()) {
                    return contain(pathProxy, x, y);
                }
            }
            return false;
        };
        /**
         * Shape changed
         */
        Path.prototype.dirtyShape = function () {
            this.__dirty |= SHAPE_CHANGED_BIT;
            if (this._rect) {
                this._rect = null;
            }
            if (this._decalEl) {
                this._decalEl.dirtyShape();
            }
            this.markRedraw();
        };
        Path.prototype.dirty = function () {
            this.dirtyStyle();
            this.dirtyShape();
        };
        /**
         * Alias for animate('shape')
         * @param {boolean} loop
         */
        Path.prototype.animateShape = function (loop) {
            return this.animate('shape', loop);
        };
        // Override updateDuringAnimation
        Path.prototype.updateDuringAnimation = function (targetKey) {
            if (targetKey === 'style') {
                this.dirtyStyle();
            }
            else if (targetKey === 'shape') {
                this.dirtyShape();
            }
            else {
                this.markRedraw();
            }
        };
        // Overwrite attrKV
        Path.prototype.attrKV = function (key, value) {
            // FIXME
            if (key === 'shape') {
                this.setShape(value);
            }
            else {
                _super.prototype.attrKV.call(this, key, value);
            }
        };
        Path.prototype.setShape = function (keyOrObj, value) {
            var shape = this.shape;
            if (!shape) {
                shape = this.shape = {};
            }
            // Path from string may not have shape
            if (typeof keyOrObj === 'string') {
                shape[keyOrObj] = value;
            }
            else {
                extend(shape, keyOrObj);
            }
            this.dirtyShape();
            return this;
        };
        /**
         * If shape changed. used with dirtyShape
         */
        Path.prototype.shapeChanged = function () {
            return !!(this.__dirty & SHAPE_CHANGED_BIT);
        };
        /**
         * Create a path style object with default values in it's prototype.
         * @override
         */
        Path.prototype.createStyle = function (obj) {
            return createObject(DEFAULT_PATH_STYLE, obj);
        };
        Path.prototype._innerSaveToNormal = function (toState) {
            _super.prototype._innerSaveToNormal.call(this, toState);
            var normalState = this._normalState;
            // Clone a new one. DON'T share object reference between states and current using.
            // TODO: Clone array in shape?.
            // TODO: Only save changed shape.
            if (toState.shape && !normalState.shape) {
                normalState.shape = extend({}, this.shape);
            }
        };
        Path.prototype._applyStateObj = function (stateName, state, normalState, keepCurrentStates, transition, animationCfg) {
            _super.prototype._applyStateObj.call(this, stateName, state, normalState, keepCurrentStates, transition, animationCfg);
            var needsRestoreToNormal = !(state && keepCurrentStates);
            var targetShape;
            if (state && state.shape) {
                // Only animate changed properties.
                if (transition) {
                    if (keepCurrentStates) {
                        targetShape = state.shape;
                    }
                    else {
                        // Inherits from normal state.
                        targetShape = extend({}, normalState.shape);
                        extend(targetShape, state.shape);
                    }
                }
                else {
                    // Because the shape will be replaced. So inherits from current shape.
                    targetShape = extend({}, keepCurrentStates ? this.shape : normalState.shape);
                    extend(targetShape, state.shape);
                }
            }
            else if (needsRestoreToNormal) {
                targetShape = normalState.shape;
            }
            if (targetShape) {
                if (transition) {
                    // Clone a new shape.
                    this.shape = extend({}, this.shape);
                    // Only supports transition on primary props. Because shape is not deep cloned.
                    var targetShapePrimaryProps = {};
                    var shapeKeys = keys(targetShape);
                    for (var i = 0; i < shapeKeys.length; i++) {
                        var key = shapeKeys[i];
                        if (typeof targetShape[key] === 'object') {
                            this.shape[key] = targetShape[key];
                        }
                        else {
                            targetShapePrimaryProps[key] = targetShape[key];
                        }
                    }
                    this._transitionState(stateName, {
                        shape: targetShapePrimaryProps
                    }, animationCfg);
                }
                else {
                    this.shape = targetShape;
                    this.dirtyShape();
                }
            }
        };
        Path.prototype._mergeStates = function (states) {
            var mergedState = _super.prototype._mergeStates.call(this, states);
            var mergedShape;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state.shape) {
                    mergedShape = mergedShape || {};
                    this._mergeStyle(mergedShape, state.shape);
                }
            }
            if (mergedShape) {
                mergedState.shape = mergedShape;
            }
            return mergedState;
        };
        Path.prototype.getAnimationStyleProps = function () {
            return DEFAULT_PATH_ANIMATION_PROPS;
        };
        /**
         * If path shape is zero area
         */
        Path.prototype.isZeroArea = function () {
            return false;
        };
        /**
         * 扩展一个 Path element, 比如星形，圆等。
         * Extend a path element
         * @DEPRECATED Use class extends
         * @param props
         * @param props.type Path type
         * @param props.init Initialize
         * @param props.buildPath Overwrite buildPath method
         * @param props.style Extended default style config
         * @param props.shape Extended default shape config
         */
        Path.extend = function (defaultProps) {
            var Sub = /** @class */ (function (_super) {
                __extends(Sub, _super);
                function Sub(opts) {
                    var _this = _super.call(this, opts) || this;
                    defaultProps.init && defaultProps.init.call(_this, opts);
                    return _this;
                }
                Sub.prototype.getDefaultStyle = function () {
                    return clone(defaultProps.style);
                };
                Sub.prototype.getDefaultShape = function () {
                    return clone(defaultProps.shape);
                };
                return Sub;
            }(Path));
            // TODO Legacy usage. Extend functions
            for (var key in defaultProps) {
                if (typeof defaultProps[key] === 'function') {
                    Sub.prototype[key] = defaultProps[key];
                }
            }
            // Sub.prototype.buildPath = defaultProps.buildPath;
            // Sub.prototype.beforeBrush = defaultProps.beforeBrush;
            // Sub.prototype.afterBrush = defaultProps.afterBrush;
            return Sub;
        };
        Path.initDefaultProps = (function () {
            var pathProto = Path.prototype;
            pathProto.type = 'path';
            pathProto.strokeContainThreshold = 5;
            pathProto.segmentIgnoreThreshold = 0;
            pathProto.subPixelOptimize = false;
            pathProto.autoBatch = false;
            pathProto.__dirty = REDRAW_BIT | STYLE_CHANGED_BIT | SHAPE_CHANGED_BIT;
        })();
        return Path;
    }(Displayable));

    var DEFAULT_IMAGE_STYLE = defaults({
        x: 0,
        y: 0
    }, DEFAULT_COMMON_STYLE);
    var DEFAULT_IMAGE_ANIMATION_PROPS = {
        style: defaults({
            x: true,
            y: true,
            width: true,
            height: true,
            sx: true,
            sy: true,
            sWidth: true,
            sHeight: true
        }, DEFAULT_COMMON_ANIMATION_PROPS.style)
    };
    function isImageLike(source) {
        return !!(source
            && typeof source !== 'string'
            // Image source is an image, canvas, video.
            && source.width && source.height);
    }
    var ZRImage = /** @class */ (function (_super) {
        __extends(ZRImage, _super);
        function ZRImage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Create an image style object with default values in it's prototype.
         * @override
         */
        ZRImage.prototype.createStyle = function (obj) {
            return createObject(DEFAULT_IMAGE_STYLE, obj);
        };
        ZRImage.prototype._getSize = function (dim) {
            var style = this.style;
            var size = style[dim];
            if (size != null) {
                return size;
            }
            var imageSource = isImageLike(style.image)
                ? style.image : this.__image;
            if (!imageSource) {
                return 0;
            }
            var otherDim = dim === 'width' ? 'height' : 'width';
            var otherDimSize = style[otherDim];
            if (otherDimSize == null) {
                return imageSource[dim];
            }
            else {
                return imageSource[dim] / imageSource[otherDim] * otherDimSize;
            }
        };
        ZRImage.prototype.getWidth = function () {
            return this._getSize('width');
        };
        ZRImage.prototype.getHeight = function () {
            return this._getSize('height');
        };
        ZRImage.prototype.getAnimationStyleProps = function () {
            return DEFAULT_IMAGE_ANIMATION_PROPS;
        };
        ZRImage.prototype.getBoundingRect = function () {
            var style = this.style;
            if (!this._rect) {
                this._rect = new BoundingRect(style.x || 0, style.y || 0, this.getWidth(), this.getHeight());
            }
            return this._rect;
        };
        return ZRImage;
    }(Displayable));
    ZRImage.prototype.type = 'image';

    var DEFAULT_TSPAN_STYLE = defaults({
        strokeFirst: true,
        font: DEFAULT_FONT,
        x: 0,
        y: 0,
        textAlign: 'left',
        textBaseline: 'top',
        miterLimit: 2
    }, DEFAULT_PATH_STYLE);
    var TSpan = /** @class */ (function (_super) {
        __extends(TSpan, _super);
        function TSpan() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TSpan.prototype.hasStroke = function () {
            var style = this.style;
            var stroke = style.stroke;
            return stroke != null && stroke !== 'none' && style.lineWidth > 0;
        };
        TSpan.prototype.hasFill = function () {
            var style = this.style;
            var fill = style.fill;
            return fill != null && fill !== 'none';
        };
        /**
         * Create an image style object with default values in it's prototype.
         * @override
         */
        TSpan.prototype.createStyle = function (obj) {
            return createObject(DEFAULT_TSPAN_STYLE, obj);
        };
        /**
         * Set bounding rect calculated from Text
         * For reducing time of calculating bounding rect.
         */
        TSpan.prototype.setBoundingRect = function (rect) {
            this._rect = rect;
        };
        TSpan.prototype.getBoundingRect = function () {
            var style = this.style;
            if (!this._rect) {
                var text = style.text;
                text != null ? (text += '') : (text = '');
                var rect = getBoundingRect(text, style.font, style.textAlign, style.textBaseline);
                rect.x += style.x || 0;
                rect.y += style.y || 0;
                if (this.hasStroke()) {
                    var w = style.lineWidth;
                    rect.x -= w / 2;
                    rect.y -= w / 2;
                    rect.width += w;
                    rect.height += w;
                }
                this._rect = rect;
            }
            return this._rect;
        };
        TSpan.initDefaultProps = (function () {
            var tspanProto = TSpan.prototype;
            // TODO Calculate tolerance smarter
            tspanProto.dirtyRectTolerance = 10;
        })();
        return TSpan;
    }(Displayable));
    TSpan.prototype.type = 'tspan';

    function normalizeLineDash(lineType, lineWidth) {
        if (!lineType || lineType === 'solid' || !(lineWidth > 0)) {
            return null;
        }
        lineWidth = lineWidth || 1;
        return lineType === 'dashed'
            ? [4 * lineWidth, 2 * lineWidth]
            : lineType === 'dotted'
                ? [lineWidth]
                : isNumber(lineType)
                    ? [lineType] : isArray(lineType) ? lineType : null;
    }

    var m = [];
    // TODO Style override ?
    var IncrementalDisplayable = /** @class */ (function (_super) {
        __extends(IncrementalDisplayable, _super);
        function IncrementalDisplayable() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.notClear = true;
            _this.incremental = true;
            _this._displayables = [];
            _this._temporaryDisplayables = [];
            _this._cursor = 0;
            return _this;
        }
        IncrementalDisplayable.prototype.traverse = function (cb, context) {
            cb.call(context, this);
        };
        IncrementalDisplayable.prototype.useStyle = function () {
            // Use an empty style
            // PENDING
            this.style = {};
        };
        // getCurrentCursor / updateCursorAfterBrush
        // is used in graphic.ts. It's not provided for developers
        IncrementalDisplayable.prototype.getCursor = function () {
            return this._cursor;
        };
        // Update cursor after brush.
        IncrementalDisplayable.prototype.innerAfterBrush = function () {
            this._cursor = this._displayables.length;
        };
        IncrementalDisplayable.prototype.clearDisplaybles = function () {
            this._displayables = [];
            this._temporaryDisplayables = [];
            this._cursor = 0;
            this.markRedraw();
            this.notClear = false;
        };
        IncrementalDisplayable.prototype.clearTemporalDisplayables = function () {
            this._temporaryDisplayables = [];
        };
        IncrementalDisplayable.prototype.addDisplayable = function (displayable, notPersistent) {
            if (notPersistent) {
                this._temporaryDisplayables.push(displayable);
            }
            else {
                this._displayables.push(displayable);
            }
            this.markRedraw();
        };
        IncrementalDisplayable.prototype.addDisplayables = function (displayables, notPersistent) {
            notPersistent = notPersistent || false;
            for (var i = 0; i < displayables.length; i++) {
                this.addDisplayable(displayables[i], notPersistent);
            }
        };
        IncrementalDisplayable.prototype.getDisplayables = function () {
            return this._displayables;
        };
        IncrementalDisplayable.prototype.getTemporalDisplayables = function () {
            return this._temporaryDisplayables;
        };
        IncrementalDisplayable.prototype.eachPendingDisplayable = function (cb) {
            for (var i = this._cursor; i < this._displayables.length; i++) {
                cb && cb(this._displayables[i]);
            }
            for (var i = 0; i < this._temporaryDisplayables.length; i++) {
                cb && cb(this._temporaryDisplayables[i]);
            }
        };
        IncrementalDisplayable.prototype.update = function () {
            this.updateTransform();
            for (var i = this._cursor; i < this._displayables.length; i++) {
                var displayable = this._displayables[i];
                // PENDING
                displayable.parent = this;
                displayable.update();
                displayable.parent = null;
            }
            for (var i = 0; i < this._temporaryDisplayables.length; i++) {
                var displayable = this._temporaryDisplayables[i];
                // PENDING
                displayable.parent = this;
                displayable.update();
                displayable.parent = null;
            }
        };
        IncrementalDisplayable.prototype.getBoundingRect = function () {
            if (!this._rect) {
                var rect = new BoundingRect(Infinity, Infinity, -Infinity, -Infinity);
                for (var i = 0; i < this._displayables.length; i++) {
                    var displayable = this._displayables[i];
                    var childRect = displayable.getBoundingRect().clone();
                    if (displayable.needLocalTransform()) {
                        childRect.applyTransform(displayable.getLocalTransform(m));
                    }
                    rect.union(childRect);
                }
                this._rect = rect;
            }
            return this._rect;
        };
        IncrementalDisplayable.prototype.contain = function (x, y) {
            var localPos = this.transformCoordToLocal(x, y);
            var rect = this.getBoundingRect();
            if (rect.contain(localPos[0], localPos[1])) {
                for (var i = 0; i < this._displayables.length; i++) {
                    var displayable = this._displayables[i];
                    if (displayable.contain(x, y)) {
                        return true;
                    }
                }
            }
            return false;
        };
        return IncrementalDisplayable;
    }(Displayable));

    var pathProxyForDraw = new PathProxy(true);
    // Not use el#hasStroke because style may be different.
    function styleHasStroke(style) {
        var stroke = style.stroke;
        return !(stroke == null || stroke === 'none' || !(style.lineWidth > 0));
    }
    // ignore lineWidth and must be string
    // Expected color but found '[' when color is gradient
    function isValidStrokeFillStyle(strokeOrFill) {
        return typeof strokeOrFill === 'string' && strokeOrFill !== 'none';
    }
    function styleHasFill(style) {
        var fill = style.fill;
        return fill != null && fill !== 'none';
    }
    function doFillPath(ctx, style) {
        if (style.fillOpacity != null && style.fillOpacity !== 1) {
            var originalGlobalAlpha = ctx.globalAlpha;
            ctx.globalAlpha = style.fillOpacity * style.opacity;
            ctx.fill();
            // Set back globalAlpha
            ctx.globalAlpha = originalGlobalAlpha;
        }
        else {
            ctx.fill();
        }
    }
    function doStrokePath(ctx, style) {
        if (style.strokeOpacity != null && style.strokeOpacity !== 1) {
            var originalGlobalAlpha = ctx.globalAlpha;
            ctx.globalAlpha = style.strokeOpacity * style.opacity;
            ctx.stroke();
            // Set back globalAlpha
            ctx.globalAlpha = originalGlobalAlpha;
        }
        else {
            ctx.stroke();
        }
    }
    function createCanvasPattern(ctx, pattern, el) {
        var image = createOrUpdateImage(pattern.image, pattern.__image, el);
        if (isImageReady(image)) {
            var canvasPattern = ctx.createPattern(image, pattern.repeat || 'repeat');
            if (typeof DOMMatrix === 'function'
                && canvasPattern.setTransform // setTransform may not be supported in some old devices.
            ) {
                var matrix = new DOMMatrix();
                matrix.rotateSelf(0, 0, (pattern.rotation || 0) / Math.PI * 180);
                matrix.scaleSelf((pattern.scaleX || 1), (pattern.scaleY || 1));
                matrix.translateSelf((pattern.x || 0), (pattern.y || 0));
                canvasPattern.setTransform(matrix);
            }
            return canvasPattern;
        }
    }
    // Draw Path Elements
    function brushPath(ctx, el, style, inBatch) {
        var hasStroke = styleHasStroke(style);
        var hasFill = styleHasFill(style);
        var strokePercent = style.strokePercent;
        var strokePart = strokePercent < 1;
        // TODO Reduce path memory cost.
        var firstDraw = !el.path;
        // Create path for each element when:
        // 1. Element has interactions.
        // 2. Element draw part of the line.
        if ((!el.silent || strokePart) && firstDraw) {
            el.createPathProxy();
        }
        var path = el.path || pathProxyForDraw;
        if (!inBatch) {
            var fill = style.fill;
            var stroke = style.stroke;
            var hasFillGradient = hasFill && !!fill.colorStops;
            var hasStrokeGradient = hasStroke && !!stroke.colorStops;
            var hasFillPattern = hasFill && !!fill.image;
            var hasStrokePattern = hasStroke && !!stroke.image;
            var fillGradient = void 0;
            var strokeGradient = void 0;
            var fillPattern = void 0;
            var strokePattern = void 0;
            var rect = void 0;
            if (hasFillGradient || hasStrokeGradient) {
                rect = el.getBoundingRect();
            }
            // Update gradient because bounding rect may changed
            if (hasFillGradient) {
                fillGradient = el.__dirty
                    ? getCanvasGradient(ctx, fill, rect)
                    : el.__canvasFillGradient;
                // No need to clear cache when fill is not gradient.
                // It will always been updated when fill changed back to gradient.
                el.__canvasFillGradient = fillGradient;
            }
            if (hasStrokeGradient) {
                strokeGradient = el.__dirty
                    ? getCanvasGradient(ctx, stroke, rect)
                    : el.__canvasStrokeGradient;
                el.__canvasStrokeGradient = strokeGradient;
            }
            if (hasFillPattern) {
                // Pattern might be null if image not ready (even created from dataURI)
                fillPattern = (el.__dirty || !el.__canvasFillPattern)
                    ? createCanvasPattern(ctx, fill, el)
                    : el.__canvasFillPattern;
                el.__canvasFillPattern = fillPattern;
            }
            if (hasStrokePattern) {
                // Pattern might be null if image not ready (even created from dataURI)
                strokePattern = (el.__dirty || !el.__canvasStrokePattern)
                    ? createCanvasPattern(ctx, stroke, el)
                    : el.__canvasStrokePattern;
                el.__canvasStrokePattern = fillPattern;
            }
            // Use the gradient or pattern
            if (hasFillGradient) {
                // PENDING If may have affect the state
                ctx.fillStyle = fillGradient;
            }
            else if (hasFillPattern) {
                if (fillPattern) { // createCanvasPattern may return false if image is not ready.
                    ctx.fillStyle = fillPattern;
                }
                else {
                    // Don't fill if image is not ready
                    hasFill = false;
                }
            }
            if (hasStrokeGradient) {
                ctx.strokeStyle = strokeGradient;
            }
            else if (hasStrokePattern) {
                if (strokePattern) {
                    ctx.strokeStyle = strokePattern;
                }
                else {
                    // Don't stroke if image is not ready
                    hasStroke = false;
                }
            }
        }
        var lineDash = style.lineDash && style.lineWidth > 0 && normalizeLineDash(style.lineDash, style.lineWidth);
        var lineDashOffset = style.lineDashOffset;
        var ctxLineDash = !!ctx.setLineDash;
        // Update path sx, sy
        var scale = el.getGlobalScale();
        path.setScale(scale[0], scale[1], el.segmentIgnoreThreshold);
        if (lineDash) {
            var lineScale_1 = (style.strokeNoScale && el.getLineScale) ? el.getLineScale() : 1;
            if (lineScale_1 && lineScale_1 !== 1) {
                lineDash = map(lineDash, function (rawVal) {
                    return rawVal / lineScale_1;
                });
                lineDashOffset /= lineScale_1;
            }
        }
        var needsRebuild = true;
        // Proxy context
        // Rebuild path in following 2 cases
        // 1. Path is dirty
        // 2. Path needs javascript implemented lineDash stroking.
        //    In this case, lineDash information will not be saved in PathProxy
        if (firstDraw || (el.__dirty & SHAPE_CHANGED_BIT)
            || (lineDash && !ctxLineDash && hasStroke)) {
            path.setDPR(ctx.dpr);
            if (strokePart) {
                // Use rebuildPath for percent stroke, so no context.
                path.setContext(null);
            }
            else {
                path.setContext(ctx);
                needsRebuild = false;
            }
            path.reset();
            // Setting line dash before build path
            if (lineDash && !ctxLineDash) {
                path.setLineDash(lineDash);
                path.setLineDashOffset(lineDashOffset);
            }
            el.buildPath(path, el.shape, inBatch);
            path.toStatic();
            // Clear path dirty flag
            el.pathUpdated();
        }
        // Not support separate fill and stroke. For the compatibility of SVG
        if (needsRebuild) {
            path.rebuildPath(ctx, strokePart ? strokePercent : 1);
        }
        if (lineDash && ctxLineDash) {
            ctx.setLineDash(lineDash);
            ctx.lineDashOffset = lineDashOffset;
        }
        if (!inBatch) {
            if (style.strokeFirst) {
                if (hasStroke) {
                    doStrokePath(ctx, style);
                }
                if (hasFill) {
                    doFillPath(ctx, style);
                }
            }
            else {
                if (hasFill) {
                    doFillPath(ctx, style);
                }
                if (hasStroke) {
                    doStrokePath(ctx, style);
                }
            }
        }
        if (lineDash && ctxLineDash) {
            // PENDING
            // Remove lineDash
            ctx.setLineDash([]);
        }
    }
    // Draw Image Elements
    function brushImage(ctx, el, style) {
        var image = el.__image = createOrUpdateImage(style.image, el.__image, el, el.onload);
        if (!image || !isImageReady(image)) {
            return;
        }
        var x = style.x || 0;
        var y = style.y || 0;
        var width = el.getWidth();
        var height = el.getHeight();
        var aspect = image.width / image.height;
        if (width == null && height != null) {
            // Keep image/height ratio
            width = height * aspect;
        }
        else if (height == null && width != null) {
            height = width / aspect;
        }
        else if (width == null && height == null) {
            width = image.width;
            height = image.height;
        }
        if (style.sWidth && style.sHeight) {
            var sx = style.sx || 0;
            var sy = style.sy || 0;
            ctx.drawImage(image, sx, sy, style.sWidth, style.sHeight, x, y, width, height);
        }
        else if (style.sx && style.sy) {
            var sx = style.sx;
            var sy = style.sy;
            var sWidth = width - sx;
            var sHeight = height - sy;
            ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
        }
        else {
            ctx.drawImage(image, x, y, width, height);
        }
    }
    // Draw Text Elements
    function brushText(ctx, el, style) {
        var text = style.text;
        // Convert to string
        text != null && (text += '');
        if (text) {
            ctx.font = style.font || DEFAULT_FONT;
            ctx.textAlign = style.textAlign;
            ctx.textBaseline = style.textBaseline;
            var hasLineDash = void 0;
            if (ctx.setLineDash) {
                var lineDash = style.lineDash && style.lineWidth > 0 && normalizeLineDash(style.lineDash, style.lineWidth);
                var lineDashOffset = style.lineDashOffset;
                if (lineDash) {
                    var lineScale_2 = (style.strokeNoScale && el.getLineScale) ? el.getLineScale() : 1;
                    if (lineScale_2 && lineScale_2 !== 1) {
                        lineDash = map(lineDash, function (rawVal) {
                            return rawVal / lineScale_2;
                        });
                        lineDashOffset /= lineScale_2;
                    }
                    ctx.setLineDash(lineDash);
                    ctx.lineDashOffset = lineDashOffset;
                    hasLineDash = true;
                }
            }
            if (style.strokeFirst) {
                if (styleHasStroke(style)) {
                    ctx.strokeText(text, style.x, style.y);
                }
                if (styleHasFill(style)) {
                    ctx.fillText(text, style.x, style.y);
                }
            }
            else {
                if (styleHasFill(style)) {
                    ctx.fillText(text, style.x, style.y);
                }
                if (styleHasStroke(style)) {
                    ctx.strokeText(text, style.x, style.y);
                }
            }
            if (hasLineDash) {
                // Remove lineDash
                ctx.setLineDash([]);
            }
        }
    }
    var SHADOW_NUMBER_PROPS = ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];
    var STROKE_PROPS = [
        ['lineCap', 'butt'], ['lineJoin', 'miter'], ['miterLimit', 10]
    ];
    // type ShadowPropNames = typeof SHADOW_PROPS[number][0];
    // type StrokePropNames = typeof STROKE_PROPS[number][0];
    // type DrawPropNames = typeof DRAW_PROPS[number][0];
    function bindCommonProps(ctx, style, prevStyle, forceSetAll, scope) {
        var styleChanged = false;
        if (!forceSetAll) {
            prevStyle = prevStyle || {};
            // Shared same style.
            if (style === prevStyle) {
                return false;
            }
        }
        if (forceSetAll || style.opacity !== prevStyle.opacity) {
            if (!styleChanged) {
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            // Ensure opacity is between 0 ~ 1. Invalid opacity will lead to a failure set and use the leaked opacity from the previous.
            var opacity = Math.max(Math.min(style.opacity, 1), 0);
            ctx.globalAlpha = isNaN(opacity) ? DEFAULT_COMMON_STYLE.opacity : opacity;
        }
        if (forceSetAll || style.blend !== prevStyle.blend) {
            if (!styleChanged) {
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            ctx.globalCompositeOperation = style.blend || DEFAULT_COMMON_STYLE.blend;
        }
        for (var i = 0; i < SHADOW_NUMBER_PROPS.length; i++) {
            var propName = SHADOW_NUMBER_PROPS[i];
            if (forceSetAll || style[propName] !== prevStyle[propName]) {
                if (!styleChanged) {
                    flushPathDrawn(ctx, scope);
                    styleChanged = true;
                }
                // FIXME Invalid property value will cause style leak from previous element.
                ctx[propName] = ctx.dpr * (style[propName] || 0);
            }
        }
        if (forceSetAll || style.shadowColor !== prevStyle.shadowColor) {
            if (!styleChanged) {
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            ctx.shadowColor = style.shadowColor || DEFAULT_COMMON_STYLE.shadowColor;
        }
        return styleChanged;
    }
    function bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetAll, scope) {
        var style = getStyle(el, scope.inHover);
        var prevStyle = forceSetAll
            ? null
            : (prevEl && getStyle(prevEl, scope.inHover) || {});
        // Shared same style. prevStyle will be null if forceSetAll.
        if (style === prevStyle) {
            return false;
        }
        var styleChanged = bindCommonProps(ctx, style, prevStyle, forceSetAll, scope);
        if (forceSetAll || style.fill !== prevStyle.fill) {
            if (!styleChanged) {
                // Flush before set
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            isValidStrokeFillStyle(style.fill) && (ctx.fillStyle = style.fill);
        }
        if (forceSetAll || style.stroke !== prevStyle.stroke) {
            if (!styleChanged) {
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            isValidStrokeFillStyle(style.stroke) && (ctx.strokeStyle = style.stroke);
        }
        if (forceSetAll || style.opacity !== prevStyle.opacity) {
            if (!styleChanged) {
                flushPathDrawn(ctx, scope);
                styleChanged = true;
            }
            ctx.globalAlpha = style.opacity == null ? 1 : style.opacity;
        }
        if (el.hasStroke()) {
            var lineWidth = style.lineWidth;
            var newLineWidth = lineWidth / ((style.strokeNoScale && el && el.getLineScale) ? el.getLineScale() : 1);
            if (ctx.lineWidth !== newLineWidth) {
                if (!styleChanged) {
                    flushPathDrawn(ctx, scope);
                    styleChanged = true;
                }
                ctx.lineWidth = newLineWidth;
            }
        }
        for (var i = 0; i < STROKE_PROPS.length; i++) {
            var prop = STROKE_PROPS[i];
            var propName = prop[0];
            if (forceSetAll || style[propName] !== prevStyle[propName]) {
                if (!styleChanged) {
                    flushPathDrawn(ctx, scope);
                    styleChanged = true;
                }
                // FIXME Invalid property value will cause style leak from previous element.
                ctx[propName] = style[propName] || prop[1];
            }
        }
        return styleChanged;
    }
    function bindImageStyle(ctx, el, prevEl, 
    // forceSetAll must be true if prevEl is null
    forceSetAll, scope) {
        return bindCommonProps(ctx, getStyle(el, scope.inHover), prevEl && getStyle(prevEl, scope.inHover), forceSetAll, scope);
    }
    function setContextTransform(ctx, el) {
        var m = el.transform;
        var dpr = ctx.dpr || 1;
        if (m) {
            ctx.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
        }
        else {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }
    function updateClipStatus(clipPaths, ctx, scope) {
        var allClipped = false;
        for (var i = 0; i < clipPaths.length; i++) {
            var clipPath = clipPaths[i];
            // Ignore draw following elements if clipPath has zero area.
            allClipped = allClipped || clipPath.isZeroArea();
            setContextTransform(ctx, clipPath);
            ctx.beginPath();
            clipPath.buildPath(ctx, clipPath.shape);
            ctx.clip();
        }
        scope.allClipped = allClipped;
    }
    function isTransformChanged(m0, m1) {
        if (m0 && m1) {
            return m0[0] !== m1[0]
                || m0[1] !== m1[1]
                || m0[2] !== m1[2]
                || m0[3] !== m1[3]
                || m0[4] !== m1[4]
                || m0[5] !== m1[5];
        }
        else if (!m0 && !m1) { // All identity matrix.
            return false;
        }
        return true;
    }
    var DRAW_TYPE_PATH = 1;
    var DRAW_TYPE_IMAGE = 2;
    var DRAW_TYPE_TEXT = 3;
    var DRAW_TYPE_INCREMENTAL = 4;
    // If path can be batched
    function canPathBatch(style) {
        var hasFill = styleHasFill(style);
        var hasStroke = styleHasStroke(style);
        return !(
        // Line dash is dynamically set in brush function.
        style.lineDash
            // Can't batch if element is both set fill and stroke. Or both not set
            || !(+hasFill ^ +hasStroke)
            // Can't batch if element is drawn with gradient or pattern.
            || (hasFill && typeof style.fill !== 'string')
            || (hasStroke && typeof style.stroke !== 'string')
            // Can't batch if element only stroke part of line.
            || style.strokePercent < 1
            // Has stroke or fill opacity
            || style.strokeOpacity < 1
            || style.fillOpacity < 1);
    }
    function flushPathDrawn(ctx, scope) {
        // Force flush all after drawn last element
        scope.batchFill && ctx.fill();
        scope.batchStroke && ctx.stroke();
        scope.batchFill = '';
        scope.batchStroke = '';
    }
    function getStyle(el, inHover) {
        return inHover ? (el.__hoverStyle || el.style) : el.style;
    }
    function brushSingle(ctx, el) {
        brush(ctx, el, { inHover: false, viewWidth: 0, viewHeight: 0 }, true);
    }
    // Brush different type of elements.
    function brush(ctx, el, scope, isLast) {
        var m = el.transform;
        if (!el.shouldBePainted(scope.viewWidth, scope.viewHeight, false, false)) {
            // Needs to mark el rendered.
            // Or this element will always been rendered in progressive rendering.
            // But other dirty bit should not be cleared, otherwise it cause the shape
            // can not be updated in this case.
            el.__dirty &= ~REDRAW_BIT;
            el.__isRendered = false;
            return;
        }
        // HANDLE CLIPPING
        var clipPaths = el.__clipPaths;
        var prevElClipPaths = scope.prevElClipPaths;
        var forceSetTransform = false;
        var forceSetStyle = false;
        // Optimize when clipping on group with several elements
        if (!prevElClipPaths || isClipPathChanged(clipPaths, prevElClipPaths)) {
            // If has previous clipping state, restore from it
            if (prevElClipPaths && prevElClipPaths.length) {
                // Flush restore
                flushPathDrawn(ctx, scope);
                ctx.restore();
                // Must set all style and transform because context changed by restore
                forceSetStyle = forceSetTransform = true;
                scope.prevElClipPaths = null;
                scope.allClipped = false;
                // Reset prevEl since context has been restored
                scope.prevEl = null;
            }
            // New clipping state
            if (clipPaths && clipPaths.length) {
                // Flush before clip
                flushPathDrawn(ctx, scope);
                ctx.save();
                updateClipStatus(clipPaths, ctx, scope);
                // Must set transform because it's changed when clip.
                forceSetTransform = true;
            }
            scope.prevElClipPaths = clipPaths;
        }
        // Not rendering elements if it's clipped by a zero area path.
        // Or it may cause bug on some version of IE11 (like 11.0.9600.178**),
        // where exception "unexpected call to method or property access"
        // might be thrown when calling ctx.fill or ctx.stroke after a path
        // whose area size is zero is drawn and ctx.clip() is called and
        // shadowBlur is set. See #4572, #3112, #5777.
        // (e.g.,
        //  ctx.moveTo(10, 10);
        //  ctx.lineTo(20, 10);
        //  ctx.closePath();
        //  ctx.clip();
        //  ctx.shadowBlur = 10;
        //  ...
        //  ctx.fill();
        // )
        if (scope.allClipped) {
            el.__isRendered = false;
            return;
        }
        // START BRUSH
        el.beforeBrush && el.beforeBrush();
        el.innerBeforeBrush();
        var prevEl = scope.prevEl;
        // TODO el type changed.
        if (!prevEl) {
            forceSetStyle = forceSetTransform = true;
        }
        var canBatchPath = el instanceof Path // Only path supports batch
            && el.autoBatch
            && canPathBatch(el.style);
        if (forceSetTransform || isTransformChanged(m, prevEl.transform)) {
            // Flush
            flushPathDrawn(ctx, scope);
            setContextTransform(ctx, el);
        }
        else if (!canBatchPath) {
            // Flush
            flushPathDrawn(ctx, scope);
        }
        var style = getStyle(el, scope.inHover);
        if (el instanceof Path) {
            // PENDING do we need to rebind all style if displayable type changed?
            if (scope.lastDrawType !== DRAW_TYPE_PATH) {
                forceSetStyle = true;
                scope.lastDrawType = DRAW_TYPE_PATH;
            }
            bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetStyle, scope);
            // Begin path at start
            if (!canBatchPath || (!scope.batchFill && !scope.batchStroke)) {
                ctx.beginPath();
            }
            brushPath(ctx, el, style, canBatchPath);
            if (canBatchPath) {
                scope.batchFill = style.fill || '';
                scope.batchStroke = style.stroke || '';
            }
        }
        else {
            if (el instanceof TSpan) {
                if (scope.lastDrawType !== DRAW_TYPE_TEXT) {
                    forceSetStyle = true;
                    scope.lastDrawType = DRAW_TYPE_TEXT;
                }
                bindPathAndTextCommonStyle(ctx, el, prevEl, forceSetStyle, scope);
                brushText(ctx, el, style);
            }
            else if (el instanceof ZRImage) {
                if (scope.lastDrawType !== DRAW_TYPE_IMAGE) {
                    forceSetStyle = true;
                    scope.lastDrawType = DRAW_TYPE_IMAGE;
                }
                bindImageStyle(ctx, el, prevEl, forceSetStyle, scope);
                brushImage(ctx, el, style);
            }
            else if (el instanceof IncrementalDisplayable) {
                if (scope.lastDrawType !== DRAW_TYPE_INCREMENTAL) {
                    forceSetStyle = true;
                    scope.lastDrawType = DRAW_TYPE_INCREMENTAL;
                }
                brushIncremental(ctx, el, scope);
            }
        }
        if (canBatchPath && isLast) {
            flushPathDrawn(ctx, scope);
        }
        el.innerAfterBrush();
        el.afterBrush && el.afterBrush();
        scope.prevEl = el;
        // Mark as painted.
        el.__dirty = 0;
        el.__isRendered = true;
    }
    function brushIncremental(ctx, el, scope) {
        var displayables = el.getDisplayables();
        var temporalDisplayables = el.getTemporalDisplayables();
        // Provide an inner scope.
        // Save current context and restore after brushed.
        ctx.save();
        var innerScope = {
            prevElClipPaths: null,
            prevEl: null,
            allClipped: false,
            viewWidth: scope.viewWidth,
            viewHeight: scope.viewHeight,
            inHover: scope.inHover
        };
        var i;
        var len;
        // Render persistant displayables.
        for (i = el.getCursor(), len = displayables.length; i < len; i++) {
            var displayable = displayables[i];
            displayable.beforeBrush && displayable.beforeBrush();
            displayable.innerBeforeBrush();
            brush(ctx, displayable, innerScope, i === len - 1);
            displayable.innerAfterBrush();
            displayable.afterBrush && displayable.afterBrush();
            innerScope.prevEl = displayable;
        }
        // Render temporary displayables.
        for (var i_1 = 0, len_1 = temporalDisplayables.length; i_1 < len_1; i_1++) {
            var displayable = temporalDisplayables[i_1];
            displayable.beforeBrush && displayable.beforeBrush();
            displayable.innerBeforeBrush();
            brush(ctx, displayable, innerScope, i_1 === len_1 - 1);
            displayable.innerAfterBrush();
            displayable.afterBrush && displayable.afterBrush();
            innerScope.prevEl = displayable;
        }
        el.clearTemporalDisplayables();
        el.notClear = true;
        ctx.restore();
    }

    function returnFalse() {
        return false;
    }
    function createDom(id, painter, dpr) {
        var newDom = createCanvas();
        var width = painter.getWidth();
        var height = painter.getHeight();
        var newDomStyle = newDom.style;
        if (newDomStyle) { // In node or some other non-browser environment
            newDomStyle.position = 'absolute';
            newDomStyle.left = '0';
            newDomStyle.top = '0';
            newDomStyle.width = width + 'px';
            newDomStyle.height = height + 'px';
            newDom.setAttribute('data-zr-dom-id', id);
        }
        newDom.width = width * dpr;
        newDom.height = height * dpr;
        return newDom;
    }
    var Layer = /** @class */ (function (_super) {
        __extends(Layer, _super);
        function Layer(id, painter, dpr) {
            var _this = _super.call(this) || this;
            /**
             * 是否开启动态模糊
             */
            _this.motionBlur = false;
            /**
             * 在开启动态模糊的时候使用，与上一帧混合的alpha值，值越大尾迹越明显
             */
            _this.lastFrameAlpha = 0.7;
            /**
             * Layer dpr
             */
            _this.dpr = 1;
            /**
             * Virtual layer will not be inserted into dom.
             */
            _this.virtual = false;
            _this.config = {};
            _this.incremental = false;
            _this.zlevel = 0;
            _this.maxRepaintRectCount = 5;
            _this.__dirty = true;
            _this.__firstTimePaint = true;
            _this.__used = false;
            _this.__drawIndex = 0;
            _this.__startIndex = 0;
            _this.__endIndex = 0;
            // indices in the previous frame
            _this.__prevStartIndex = null;
            _this.__prevEndIndex = null;
            var dom;
            dpr = dpr || devicePixelRatio;
            if (typeof id === 'string') {
                dom = createDom(id, painter, dpr);
            }
            // Not using isDom because in node it will return false
            else if (isObject(id)) {
                dom = id;
                id = dom.id;
            }
            _this.id = id;
            _this.dom = dom;
            var domStyle = dom.style;
            if (domStyle) { // Not in node
                dom.onselectstart = returnFalse; // 避免页面选中的尴尬
                domStyle.webkitUserSelect = 'none';
                domStyle.userSelect = 'none';
                domStyle.webkitTapHighlightColor = 'rgba(0,0,0,0)';
                domStyle['-webkit-touch-callout'] = 'none';
                domStyle.padding = '0';
                domStyle.margin = '0';
                domStyle.borderWidth = '0';
            }
            _this.domBack = null;
            _this.ctxBack = null;
            _this.painter = painter;
            _this.config = null;
            _this.dpr = dpr;
            return _this;
        }
        Layer.prototype.getElementCount = function () {
            return this.__endIndex - this.__startIndex;
        };
        Layer.prototype.afterBrush = function () {
            this.__prevStartIndex = this.__startIndex;
            this.__prevEndIndex = this.__endIndex;
        };
        Layer.prototype.initContext = function () {
            this.ctx = this.dom.getContext('2d');
            this.ctx.dpr = this.dpr;
        };
        Layer.prototype.setUnpainted = function () {
            this.__firstTimePaint = true;
        };
        Layer.prototype.createBackBuffer = function () {
            var dpr = this.dpr;
            this.domBack = createDom('back-' + this.id, this.painter, dpr);
            this.ctxBack = this.domBack.getContext('2d');
            if (dpr !== 1) {
                this.ctxBack.scale(dpr, dpr);
            }
        };
        /**
         * Create repaint list when using dirty rect rendering.
         *
         * @param displayList current rendering list
         * @param prevList last frame rendering list
         * @return repaint rects. null for the first frame, [] for no element dirty
         */
        Layer.prototype.createRepaintRects = function (displayList, prevList, viewWidth, viewHeight) {
            if (this.__firstTimePaint) {
                this.__firstTimePaint = false;
                return null;
            }
            var mergedRepaintRects = [];
            var maxRepaintRectCount = this.maxRepaintRectCount;
            var full = false;
            var pendingRect = new BoundingRect(0, 0, 0, 0);
            function addRectToMergePool(rect) {
                if (!rect.isFinite() || rect.isZero()) {
                    return;
                }
                if (mergedRepaintRects.length === 0) {
                    // First rect, create new merged rect
                    var boundingRect = new BoundingRect(0, 0, 0, 0);
                    boundingRect.copy(rect);
                    mergedRepaintRects.push(boundingRect);
                }
                else {
                    var isMerged = false;
                    var minDeltaArea = Infinity;
                    var bestRectToMergeIdx = 0;
                    for (var i = 0; i < mergedRepaintRects.length; ++i) {
                        var mergedRect = mergedRepaintRects[i];
                        // Merge if has intersection
                        if (mergedRect.intersect(rect)) {
                            var pendingRect_1 = new BoundingRect(0, 0, 0, 0);
                            pendingRect_1.copy(mergedRect);
                            pendingRect_1.union(rect);
                            mergedRepaintRects[i] = pendingRect_1;
                            isMerged = true;
                            break;
                        }
                        else if (full) {
                            // Merged to exists rectangles if full
                            pendingRect.copy(rect);
                            pendingRect.union(mergedRect);
                            var aArea = rect.width * rect.height;
                            var bArea = mergedRect.width * mergedRect.height;
                            var pendingArea = pendingRect.width * pendingRect.height;
                            var deltaArea = pendingArea - aArea - bArea;
                            if (deltaArea < minDeltaArea) {
                                minDeltaArea = deltaArea;
                                bestRectToMergeIdx = i;
                            }
                        }
                    }
                    if (full) {
                        mergedRepaintRects[bestRectToMergeIdx].union(rect);
                        isMerged = true;
                    }
                    if (!isMerged) {
                        // Create new merged rect if cannot merge with current
                        var boundingRect = new BoundingRect(0, 0, 0, 0);
                        boundingRect.copy(rect);
                        mergedRepaintRects.push(boundingRect);
                    }
                    if (!full) {
                        full = mergedRepaintRects.length >= maxRepaintRectCount;
                    }
                }
            }
            /**
             * Loop the paint list of this frame and get the dirty rects of elements
             * in this frame.
             */
            for (var i = this.__startIndex; i < this.__endIndex; ++i) {
                var el = displayList[i];
                if (el) {
                    /**
                     * `shouldPaint` is true only when the element is not ignored or
                     * invisible and all its ancestors are not ignored.
                     * `shouldPaint` being true means it will be brushed this frame.
                     *
                     * `__isRendered` being true means the element is currently on
                     * the canvas.
                     *
                     * `__dirty` being true means the element should be brushed this
                     * frame.
                     *
                     * We only need to repaint the element's previous painting rect
                     * if it's currently on the canvas and needs repaint this frame
                     * or not painted this frame.
                     */
                    var shouldPaint = el.shouldBePainted(viewWidth, viewHeight, true, true);
                    var prevRect = el.__isRendered && ((el.__dirty & REDRAW_BIT) || !shouldPaint)
                        ? el.getPrevPaintRect()
                        : null;
                    if (prevRect) {
                        addRectToMergePool(prevRect);
                    }
                    /**
                     * On the other hand, we only need to paint the current rect
                     * if the element should be brushed this frame and either being
                     * dirty or not rendered before.
                     */
                    var curRect = shouldPaint && ((el.__dirty & REDRAW_BIT) || !el.__isRendered)
                        ? el.getPaintRect()
                        : null;
                    if (curRect) {
                        addRectToMergePool(curRect);
                    }
                }
            }
            /**
             * The above loop calculates the dirty rects of elements that are in the
             * paint list this frame, which does not include those elements removed
             * in this frame. So we loop the `prevList` to get the removed elements.
             */
            for (var i = this.__prevStartIndex; i < this.__prevEndIndex; ++i) {
                var el = prevList[i];
                /**
                 * Consider the elements whose ancestors are invisible, they should
                 * not be painted and their previous painting rects should be
                 * cleared if they are rendered on the canvas (`__isRendered` being
                 * true). `!shouldPaint` means the element is not brushed in this
                 * frame.
                 *
                 * `!el.__zr` means it's removed from the storage.
                 *
                 * In conclusion, an element needs to repaint the previous painting
                 * rect if and only if it's not painted this frame and was
                 * previously painted on the canvas.
                 */
                var shouldPaint = el.shouldBePainted(viewWidth, viewHeight, true, true);
                if (el && (!shouldPaint || !el.__zr) && el.__isRendered) {
                    // el was removed
                    var prevRect = el.getPrevPaintRect();
                    if (prevRect) {
                        addRectToMergePool(prevRect);
                    }
                }
            }
            // Merge intersected rects in the result
            var hasIntersections;
            do {
                hasIntersections = false;
                for (var i = 0; i < mergedRepaintRects.length;) {
                    if (mergedRepaintRects[i].isZero()) {
                        mergedRepaintRects.splice(i, 1);
                        continue;
                    }
                    for (var j = i + 1; j < mergedRepaintRects.length;) {
                        if (mergedRepaintRects[i].intersect(mergedRepaintRects[j])) {
                            hasIntersections = true;
                            mergedRepaintRects[i].union(mergedRepaintRects[j]);
                            mergedRepaintRects.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                    }
                    i++;
                }
            } while (hasIntersections);
            this._paintRects = mergedRepaintRects;
            return mergedRepaintRects;
        };
        /**
         * Get paint rects for debug usage.
         */
        Layer.prototype.debugGetPaintRects = function () {
            return (this._paintRects || []).slice();
        };
        Layer.prototype.resize = function (width, height) {
            var dpr = this.dpr;
            var dom = this.dom;
            var domStyle = dom.style;
            var domBack = this.domBack;
            if (domStyle) {
                domStyle.width = width + 'px';
                domStyle.height = height + 'px';
            }
            dom.width = width * dpr;
            dom.height = height * dpr;
            if (domBack) {
                domBack.width = width * dpr;
                domBack.height = height * dpr;
                if (dpr !== 1) {
                    this.ctxBack.scale(dpr, dpr);
                }
            }
        };
        /**
         * 清空该层画布
         */
        Layer.prototype.clear = function (clearAll, clearColor, repaintRects) {
            var dom = this.dom;
            var ctx = this.ctx;
            var width = dom.width;
            var height = dom.height;
            clearColor = clearColor || this.clearColor;
            var haveMotionBLur = this.motionBlur && !clearAll;
            var lastFrameAlpha = this.lastFrameAlpha;
            var dpr = this.dpr;
            var self = this;
            if (haveMotionBLur) {
                if (!this.domBack) {
                    this.createBackBuffer();
                }
                this.ctxBack.globalCompositeOperation = 'copy';
                this.ctxBack.drawImage(dom, 0, 0, width / dpr, height / dpr);
            }
            var domBack = this.domBack;
            function doClear(x, y, width, height) {
                ctx.clearRect(x, y, width, height);
                if (clearColor && clearColor !== 'transparent') {
                    var clearColorGradientOrPattern = void 0;
                    // Gradient
                    if (isGradientObject(clearColor)) {
                        // Cache canvas gradient
                        clearColorGradientOrPattern = clearColor.__canvasGradient
                            || getCanvasGradient(ctx, clearColor, {
                                x: 0,
                                y: 0,
                                width: width,
                                height: height
                            });
                        clearColor.__canvasGradient = clearColorGradientOrPattern;
                    }
                    // Pattern
                    else if (isImagePatternObject(clearColor)) {
                        clearColorGradientOrPattern = createCanvasPattern(ctx, clearColor, {
                            dirty: function () {
                                // TODO
                                self.setUnpainted();
                                self.__painter.refresh();
                            }
                        });
                    }
                    ctx.save();
                    ctx.fillStyle = clearColorGradientOrPattern || clearColor;
                    ctx.fillRect(x, y, width, height);
                    ctx.restore();
                }
                if (haveMotionBLur) {
                    ctx.save();
                    ctx.globalAlpha = lastFrameAlpha;
                    ctx.drawImage(domBack, x, y, width, height);
                    ctx.restore();
                }
            }
            if (!repaintRects || haveMotionBLur) {
                // Clear the full canvas
                doClear(0, 0, width, height);
            }
            else if (repaintRects.length) {
                // Clear the repaint areas
                each(repaintRects, function (rect) {
                    doClear(rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr);
                });
            }
        };
        return Layer;
    }(Eventful));

    var HOVER_LAYER_ZLEVEL = 1e5;
    var CANVAS_ZLEVEL = 314159;
    var EL_AFTER_INCREMENTAL_INC = 0.01;
    var INCREMENTAL_INC = 0.001;
    function parseInt10(val) {
        return parseInt(val, 10);
    }
    function isLayerValid(layer) {
        if (!layer) {
            return false;
        }
        if (layer.__builtin__) {
            return true;
        }
        if (typeof (layer.resize) !== 'function'
            || typeof (layer.refresh) !== 'function') {
            return false;
        }
        return true;
    }
    function createRoot(width, height) {
        var domRoot = document.createElement('div');
        // domRoot.onselectstart = returnFalse; // Avoid page selected
        domRoot.style.cssText = [
            'position:relative',
            // IOS13 safari probably has a compositing bug (z order of the canvas and the consequent
            // dom does not act as expected) when some of the parent dom has
            // `-webkit-overflow-scrolling: touch;` and the webpage is longer than one screen and
            // the canvas is not at the top part of the page.
            // Check `https://bugs.webkit.org/show_bug.cgi?id=203681` for more details. We remove
            // this `overflow:hidden` to avoid the bug.
            // 'overflow:hidden',
            'width:' + width + 'px',
            'height:' + height + 'px',
            'padding:0',
            'margin:0',
            'border-width:0'
        ].join(';') + ';';
        return domRoot;
    }
    var CanvasPainter = /** @class */ (function () {
        function CanvasPainter(root, storage, opts, id) {
            this.type = 'canvas';
            this._zlevelList = [];
            this._prevDisplayList = [];
            this._layers = {}; // key is zlevel
            this._layerConfig = {}; // key is zlevel
            /**
             * zrender will do compositing when root is a canvas and have multiple zlevels.
             */
            this._needsManuallyCompositing = false;
            this.type = 'canvas';
            // In node environment using node-canvas
            var singleCanvas = !root.nodeName // In node ?
                || root.nodeName.toUpperCase() === 'CANVAS';
            this._opts = opts = extend({}, opts || {});
            /**
             * @type {number}
             */
            this.dpr = opts.devicePixelRatio || devicePixelRatio;
            /**
             * @type {boolean}
             * @private
             */
            this._singleCanvas = singleCanvas;
            /**
             * 绘图容器
             * @type {HTMLElement}
             */
            this.root = root;
            var rootStyle = root.style;
            if (rootStyle) {
                rootStyle.webkitTapHighlightColor = 'transparent';
                rootStyle.webkitUserSelect = 'none';
                rootStyle.userSelect = 'none';
                rootStyle['-webkit-touch-callout'] = 'none';
                root.innerHTML = '';
            }
            /**
             * @type {module:zrender/Storage}
             */
            this.storage = storage;
            var zlevelList = this._zlevelList;
            this._prevDisplayList = [];
            var layers = this._layers;
            if (!singleCanvas) {
                this._width = this._getSize(0);
                this._height = this._getSize(1);
                var domRoot = this._domRoot = createRoot(this._width, this._height);
                root.appendChild(domRoot);
            }
            else {
                var rootCanvas = root;
                var width = rootCanvas.width;
                var height = rootCanvas.height;
                if (opts.width != null) {
                    // TODO sting?
                    width = opts.width;
                }
                if (opts.height != null) {
                    // TODO sting?
                    height = opts.height;
                }
                this.dpr = opts.devicePixelRatio || 1;
                // Use canvas width and height directly
                rootCanvas.width = width * this.dpr;
                rootCanvas.height = height * this.dpr;
                this._width = width;
                this._height = height;
                // Create layer if only one given canvas
                // Device can be specified to create a high dpi image.
                var mainLayer = new Layer(rootCanvas, this, this.dpr);
                mainLayer.__builtin__ = true;
                mainLayer.initContext();
                // FIXME Use canvas width and height
                // mainLayer.resize(width, height);
                layers[CANVAS_ZLEVEL] = mainLayer;
                mainLayer.zlevel = CANVAS_ZLEVEL;
                // Not use common zlevel.
                zlevelList.push(CANVAS_ZLEVEL);
                this._domRoot = root;
            }
        }
        CanvasPainter.prototype.getType = function () {
            return 'canvas';
        };
        /**
         * If painter use a single canvas
         */
        CanvasPainter.prototype.isSingleCanvas = function () {
            return this._singleCanvas;
        };
        CanvasPainter.prototype.getViewportRoot = function () {
            return this._domRoot;
        };
        CanvasPainter.prototype.getViewportRootOffset = function () {
            var viewportRoot = this.getViewportRoot();
            if (viewportRoot) {
                return {
                    offsetLeft: viewportRoot.offsetLeft || 0,
                    offsetTop: viewportRoot.offsetTop || 0
                };
            }
        };
        /**
         * 刷新
         * @param paintAll 强制绘制所有displayable
         */
        CanvasPainter.prototype.refresh = function (paintAll) {
            var list = this.storage.getDisplayList(true);
            var prevList = this._prevDisplayList;
            var zlevelList = this._zlevelList;
            this._redrawId = Math.random();
            this._paintList(list, prevList, paintAll, this._redrawId);
            // Paint custum layers
            for (var i = 0; i < zlevelList.length; i++) {
                var z = zlevelList[i];
                var layer = this._layers[z];
                if (!layer.__builtin__ && layer.refresh) {
                    var clearColor = i === 0 ? this._backgroundColor : null;
                    layer.refresh(clearColor);
                }
            }
            if (this._opts.useDirtyRect) {
                this._prevDisplayList = list.slice();
            }
            return this;
        };
        CanvasPainter.prototype.refreshHover = function () {
            this._paintHoverList(this.storage.getDisplayList(false));
        };
        CanvasPainter.prototype._paintHoverList = function (list) {
            var len = list.length;
            var hoverLayer = this._hoverlayer;
            hoverLayer && hoverLayer.clear();
            if (!len) {
                return;
            }
            var scope = {
                inHover: true,
                viewWidth: this._width,
                viewHeight: this._height
            };
            var ctx;
            for (var i = 0; i < len; i++) {
                var el = list[i];
                if (el.__inHover) {
                    // Use a extream large zlevel
                    // FIXME?
                    if (!hoverLayer) {
                        hoverLayer = this._hoverlayer = this.getLayer(HOVER_LAYER_ZLEVEL);
                    }
                    if (!ctx) {
                        ctx = hoverLayer.ctx;
                        ctx.save();
                    }
                    brush(ctx, el, scope, i === len - 1);
                }
            }
            if (ctx) {
                ctx.restore();
            }
        };
        CanvasPainter.prototype.getHoverLayer = function () {
            return this.getLayer(HOVER_LAYER_ZLEVEL);
        };
        CanvasPainter.prototype.paintOne = function (ctx, el) {
            brushSingle(ctx, el);
        };
        CanvasPainter.prototype._paintList = function (list, prevList, paintAll, redrawId) {
            if (this._redrawId !== redrawId) {
                return;
            }
            paintAll = paintAll || false;
            this._updateLayerStatus(list);
            var _a = this._doPaintList(list, prevList, paintAll), finished = _a.finished, needsRefreshHover = _a.needsRefreshHover;
            if (this._needsManuallyCompositing) {
                this._compositeManually();
            }
            if (needsRefreshHover) {
                this._paintHoverList(list);
            }
            if (!finished) {
                var self_1 = this;
                requestAnimationFrame$1(function () {
                    self_1._paintList(list, prevList, paintAll, redrawId);
                });
            }
            else {
                this.eachLayer(function (layer) {
                    layer.afterBrush && layer.afterBrush();
                });
            }
        };
        CanvasPainter.prototype._compositeManually = function () {
            var ctx = this.getLayer(CANVAS_ZLEVEL).ctx;
            var width = this._domRoot.width;
            var height = this._domRoot.height;
            ctx.clearRect(0, 0, width, height);
            // PENDING, If only builtin layer?
            this.eachBuiltinLayer(function (layer) {
                if (layer.virtual) {
                    ctx.drawImage(layer.dom, 0, 0, width, height);
                }
            });
        };
        CanvasPainter.prototype._doPaintList = function (list, prevList, paintAll) {
            var _this = this;
            var layerList = [];
            var useDirtyRect = this._opts.useDirtyRect;
            for (var zi = 0; zi < this._zlevelList.length; zi++) {
                var zlevel = this._zlevelList[zi];
                var layer = this._layers[zlevel];
                if (layer.__builtin__
                    && layer !== this._hoverlayer
                    && (layer.__dirty || paintAll)
                // Layer with hover elements can't be redrawn.
                // && !layer.__hasHoverLayerELement
                ) {
                    layerList.push(layer);
                }
            }
            var finished = true;
            var needsRefreshHover = false;
            var _loop_1 = function (k) {
                var layer = layerList[k];
                var ctx = layer.ctx;
                var repaintRects = useDirtyRect
                    && layer.createRepaintRects(list, prevList, this_1._width, this_1._height);
                var start = paintAll ? layer.__startIndex : layer.__drawIndex;
                var useTimer = !paintAll && layer.incremental && Date.now;
                var startTime = useTimer && Date.now();
                var clearColor = layer.zlevel === this_1._zlevelList[0]
                    ? this_1._backgroundColor : null;
                // All elements in this layer are cleared.
                if (layer.__startIndex === layer.__endIndex) {
                    layer.clear(false, clearColor, repaintRects);
                }
                else if (start === layer.__startIndex) {
                    var firstEl = list[start];
                    if (!firstEl.incremental || !firstEl.notClear || paintAll) {
                        layer.clear(false, clearColor, repaintRects);
                    }
                }
                if (start === -1) {
                    console.error('For some unknown reason. drawIndex is -1');
                    start = layer.__startIndex;
                }
                var i;
                /* eslint-disable-next-line */
                var repaint = function (repaintRect) {
                    var scope = {
                        inHover: false,
                        allClipped: false,
                        prevEl: null,
                        viewWidth: _this._width,
                        viewHeight: _this._height
                    };
                    for (i = start; i < layer.__endIndex; i++) {
                        var el = list[i];
                        if (el.__inHover) {
                            needsRefreshHover = true;
                        }
                        _this._doPaintEl(el, layer, useDirtyRect, repaintRect, scope, i === layer.__endIndex - 1);
                        if (useTimer) {
                            // Date.now can be executed in 13,025,305 ops/second.
                            var dTime = Date.now() - startTime;
                            // Give 15 millisecond to draw.
                            // The rest elements will be drawn in the next frame.
                            if (dTime > 15) {
                                break;
                            }
                        }
                    }
                    if (scope.prevElClipPaths) {
                        // Needs restore the state. If last drawn element is in the clipping area.
                        ctx.restore();
                    }
                };
                if (repaintRects) {
                    if (repaintRects.length === 0) {
                        // Nothing to repaint, mark as finished
                        i = layer.__endIndex;
                    }
                    else {
                        var dpr = this_1.dpr;
                        // Set repaintRect as clipPath
                        for (var r = 0; r < repaintRects.length; ++r) {
                            var rect = repaintRects[r];
                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr);
                            ctx.clip();
                            repaint(rect);
                            ctx.restore();
                        }
                    }
                }
                else {
                    // Paint all once
                    ctx.save();
                    repaint();
                    ctx.restore();
                }
                layer.__drawIndex = i;
                if (layer.__drawIndex < layer.__endIndex) {
                    finished = false;
                }
            };
            var this_1 = this;
            for (var k = 0; k < layerList.length; k++) {
                _loop_1(k);
            }
            if (env.wxa) {
                // Flush for weixin application
                each(this._layers, function (layer) {
                    if (layer && layer.ctx && layer.ctx.draw) {
                        layer.ctx.draw();
                    }
                });
            }
            return {
                finished: finished,
                needsRefreshHover: needsRefreshHover
            };
        };
        CanvasPainter.prototype._doPaintEl = function (el, currentLayer, useDirtyRect, repaintRect, scope, isLast) {
            var ctx = currentLayer.ctx;
            if (useDirtyRect) {
                var paintRect = el.getPaintRect();
                if (!repaintRect || paintRect && paintRect.intersect(repaintRect)) {
                    brush(ctx, el, scope, isLast);
                    el.setPrevPaintRect(paintRect);
                }
            }
            else {
                brush(ctx, el, scope, isLast);
            }
        };
        /**
         * 获取 zlevel 所在层，如果不存在则会创建一个新的层
         * @param zlevel
         * @param virtual Virtual layer will not be inserted into dom.
         */
        CanvasPainter.prototype.getLayer = function (zlevel, virtual) {
            if (this._singleCanvas && !this._needsManuallyCompositing) {
                zlevel = CANVAS_ZLEVEL;
            }
            var layer = this._layers[zlevel];
            if (!layer) {
                // Create a new layer
                layer = new Layer('zr_' + zlevel, this, this.dpr);
                layer.zlevel = zlevel;
                layer.__builtin__ = true;
                if (this._layerConfig[zlevel]) {
                    merge(layer, this._layerConfig[zlevel], true);
                }
                // TODO Remove EL_AFTER_INCREMENTAL_INC magic number
                else if (this._layerConfig[zlevel - EL_AFTER_INCREMENTAL_INC]) {
                    merge(layer, this._layerConfig[zlevel - EL_AFTER_INCREMENTAL_INC], true);
                }
                if (virtual) {
                    layer.virtual = virtual;
                }
                this.insertLayer(zlevel, layer);
                // Context is created after dom inserted to document
                // Or excanvas will get 0px clientWidth and clientHeight
                layer.initContext();
            }
            return layer;
        };
        CanvasPainter.prototype.insertLayer = function (zlevel, layer) {
            var layersMap = this._layers;
            var zlevelList = this._zlevelList;
            var len = zlevelList.length;
            var domRoot = this._domRoot;
            var prevLayer = null;
            var i = -1;
            if (layersMap[zlevel]) {
                logError('ZLevel ' + zlevel + ' has been used already');
                return;
            }
            // Check if is a valid layer
            if (!isLayerValid(layer)) {
                logError('Layer of zlevel ' + zlevel + ' is not valid');
                return;
            }
            if (len > 0 && zlevel > zlevelList[0]) {
                for (i = 0; i < len - 1; i++) {
                    if (zlevelList[i] < zlevel
                        && zlevelList[i + 1] > zlevel) {
                        break;
                    }
                }
                prevLayer = layersMap[zlevelList[i]];
            }
            zlevelList.splice(i + 1, 0, zlevel);
            layersMap[zlevel] = layer;
            // Vitual layer will not directly show on the screen.
            // (It can be a WebGL layer and assigned to a ZRImage element)
            // But it still under management of zrender.
            if (!layer.virtual) {
                if (prevLayer) {
                    var prevDom = prevLayer.dom;
                    if (prevDom.nextSibling) {
                        domRoot.insertBefore(layer.dom, prevDom.nextSibling);
                    }
                    else {
                        domRoot.appendChild(layer.dom);
                    }
                }
                else {
                    if (domRoot.firstChild) {
                        domRoot.insertBefore(layer.dom, domRoot.firstChild);
                    }
                    else {
                        domRoot.appendChild(layer.dom);
                    }
                }
            }
            layer.__painter = this;
        };
        // Iterate each layer
        CanvasPainter.prototype.eachLayer = function (cb, context) {
            var zlevelList = this._zlevelList;
            for (var i = 0; i < zlevelList.length; i++) {
                var z = zlevelList[i];
                cb.call(context, this._layers[z], z);
            }
        };
        // Iterate each buildin layer
        CanvasPainter.prototype.eachBuiltinLayer = function (cb, context) {
            var zlevelList = this._zlevelList;
            for (var i = 0; i < zlevelList.length; i++) {
                var z = zlevelList[i];
                var layer = this._layers[z];
                if (layer.__builtin__) {
                    cb.call(context, layer, z);
                }
            }
        };
        // Iterate each other layer except buildin layer
        CanvasPainter.prototype.eachOtherLayer = function (cb, context) {
            var zlevelList = this._zlevelList;
            for (var i = 0; i < zlevelList.length; i++) {
                var z = zlevelList[i];
                var layer = this._layers[z];
                if (!layer.__builtin__) {
                    cb.call(context, layer, z);
                }
            }
        };
        /**
         * 获取所有已创建的层
         * @param prevLayer
         */
        CanvasPainter.prototype.getLayers = function () {
            return this._layers;
        };
        CanvasPainter.prototype._updateLayerStatus = function (list) {
            this.eachBuiltinLayer(function (layer, z) {
                layer.__dirty = layer.__used = false;
            });
            function updatePrevLayer(idx) {
                if (prevLayer) {
                    if (prevLayer.__endIndex !== idx) {
                        prevLayer.__dirty = true;
                    }
                    prevLayer.__endIndex = idx;
                }
            }
            if (this._singleCanvas) {
                for (var i_1 = 1; i_1 < list.length; i_1++) {
                    var el = list[i_1];
                    if (el.zlevel !== list[i_1 - 1].zlevel || el.incremental) {
                        this._needsManuallyCompositing = true;
                        break;
                    }
                }
            }
            var prevLayer = null;
            var incrementalLayerCount = 0;
            var prevZlevel;
            var i;
            for (i = 0; i < list.length; i++) {
                var el = list[i];
                var zlevel = el.zlevel;
                var layer = void 0;
                if (prevZlevel !== zlevel) {
                    prevZlevel = zlevel;
                    incrementalLayerCount = 0;
                }
                // TODO Not use magic number on zlevel.
                // Each layer with increment element can be separated to 3 layers.
                //          (Other Element drawn after incremental element)
                // -----------------zlevel + EL_AFTER_INCREMENTAL_INC--------------------
                //                      (Incremental element)
                // ----------------------zlevel + INCREMENTAL_INC------------------------
                //              (Element drawn before incremental element)
                // --------------------------------zlevel--------------------------------
                if (el.incremental) {
                    layer = this.getLayer(zlevel + INCREMENTAL_INC, this._needsManuallyCompositing);
                    layer.incremental = true;
                    incrementalLayerCount = 1;
                }
                else {
                    layer = this.getLayer(zlevel + (incrementalLayerCount > 0 ? EL_AFTER_INCREMENTAL_INC : 0), this._needsManuallyCompositing);
                }
                if (!layer.__builtin__) {
                    logError('ZLevel ' + zlevel + ' has been used by unkown layer ' + layer.id);
                }
                if (layer !== prevLayer) {
                    layer.__used = true;
                    if (layer.__startIndex !== i) {
                        layer.__dirty = true;
                    }
                    layer.__startIndex = i;
                    if (!layer.incremental) {
                        layer.__drawIndex = i;
                    }
                    else {
                        // Mark layer draw index needs to update.
                        layer.__drawIndex = -1;
                    }
                    updatePrevLayer(i);
                    prevLayer = layer;
                }
                if ((el.__dirty & REDRAW_BIT) && !el.__inHover) { // Ignore dirty elements in hover layer.
                    layer.__dirty = true;
                    if (layer.incremental && layer.__drawIndex < 0) {
                        // Start draw from the first dirty element.
                        layer.__drawIndex = i;
                    }
                }
            }
            updatePrevLayer(i);
            this.eachBuiltinLayer(function (layer, z) {
                // Used in last frame but not in this frame. Needs clear
                if (!layer.__used && layer.getElementCount() > 0) {
                    layer.__dirty = true;
                    layer.__startIndex = layer.__endIndex = layer.__drawIndex = 0;
                }
                // For incremental layer. In case start index changed and no elements are dirty.
                if (layer.__dirty && layer.__drawIndex < 0) {
                    layer.__drawIndex = layer.__startIndex;
                }
            });
        };
        /**
         * 清除hover层外所有内容
         */
        CanvasPainter.prototype.clear = function () {
            this.eachBuiltinLayer(this._clearLayer);
            return this;
        };
        CanvasPainter.prototype._clearLayer = function (layer) {
            layer.clear();
        };
        CanvasPainter.prototype.setBackgroundColor = function (backgroundColor) {
            this._backgroundColor = backgroundColor;
            each(this._layers, function (layer) {
                layer.setUnpainted();
            });
        };
        /**
         * 修改指定zlevel的绘制参数
         */
        CanvasPainter.prototype.configLayer = function (zlevel, config) {
            if (config) {
                var layerConfig = this._layerConfig;
                if (!layerConfig[zlevel]) {
                    layerConfig[zlevel] = config;
                }
                else {
                    merge(layerConfig[zlevel], config, true);
                }
                for (var i = 0; i < this._zlevelList.length; i++) {
                    var _zlevel = this._zlevelList[i];
                    // TODO Remove EL_AFTER_INCREMENTAL_INC magic number
                    if (_zlevel === zlevel || _zlevel === zlevel + EL_AFTER_INCREMENTAL_INC) {
                        var layer = this._layers[_zlevel];
                        merge(layer, layerConfig[zlevel], true);
                    }
                }
            }
        };
        /**
         * 删除指定层
         * @param zlevel 层所在的zlevel
         */
        CanvasPainter.prototype.delLayer = function (zlevel) {
            var layers = this._layers;
            var zlevelList = this._zlevelList;
            var layer = layers[zlevel];
            if (!layer) {
                return;
            }
            layer.dom.parentNode.removeChild(layer.dom);
            delete layers[zlevel];
            zlevelList.splice(indexOf(zlevelList, zlevel), 1);
        };
        /**
         * 区域大小变化后重绘
         */
        CanvasPainter.prototype.resize = function (width, height) {
            if (!this._domRoot.style) { // Maybe in node or worker
                if (width == null || height == null) {
                    return;
                }
                // TODO width / height may be string
                this._width = width;
                this._height = height;
                this.getLayer(CANVAS_ZLEVEL).resize(width, height);
            }
            else {
                var domRoot = this._domRoot;
                // FIXME Why ?
                domRoot.style.display = 'none';
                // Save input w/h
                var opts = this._opts;
                width != null && (opts.width = width);
                height != null && (opts.height = height);
                width = this._getSize(0);
                height = this._getSize(1);
                domRoot.style.display = '';
                // 优化没有实际改变的resize
                if (this._width !== width || height !== this._height) {
                    domRoot.style.width = width + 'px';
                    domRoot.style.height = height + 'px';
                    for (var id in this._layers) {
                        if (this._layers.hasOwnProperty(id)) {
                            this._layers[id].resize(width, height);
                        }
                    }
                    this.refresh(true);
                }
                this._width = width;
                this._height = height;
            }
            return this;
        };
        /**
         * 清除单独的一个层
         * @param {number} zlevel
         */
        CanvasPainter.prototype.clearLayer = function (zlevel) {
            var layer = this._layers[zlevel];
            if (layer) {
                layer.clear();
            }
        };
        /**
         * 释放
         */
        CanvasPainter.prototype.dispose = function () {
            this.root.innerHTML = '';
            this.root =
                this.storage =
                    this._domRoot =
                        this._layers = null;
        };
        /**
         * Get canvas which has all thing rendered
         */
        CanvasPainter.prototype.getRenderedCanvas = function (opts) {
            opts = opts || {};
            if (this._singleCanvas && !this._compositeManually) {
                return this._layers[CANVAS_ZLEVEL].dom;
            }
            var imageLayer = new Layer('image', this, opts.pixelRatio || this.dpr);
            imageLayer.initContext();
            imageLayer.clear(false, opts.backgroundColor || this._backgroundColor);
            var ctx = imageLayer.ctx;
            if (opts.pixelRatio <= this.dpr) {
                this.refresh();
                var width_1 = imageLayer.dom.width;
                var height_1 = imageLayer.dom.height;
                this.eachLayer(function (layer) {
                    if (layer.__builtin__) {
                        ctx.drawImage(layer.dom, 0, 0, width_1, height_1);
                    }
                    else if (layer.renderToCanvas) {
                        ctx.save();
                        layer.renderToCanvas(ctx);
                        ctx.restore();
                    }
                });
            }
            else {
                // PENDING, echarts-gl and incremental rendering.
                var scope = {
                    inHover: false,
                    viewWidth: this._width,
                    viewHeight: this._height
                };
                var displayList = this.storage.getDisplayList(true);
                for (var i = 0, len = displayList.length; i < len; i++) {
                    var el = displayList[i];
                    brush(ctx, el, scope, i === len - 1);
                }
            }
            return imageLayer.dom;
        };
        /**
         * 获取绘图区域宽度
         */
        CanvasPainter.prototype.getWidth = function () {
            return this._width;
        };
        /**
         * 获取绘图区域高度
         */
        CanvasPainter.prototype.getHeight = function () {
            return this._height;
        };
        CanvasPainter.prototype._getSize = function (whIdx) {
            var opts = this._opts;
            var wh = ['width', 'height'][whIdx];
            var cwh = ['clientWidth', 'clientHeight'][whIdx];
            var plt = ['paddingLeft', 'paddingTop'][whIdx];
            var prb = ['paddingRight', 'paddingBottom'][whIdx];
            if (opts[wh] != null && opts[wh] !== 'auto') {
                return parseFloat(opts[wh]);
            }
            var root = this.root;
            // IE8 does not support getComputedStyle, but it use VML.
            var stl = document.defaultView.getComputedStyle(root);
            return ((root[cwh] || parseInt10(stl[wh]) || parseInt10(root.style[wh]))
                - (parseInt10(stl[plt]) || 0)
                - (parseInt10(stl[prb]) || 0)) | 0;
        };
        CanvasPainter.prototype.pathToImage = function (path, dpr) {
            dpr = dpr || this.dpr;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var rect = path.getBoundingRect();
            var style = path.style;
            var shadowBlurSize = style.shadowBlur * dpr;
            var shadowOffsetX = style.shadowOffsetX * dpr;
            var shadowOffsetY = style.shadowOffsetY * dpr;
            var lineWidth = path.hasStroke() ? style.lineWidth : 0;
            var leftMargin = Math.max(lineWidth / 2, -shadowOffsetX + shadowBlurSize);
            var rightMargin = Math.max(lineWidth / 2, shadowOffsetX + shadowBlurSize);
            var topMargin = Math.max(lineWidth / 2, -shadowOffsetY + shadowBlurSize);
            var bottomMargin = Math.max(lineWidth / 2, shadowOffsetY + shadowBlurSize);
            var width = rect.width + leftMargin + rightMargin;
            var height = rect.height + topMargin + bottomMargin;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);
            ctx.dpr = dpr;
            var pathTransform = {
                x: path.x,
                y: path.y,
                scaleX: path.scaleX,
                scaleY: path.scaleY,
                rotation: path.rotation,
                originX: path.originX,
                originY: path.originY
            };
            path.x = leftMargin - rect.x;
            path.y = topMargin - rect.y;
            path.rotation = 0;
            path.scaleX = 1;
            path.scaleY = 1;
            path.updateTransform();
            if (path) {
                brush(ctx, path, {
                    inHover: false,
                    viewWidth: this._width,
                    viewHeight: this._height
                }, true);
            }
            var imgShape = new ZRImage({
                style: {
                    x: 0,
                    y: 0,
                    image: canvas
                }
            });
            extend(path, pathTransform);
            return imgShape;
        };
        return CanvasPainter;
    }());

    var Flow = /** @class */ (function () {
        function Flow(container) {
            this.render = null;
            registerPainter('canvas', CanvasPainter);
            this.render = init(container);
            console.log(this.render);
        }
        Flow.prototype.init = function () { };
        return Flow;
    }());

    return Flow;

}));
