const JSON = require('json3')
const glob = require('glob')
const path = require('path')
const { join, basename } = path
const { readdirSync, existsSync, statSync, lstatSync } = require('fs')
const toISOString = require('@segment/to-iso-string')

const exists = existsSync

/**
 * Ignored directories.
 */
var ignore = ['node_modules', '.git']

exports.inherits = require('util').inherits

/**
 * If a value could have properties, and has none, this function is called,
 * which returns a string representation of the empty value.
 *
 * Functions w/ no properties return `'[Function]'`
 * Arrays w/ length === 0 return `'[]'`
 * Objects w/ no properties return `'{}'`
 * All else: return result of `value.toString()`
 *
 * @api private
 * @param {*} value The value to inspect.
 * @param {string} typeHint The type of the value
 * @returns {string}
 */
function emptyRepresentation (value, typeHint) {
  switch (typeHint) {
    case 'function':
      return '[Function]'
    case 'object':
      return '{}'
    case 'array':
      return '[]'
    default:
      return value.toString()
  }
}

/**
 * Takes some variable and asks `Object.prototype.toString()` what it thinks it
 * is.
 *
 * @api private
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
 * @param {*} value The value to test.
 * @returns {string} Computed type
 * @example
 * type({}) // 'object'
 * type([]) // 'array'
 * type(1) // 'number'
 * type(false) // 'boolean'
 * type(Infinity) // 'number'
 * type(null) // 'null'
 * type(new Date()) // 'date'
 * type(/foo/) // 'regexp'
 * type('type') // 'string'
 * type(global) // 'global'
 * type(new String('foo') // 'object'
 */
var type = exports.type = function type (value) {
  if (value === undefined) {
    return 'undefined'
  } else if (value === null) {
    return 'null'
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return 'buffer'
  }
  return Object.prototype.toString.call(value)
    .replace(/^\[.+\s(.+?)]$/, '$1')
    .toLowerCase()
}

/**
 * Stringify `value`. Different behavior depending on type of value:
 *
 * - If `value` is undefined or null, return `'[undefined]'` or `'[null]'`, respectively.
 * - If `value` is not an object, function or array, return result of `value.toString()` wrapped in double-quotes.
 * - If `value` is an *empty* object, function, or array, return result of function
 *   {@link emptyRepresentation}.
 * - If `value` has properties, call {@link exports.canonicalize} on it, then return result of
 *   JSON.stringify().
 *
 * @api private
 * @see exports.type
 * @param {*} value
 * @return {string}
 */
exports.stringify = function (value) {
  var typeHint = type(value)

  if (!~['object', 'array', 'function'].indexOf(typeHint)) {
    if (typeHint === 'buffer') {
      var json = value.toJSON()
      // Based on the toJSON result
      return jsonStringify(json.data && json.type ? json.data : json, 2)
        .replace(/,(\n|$)/g, '$1')
    }

    // IE7/IE8 has a bizarre String constructor; needs to be coerced
    // into an array and back to obj.
    if (typeHint === 'string' && typeof value === 'object') {
      value = value.split('').reduce(function (acc, char, idx) {
        acc[idx] = char
        return acc
      }, {})
      typeHint = 'object'
    } else {
      return jsonStringify(value)
    }
  }

  for (var prop in value) {
    if (Object.prototype.hasOwnProperty.call(value, prop)) {
      return jsonStringify(exports.canonicalize(value, null, typeHint), 2).replace(/,(\n|$)/g, '$1')
    }
  }

  return emptyRepresentation(value, typeHint)
}

/**
 * like JSON.stringify but more sense.
 *
 * @api private
 * @param {Object}  object
 * @param {number=} spaces
 * @param {number=} depth
 * @returns {*}
 */
