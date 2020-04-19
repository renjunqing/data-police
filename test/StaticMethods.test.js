// var Validator = require('../src/index.js')
import Validator from '../src/index.js'
Validator.loadLogicOperators({
  $not(rule, dataValue, path, traverse) {
    return !traverse(rule, dataValue, path)
  }
})

Validator.loadCheckOperators({
  $isMyName(rule, dataValue) {
    return rule === (dataValue === '任军庆')
  }
})

test('test StaticMethods', () => {
  var err = 'StaticMethods出错'
  const v1 = new Validator({
    a: {
      $not: {
        $isMyName: true
      }
    },
    $message: err
  })
  expect(v1.check({
    a: '庆军任'
  })).toBeNull()
  expect(v1.check({
    a: '任军庆'
  })).toBe(err)
})
