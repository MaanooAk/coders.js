/**
 * int-set-coder.js
 * version: 0.1
 * author: Akritas Akritidis
 * repo: https://github.com/MaanooAk/coders.js
 */

// @ts-check

/**
 * @param {number[]} list 
 * @returns {string}
 */
function int_set_encode(list, radix = 36) {

    const sorted = list.slice().sort((a, b) => a - b)

    /** @type {string[]} */
    const tokens = []

    function push(op = "", number = 0, v = 0) {
        tokens.push(op, number.toString(radix))
    }

    let current = 0
    let range = 0
    let repeat = 0

    for (const i of sorted) {
        if (i === current + 1) {
            if (repeat > 0) push("*", repeat, repeat = 0)
            current += 1
            range += 1
        } else {
            if (range > 0) push(":", range, range = 0)
            if (i === current) {
                repeat += 1
            } else {
                if (repeat > 0) push("*", repeat, repeat = 0)
                push("+", i - current, current = i)
            }
        }
    }
    if (range > 0) push(":", range)
    if (repeat > 0) push("*", repeat)

    return tokens.join("")
}

/**
 * @param {string} text
 * @returns {number[]}
 */
function int_set_decode(text, radix = 36) {

    const tokens = text.matchAll(/([+:*])(-?\w+)/g)

    const list = []
    let current = 0

    for (const [, op, text] of tokens) {
        const number = Number.parseInt(text, radix)

        if (op === "+") {
            current += number
            list.push(current)
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