function jsonStringify (object, spaces, depth) {
  if (typeof spaces === 'undefined') {
    // primitive types
    return _stringify(object)
  }

  depth = depth || 1
  var space = spaces * depth
  var str = Array.isArray(object) ? '[' : '{'
  var end = Array.isArray(object) ? ']' : '}'
  var length = typeof object.length === 'number' ? object.length : exports.keys(object).length
  // `.repeat()` polyfill
  function repeat (s, n) {
    return new Array(n).join(s)
  }

  function _stringify (val) {
    switch (type(val)) {
      case 'null':
      case 'undefined':
        val = '[' + val + ']'
        break
      case 'array':
      case 'object':
        val = jsonStringify(val, spaces, depth + 1)
        break
      case 'boolean':
      case 'regexp':
      case 'symbol':
      case 'number':
        val = val === 0 && (1 / val) === -Infinity // `-0`
          ? '-0'
          : val.toString()
        break
      case 'date':
        var sDate
        if (isNaN(val.getTime())) { // Invalid date
          sDate = val.toString()
        } else {
          sDate = val.toISOString ? val.toISOString() : toISOString(val)
        }
        val = '[Date: ' + sDate + ']'
        break
      case 'buffer':
        var json = val.toJSON()
        // Based on the toJSON result
        json = json.data && json.type ? json.data : json
        val = '[Buffer: ' + jsonStringify(json, 2, depth + 1) + ']'
        break
      default:
        val = (val === '[Function]' || val === '[Circular]')
          ? val
          : JSON.stringify(val) // string
    }
    return val
  }

  for (var i in object) {
    if (!Object.prototype.hasOwnProperty.call(object, i)) {
      continue // not my business
    }
    --length
    str += '\n ' + repeat(' ', space) +
      (Array.isArray(object) ? '' : '"' + i + '": ') + // key
      _stringify(object[i]) +                    // value
      (length ? ',' : '')                       // comma
  }

  return str +
    // [], {}
    (str.length !== 1 ? '\n' + repeat(' ', --space) + end : end)
}

/**
 * Return a new Thing that has the keys in sorted order. Recursive.
 *
 * If the Thing...
 * - has already been seen, return string `'[Circular]'`
 * - is `undefined`, return string `'[undefined]'`
 * - is `null`, return value `null`
 * - is some other primitive, return the value
 * - is not a primitive or an `Array`, `Object`, or `Function`, return the value of the Thing's `toString()` method
 * - is a non-empty `Array`, `Object`, or `Function`, return the result of calling this function again.
 * - is an empty `Array`, `Object`, or `Function`, return the result of calling `emptyRepresentation()`
 *
 * @api private
 * @see {@link exports.stringify}
 * @param {*} value Thing to inspect.  May or may not have properties.
 * @param {Array} [stack=[]] Stack of seen values
 * @param {string} [typeHint] Type hint
 * @return {(Object|Array|Function|string|undefined)}
 */
exports.canonicalize = function canonicalize (value, stack, typeHint) {
  var canonicalizedObj
  /* eslint-disable no-unused-vars */
  var prop
  /* eslint-enable no-unused-vars */
  typeHint = typeHint || type(value)
  function withStack (value, fn) {
    stack.push(value)
    fn()
    stack.pop()
  }

  stack = stack || []

  if (stack.indexOf(value) !== -1) {
    return '[Circular]'
  }

  switch (typeHint) {
    case 'undefined':
    case 'buffer':
    case 'null':
      canonicalizedObj = value
      break
    case 'array':
      withStack(value, function () {
        canonicalizedObj = exports.map(value, function (item) {
          return exports.canonicalize(item, stack)
        })
      })
      break
    case 'function':
      /* eslint-disable guard-for-in */
      for (prop in value) {
        canonicalizedObj = {}
        break
      }
      /* eslint-enable guard-for-in */
      if (!canonicalizedObj) {
        canonicalizedObj = emptyRepresentation(value, typeHint)
        break
      }
    /* falls through */
    case 'object':
      canonicalizedObj = canonicalizedObj || {}
      withStack(value, function () {
        exports.forEach(exports.keys(value).sort(), function (key) {
          canonicalizedObj[key] = exports.canonicalize(value[key], stack)
        })
      })
      break
    case 'date':
    case 'number':
    case 'regexp':
    case 'boolean':
    case 'symbol':
      canonicalizedObj = value
      break
    default:
      canonicalizedObj = value + ''
  }

  return canonicalizedObj
}
