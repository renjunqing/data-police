import Validator from '../src/index.js'
test('test 捷径', () => {
  var err = '捷径出错'
  const v1 = new Validator({
    '.a.b': {
      $type: 'Number',
      $value: 3
    },
    '.a.c[0]': {
      $type: 'Number',
      $value: 3
    },
    $message: err
  })
  expect(v1.check({
    a: {
      b: 3,
      c: [3]
    },
  })).toBeNull()
})

test('test 指定路径', () => {
  var err = '指定路径出错'
  const v1 = new Validator({
    a: 2,
    b: 4,
    $message: err
  })
  expect(v1.check({
    a: 2,
    b: 3
  }, undefined, {
    path: '.a',
    node: 'root'
  })).toBeNull()
  expect(v1.check(2, undefined, {
    path: '.a',
    node: 'branch'
  })).toBeNull()
})

test('test 路径交换等价性', () => {
  var err = '路径交换等价性出错'
  const v1 = new Validator({
    a: {
      $or: [
        {
          $gt: 1
        },
        {
          $gt: 2
        }
      ]
    },
    b: {
      $gt: {
        $or: [1, 2]
      }
    },
    $message: err
  })
  expect(v1.check({
    a: 0,
    b: 0
  })).toBeNull()
})

test('test 禁止多传字段', () => {
  var err = '禁止多传字段出错'
  const v1 = new Validator({
    a: 0,
    b: 0,
    $message: err
  })
  expect(v1.check({
    a: 0,
    b: 0,
    c: 0
  }, {
    more: false,
    less: true
  })).toBe('非法字段路径：.c')
})

test('test 禁止字段缺失', () => {
  var err = '禁止字段缺失出错'
  const v1 = new Validator({
    a: 0,
    b: 0,
    $message: err
  })
  expect(v1.check({
    a: 0
  }, {
    more: true,
    less: false
  })).toBe(err)
})
