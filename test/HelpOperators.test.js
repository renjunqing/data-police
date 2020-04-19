import Validator from '../src/index.js'
test('test $unique', () => {
  var err = '$unique出错'
  const v1 = new Validator({
    a: [{
      $unique: true,
      $type: 'Number'
    }],
    $message: err
  })
  expect(v1.check({
    a: [1, 3, 4],
  })).toBeNull()
  const v2 = new Validator({
    a: [{
      // $unique: false,
      $type: 'Number'
    }],
    $message: err
  })
  expect(v2.check({
    a: [1, 3, 4],
  })).toBeNull()
})
