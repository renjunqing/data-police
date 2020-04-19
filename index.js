import EC from 'exact-calculation'

/**
 * 规则与数据匹配模式：
 * cover：即现有逻辑
 * contain：规则与数据生成全量路径进行比对，不允许数据路径多于规则路径，若少于规则路径，则设置t函数校验dataValue === undefined 立即返回true。
*/
function _type(value, type) {
  return ({}).toString.call(value).slice(8, -1)
}
function _get(value, path) {
  try {
    return eval('value' + path)
  } catch(e) {
    return undefined
  }
}
function _set(value, path) {
  var pathArr = path.replace(/\[|\]/g, '.').split('.').filter(v => !!v).map(v => v.replace(/\'|\"/g, ''))
  var o = {}
  pathArr.reduce((o, key, index) => {
    if (index === pathArr.length - 1) {
      o[key] = value
    } else {
      o[key] = {}
    }
    return o[key]
  }, o)
  return o
}
var targetPath = '', errMsg = ''
const CheckOperators = ['$type', '$gt', '$gte', '$lt', '$lte', '$factor', '$value', '$isEmail', '$isTel', '$isUrl', '$isID', '$pattern', '$len', '$fn']
const LogicOperators = ['$or', '$and', '$if']
const HelpOperators = ['$message', '$proxy', '$unique']
const parsers = {
  $if([conditionRule, checkRule], dataValue) {
    if (t(conditionRule, dataValue)) {
      return t(checkRule, dataValue)
    } else {
      return true
    }
  },
  $or(rule, dataValue, path) {
    return rule.some((ruleItem, index) => {
      return t(ruleItem, dataValue, path)
    })
  },
  $and(rule, dataValue, path) {
    return rule.every((ruleItem, index) => {
      return t(ruleItem, dataValue, path)
    })
  },
  $type(rule, dataValue, path) {
    return t(rule, _type(dataValue), path)
  },
  $value(rule, dataValue, path) {
    return t(rule, dataValue, path)
  },
  // 数字类
  $gt(rule, dataValue) {
    return dataValue < rule
  },
  $gte(rule, dataValue) {
    return dataValue <= rule
  },
  $lt(rule, dataValue) {
    return dataValue > rule
  },
  $lte(rule, dataValue) {
    return dataValue >= rule
  },
  $factor(rule, dataValue, places = 2) {
    const ec = new EC(places)
    return ec.rem(dataValue, rule) === 0
    // return dataValue % rule === 0
  },
  // 字符串类
  $isEmail(rule, dataValue) {
    return rule === /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(dataValue)
  },
  $isTel(rule, dataValue) {
    return rule === /^1[3456789]\d{9}$/.test(dataValue)
  },
  $isUrl(rule, dataValue) {
    return rule === /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(dataValue)
  },
  $isID(rule, dataValue) {
    var weight_factor = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
    // 校验码
    var check_code = ['1', '0', 'X' , '9', '8', '7', '6', '5', '4', '3', '2'];
    var code = dataValue + '';
    var last = dataValue[17];//最后一位
    var seventeen = code.substring(0,17);
    var arr = seventeen.split('');
    var len = arr.length;
    var num = 0;
    for(var i = 0; i < len; i++){
        num = num + arr[i] * weight_factor[i];
    }
    var resisue = num%11;
    var last_no = check_code[resisue];
    var idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;
    var format = idcard_patter.test(dataValue);

    return rule === (last === last_no && format ? true : false);
  },
  $pattern(rule, dataValue) {
    return rule.test(dataValue)
  },
  $len(rule, dataValue) {
    return rule === dataValue.length
  },
  $fn(rule, dataValue) {
    return rule(dataValue)
  }
}

function flip(rule) {
  var type = _type(rule)
  switch(type) {
    case 'Object':
      var target = {}
      var exchangedRule = exchange(rule)
      Object.keys(exchangedRule).forEach(key => {
        target[key] = flip(exchangedRule[key])
      })
      return target
    case 'Array':
      return rule.map(ruleItem => flip(ruleItem))
      break
    default:
      return rule
  }
}
function exchange(source) {
  var target = {}
  Object.keys(source).forEach(key => {
    if (~CheckOperators.indexOf(key) && _type(source[key]) === 'Object') {
      Object.keys(source[key]).forEach(_key => {
        if (~LogicOperators.indexOf(_key)) {
          // map认为所有逻辑运算符都是数组
          target[_key] = source[key][_key].map((ruleItem, index) => {
            if (_key === '$if' && index === 0) {
              return ruleItem
            }
            return {
              [key]: ruleItem
            }
          })
        } else {
          target[_key] = source[key][_key]
        }
      })
    } else {
      target[key] = source[key]
    }
  })
  return target
}

function t(rule, dataValue, path = '') {
  var type = _type(rule)
  if (targetPath && !targetPath.startsWith(path) && !path.startsWith(targetPath)) {
    // 如果校验后代子节点，路径发生偏差时跳过
    return true
  }
  switch(type) {
    case 'Object':
      var result = Object.keys(rule).every((key, index) => {
        if (~[...CheckOperators, ...LogicOperators].indexOf(key)) {
          return parsers[key](rule[key], dataValue, path, t)
        } else if (~HelpOperators.indexOf(key)) {
          // 辅助标记，不作为校验节点
          return true
        } else {
          if (!key.startsWith('.')) {
            return t(rule[key], dataValue[key], path + '.' + key)
          } else {
            return t(rule[key], _get(dataValue, key), path + key)
          }
        }
      })
      if (!result) {
        errMsg = rule.$message
      }
      return result
      break
    case 'Array':
      if (rule[0].$unique) {
        return dataValue.every((dataItem, dataIndex) => t(rule[0], dataItem, path + '[' + dataIndex + ']'))
      } else {
        return rule.every((ruleItem, index) => t(ruleItem, dataValue[index], path + '[' + index + ']'))
      }
      break
    default:
      return rule === dataValue
  }
}

function createRulePaths(rule, path) {
  var type = _type(rule)
  switch(type) {
    case 'Object':
      Object.keys(rule).every((key, index) => {
        if (~[...CheckOperators, ...LogicOperators].indexOf(key)) {
          return createRulePaths(rule[key], path)
        } else if (~HelpOperators.indexOf(key)) {
          // 辅助标记，不作为校验节点
          return true
        } else {
          if (!key.startsWith('.')) {
            return createRulePaths(rule[key], path + '.' + key)
          } else {
            return createRulePaths(rule[key], path + key)
          }
        }
      })
      break
    case 'Array':
      rule.every((ruleItem, index) => {
        createRulePaths(ruleItem, path + '[' + index + ']')
      })
      break
    default:
      return console.log(path)
  }
}


class Validator {
  constructor(rule) {
    console.log(rule)
    createRulePaths(rule, '')
    this._rule = flip(rule)
  }
  static loadCheckOperators(operatorObj) {
    Object.keys(operatorObj).forEach(key => {
      CheckOperators.push(key)
      parsers[key] = operatorObj[key]
    })
  }
  static loadLogicOperators(operatorObj) {
    Object.keys(operatorObj).forEach(key => {
      LogicOperators.push(key)
      parsers[key] = operatorObj[key]
    })
  }
  static loadHelpOperators(operatorObj) {
    Object.keys(operatorObj).forEach(key => {
      HelpOperators.push(key)
    })
  }
  check(value, path, node) {
    targetPath = path
    if (node === 'branch') {
      value = _set(value, path)
    }
    try {
      var b = t(this._rule, value)
      targetPath = ''
      if (b) {
        return null
      } else {
        return errMsg
      }
      return null
    } catch(e) {
      return e
    }
  }
}
export default Validator