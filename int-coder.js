/**
 * int-coder.js
 * version: 0.2
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/coders.js
 */

// @ts-check

/**
 * @typedef {Object} IntOptions
 * @property {number} radix
 * @property {boolean} sorted
 * @property {boolean} partial
 * @property {boolean} mapping
 */

/**
 * @param {number[]} list 
 * @param {Partial<IntOptions>} options 
 * @returns {string}
 */
function int_list_encode(list, options) { return "" }

/**
 * @param {number[]} list 
 * @param {Partial<IntOptions>} options 
 * @returns {string}
 */
function int_bag_encode(list, options) { return "" }

/**
 * @param {number[]} list 
 * @param {Partial<IntOptions>} options 
 * @returns {string}
 */
function int_set_encode(list, options) { return "" }

/**
 * @param {{ [key: number]: number }} object 
 * @param {Partial<IntOptions>} options 
 * @returns {string}
 */
function int_dict_encode(object, options) { return "" }

// /**
//  * @param {{ [key: number]: any }} object 
//  * @param {Partial<IntOptions>} options 
//  * @returns {string}
//  */
// function int_keys_encode(object, options) { return "" }

// /**
//  * @param {{ [key: string]: number }} object 
//  * @param {Partial<IntOptions>} options 
//  * @returns {string}
//  */
// function int_values_encode(object, options) { return "" }

/**
 * @param {string} text
 * @param {Partial<IntOptions>} options 
 * @returns {number[]}
 */
function int_list_decode(text, options) { return [] }

/**
 * @param {string} text
 * @param {Partial<IntOptions>} options 
 * @returns {number[]}
 */
function int_bag_decode(text, options) { return [] }

/**
 * @param {string} text
 * @param {Partial<IntOptions>} options 
 * @returns {number[]}
 */
function int_set_decode(text, options) { return [] }

/**
 * @param {string} text
 * @param {Partial<IntOptions>} options 
 * @returns {{ [key: number]: number }}
 */
function int_dict_decode(text, options) { return {} }

// /**
//  * @param {string} text
//  * @param {Partial<IntOptions>} options 
//  * @returns {{ [key: number]: any }}
//  */
// function int_keys_decode(text, options) { return {} }

// /**
//  * @param {string} text
//  * @param {Partial<IntOptions>} options 
//  * @returns {{ [key: string]: number }}
//  */
// function int_values_decode(text, options) { return {} }


// === IMPL ===

