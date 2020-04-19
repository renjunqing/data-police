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
