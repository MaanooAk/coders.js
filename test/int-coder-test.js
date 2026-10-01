
/**
 * @param {any[]} a1
 * @param {any[]} a2
 * @returns {boolean}
 */
function array_equals_ordered(a1, a2) {
    if (a1 === a2) return true;
    if (!a1 || !a2) return !a1 && !a2;
    if (a1.length !== a2.length) return false;
    for (const i in a1) if (a1[i] !== a2[i]) return false
    return true;
}

/**
 * @param {any[]} a1
 * @param {any[]} a2
 * @returns {boolean}
 */
function array_equals_unordered(a1, a2) {
    if (a1 === a2) return true;
    if (!a1 || !a2) return !a1 && !a2;
    if (a1.length !== a2.length) return false;
    const count = new Map();
    for (const i of a1) count.set(i, (count.get(i) ?? 0) + 1);
    for (const i of a2) count.set(i, (count.get(i) ?? 0) - 1);
    for (const i of count.values()) if (i !== 0) return false;
    return true;
}

/**
 * @param {any[]} a1
 * @param {any[]} a2
 * @returns {boolean}
 */
function dict_equals_unordered(a1, a2) {
    if (a1 === a2) return true;
    if (!a1 || !a2) return !a1 && !a2;
    const e1 = Object.keys(a1), e2 = Object.keys(a2);
    if (!array_equals_unordered(e1, e2)) return false;
    for (const i of e1) if (a1[i] !== a2[i]) return false;
    return true;
}

/**
 * @param {number[] | object} list
 */
function test(object) {
    if (Array.isArray(object)) {
        test_ordered(object)
        test_unordered(object)
    } else {
        test_dict(object)
    }
}

/**
 * @param {number[]} list 
 */
function test_ordered(list) {
    const text = list.join(",")
    const encoded = int_list_encode(list)
    const decoded = int_list_decode(encoded)

    if (list.length <= 50) {
        console.log(text)
        console.log(int_list_encode(list, 10))
        console.log(list.map(i => i.toString(36)).join(","))
        console.log(encoded)
    } else {
        console.log(list.length + " ints")
    }

    if (!array_equals_unordered(list, decoded)) {
        console.log(decoded.join(","))
        throw new Error("FAIL")
    }

    console.log((100 * encoded.length / text.length).toFixed(0) + "%")
    console.log()
}

/**
 * @param {number[]} list 
 */
function test_unordered(list) {
    const text = list.join(",")
    const encoded = int_set_encode(list)
    const decoded = int_set_decode(encoded)

    if (list.length <= 50) {
        console.log(text)
        console.log(int_set_encode(list, 10))
        console.log(list.map(i => i.toString(36)).join(","))
        console.log(encoded)
    } else {
        console.log(list.length + " ints")
    }

    if (!array_equals_unordered(list, decoded)) {
        console.log(decoded.join(","))
        throw new Error("FAIL")
    }

    console.log((100 * encoded.length / text.length).toFixed(0) + "%")
    console.log()
}

/**
 * @param {object} object 
 */
function test_dict(object) {
    const list = Object.entries(object).flat()
    const text = list.join(",")
    const encoded = int_dict_encode(object)
    const decoded = int_dict_decode(encoded)

    if (list.length <= 50) {
        console.log(text)
        console.log(int_dict_encode(object, 10))
        console.log(list.map(i => i.toString(36)).join(","))
        console.log(encoded)
    } else {
        console.log(list.length + " ints")
    }

    if (!dict_equals_unordered(object, decoded)) {
        console.log(decoded)
        throw new Error("FAIL")
    }

    console.log((100 * encoded.length / text.length).toFixed(0) + "%")
    console.log()
}


test([])
test([0])
test([0, 0])
test([0, 0, 0, 0])
test([1, 10, 100, 1000])
test([1, 2, 3])
test([1, 10, 11, 20, 22, 20])
test([1612738, 1612728, 1612745, 1612787, 1612799])
test([1, 10, 11, 20, 22, 1612738, 1612728, 1612745, 1612787, 1612799])
test([-10, -11, -20, 22])
test([1, 1, 1, 2, 2, 2, 3, 3, 3])
test([-1])
test([-1, -1, -2, -2, -3])
test([Number.MAX_SAFE_INTEGER])
test([Number.MAX_SAFE_INTEGER, 0, -1])
test([5, 4, 3, 2, 1])
test([1, 3, 5, 7, 9, 2, 4, 6, 8, 0])
test([100, 100, 100, 101, 101, 102])
test([1, 2, 2, 3, 3, 3, 2, 1])
test([42])
test([42, 42])
test([0, -0, 0])
test([10, -10, 10, -10, 10])
test([1, 2, 2, 1, 1, 2, 1, 1, 4, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
test([1000, 2000, 3000, 1000, 2000, 3000, 1000, 2000, 3000])
test(Array.from({ length: 50 }, (_, i) => i))
test(Array.from({ length: 50 }, (_, i) => 49 - i))
test(Array.from({ length: 50 }, (_, i) => 10))

test({})
test({0:0})
test({ 2: 1, 1: 10, 0: 100 })
test({ 2: 0, 10: 1, 100: 0 })
test({1612738: 10, 1612728: 10, 1612745: 10})
test({10: 1612738, 11: 1612728, 12: 1612745})
