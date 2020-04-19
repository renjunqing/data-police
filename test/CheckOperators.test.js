import Validator from '../src/index.js'
test('test 通用操作符', () => {
  var err = '通用操作符运算出错'
  const v1 = new Validator({
    a: {
      $type: 'Number',
      $value: 2,
      $fn(dataValue) {
        if (dataValue === 2) return true
      }
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
})

test('test 数字操作符', () => {
  var err = '数字操作符运算出错'
  const v1 = new Validator({
    a: {
      $gt: 3,
      $gte: 2,
      $lt: 1,
      $lte: 2,
      $factor: 1
    },
    $message: err
  })
  expect(v1.check({
    a: 2,
  })).toBeNull()
})

test('test 字符串操作符', () => {
  var err = '字符串操作符运算出错'
  const v1 = new Validator({
    email: {
      $isEmail: true
    },
    tel: {
      $isTel: true
    },
    url: {
      $isUrl: true
    },
    ID: {
      $isID: true
    },
    pattern: {
      $pattern: /^\w{3}\d{3}$/
    },
    len: {
      $len: 4
    },
    $message: err
  })
  expect(v1.check({
    email: '43432@fds.net',
    tel: '15209876543',
    url: 'https://junqing.ren',
    ID: '11010119900307205X',
    pattern: 'wer347',
    len: '3r5v'
  })).toBeNull()
})