(() => {

    /**
     * @param {number[]} list 
     * @param {Partial<IntOptions>} options 
     * @returns {string}
     */
    function simple_list_encode(list, options) {
        const radix = options.radix ?? 36

        /** @type {string[]} */
        const tokens = []

        function push(op = "", number = 0, v = 0) {
            tokens.push(op, number.toString(radix))
        }

        let current = 0
        let range = 0
        let repeat = 0

        for (const i of list) {
            if (i === current + 1) {
                if (repeat > 0) push("*", repeat, repeat = 0)
                range += 1
            } else {
                if (range > 0) push(":", range, range = 0)
                if (i === current) {
                    repeat += 1
                } else {
                    if (repeat > 0) push("*", repeat, repeat = 0)
                    const d = i - current
                    if (Math.abs(d) > Math.abs(i)) {
                        push(i >= 0 ? "=" : "!", Math.abs(i))
                    } else if (d >= 0) {
                        push("+", d)
                    } else {
                        push("-", -d)
                    }
                }
            }
            current = i
        }
        if (range > 0) push(":", range)
        if (repeat > 0) push("*", repeat)

        return tokens.join("")
    }

    /**
     * @param {number[]} list
     * @returns {number[] | null}
     */
    function get_uniq(list) {
        if (list.length <= 4) return null
        const mid = (list.length / 2) | 0
        const uniq = new Set()
        for (let i = 0; i < mid; i++) {
            uniq.add(list[i])
        }
        if (uniq.size / mid >= .9) return null
        for (let i = mid; i < list.length; i++) {
            uniq.add(list[i])
        }
        return [...uniq]
    }

    /**
     * @param {number[]} list 
     * @param {Partial<IntOptions>} options 
     * @returns {string}
     */
    function list_encode(list, options = {}, sort = false) {

        if (sort && !options.sorted) {
            list = list.slice().sort((a, b) => a - b)
        }

        let uniq = get_uniq(list)
        if (uniq) {
            uniq.sort((a, b) => a - b)

            const mapping = list.map(i => uniq.indexOf(i))
            const mapped = simple_list_encode(uniq, options) + "." + simple_list_encode(mapping, options)

            const simple = simple_list_encode(list, options)

            return simple.length < mapped.length ? simple : mapped
        }

        return simple_list_encode(list, options)
    }


    /**
     * @param {string} text
     * @param {Partial<IntOptions>} options 
     * @returns {number[]}
     */
    function simple_list_decode(text, options) {
        const radix = options.radix ?? 36

        const tokens = text.matchAll(/([=!+\-:*])(\w+)/g)

        const list = []
        let current = 0

        for (const [, op, text] of tokens) {
            const number = Number.parseInt(text, radix)

            if (op === "+") {
                list.push(current += number)
            } else if (op === "=") {
                list.push(current = number)
            } else if (op === "-") {
                list.push(current -= number)
            } else if (op === "!") {
                list.push(current = -number)
            } else if (op === "*") {
                for (let i = 1; i <= number; i++)  list.push(current)
            } else if (op === ":") {
                for (let i = 1; i <= number; i++) list.push(current + i)
                current += number
            } else {
                throw new Error(op)
            }
        }

        return list
    }

    /**
     * @param {string} text
     * @param {Partial<IntOptions>} options 
     * @returns {number[]}
     */
    function list_decode(text, options = {}) {

        if (text.indexOf(".") === -1) {
            return simple_list_decode(text, options)
        }

        const [text1, text2] = text.split(".")
        const uniq = simple_list_decode(text1, options)
        const mapping = simple_list_decode(text2, options)

        return mapping.map(i => uniq[i])
    }

    // @ts-ignore
    int_list_encode = function (list, options = {}) { return list_encode(list, options) }
    // @ts-ignore
    int_bag_encode = function (list, options = {}) { return list_encode(list, options, true) }
    // @ts-ignore
    int_set_encode = function (list, options = {}) { return list_encode(list, options, true) }

    // @ts-ignore
    int_list_decode = function (list, options = {}) { return list_decode(list, options) }
    // @ts-ignore
    int_bag_decode = function (list, options = {}) { return list_decode(list, options) }
    // @ts-ignore
    int_set_decode = function (list, options = {}) { return list_decode(list, options) }

    /**
     * @param {{ [key: number]: number }} object 
     * @param {Partial<IntOptions>} options 
     * @returns {string}
     */
    function dict_encode(object, options) {

        const entries = Object.entries(object).map(i => [+i[0], i[1]])

        if (entries.length == 0) return ","

        entries.sort((a, b) => a[0] - b[0])
        const keys = [
            list_encode(entries.map(i => i[0]), options, false),
            list_encode(entries.map(i => i[1]), options, false),
        ].join(",")

        entries.sort((a, b) => (+a[1]) - (+b[1]))
        const values = [
            list_encode(entries.map(i => i[0]), options, false),
            list_encode(entries.map(i => i[1]), options, false),
        ].join(",")

        const groups = [""]
        const group_values = []
        for (let start = 0; start < entries.length; ) {
            let end = start
            while (end + 1 < entries.length && entries[end + 1][1] === entries[start][1]) end++
            group_values.push(entries[start][1])
            groups.push(list_encode(entries.slice(start, end + 1).map(i => i[0]), options, true))
            start = end + 1
        }
        groups[0] = list_encode(group_values, options, false)
        const grouping = groups.join(",")

        if (groups.length < 3) {
            return keys.length < values.length ? keys : values
        }

        const min_length = Math.min(grouping.length, keys.length, values.length)
        return keys.length == min_length ? keys : values.length == min_length ? values : grouping
    }

    /**
     * @param {string} text
     * @param {Partial<IntOptions>} options 
     * @returns {{ [key: any]: number }}
     */
    function dict_decode(text, options) {

        const parts = text.split(",")
        const object = {}

        if (parts.length == 2) {
            const keys = list_decode(parts[0])
            const values = list_decode(parts[1])
            for (let i = 0; i < keys.length; i++) {
                // @ts-ignore
                object[keys[i]] = values[i]
            }
        } else {
            const values = list_decode(parts[0])
            for (let i = 0; i < values.length; i++) {
                const value = values[i]
                const keys = list_decode(parts[i + 1])
                for (const key of keys) {
                    // @ts-ignore
                    object[key] = value
                }
            }
        }
        return object
    }

    // @ts-ignore
    int_dict_encode = function (object, options = {}) { return dict_encode(object, options) }
    // @ts-ignore
    int_dict_decode = function (text, options = {}) { return dict_decode(text, options) }

})();
