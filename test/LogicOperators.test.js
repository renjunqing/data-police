// var Validator = require('../src/index.js')
import Validator from '../src/index.js'

/**
 * 逻辑元素符较少，每个运算符的测试用例提供了校验通过/不通过一对用例。
*/

test('test $or', () => {
  var err = '$or运算出错'
  const v1 = new Validator({
    a: {
      $or: [2, 4]
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
  expect(v1.check({
    a: 3,
  })).toBe(err)
})

test('test $and', () => {
  var err = '$and运算出错'
  const v1 = new Validator({
    a: {
      $and: [
      {
        $type: 'Number',
      },
      2
      ]
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
  expect(v1.check({
    a: 21,
  })).toBe(err)
})

test('test $and', () => {
  var err = '$and运算出错'
  const v1 = new Validator({
    a: {
      $and: [
      {
        $type: 'Number',
      },
      2
      ]
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
  expect(v1.check({
    a: 21,
  })).toBe(err)
})

test('test $if', () => {
  var err = '$if运算出错'
  const v1 = new Validator({
    a: {
      $if: [
      {
        $type: 'Number',
      },
      2
      ]
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
  expect(v1.check({
    a: '21',
  })).toBeNull()
})