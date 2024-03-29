'use strict'

var CryptoJS = require('crypto-js')

var KOCString = module.exports = {
  CryptoJS,
  // region Regular 正则表达式验证
  Regular: {
    Data: {
      Phone: /^1\d{10}$/,
      Tell: /\d{3}-\d{8}|\d{4}-\d{7}/,
      IDCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
      Email: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
      QQ: /[1-9][0-9]{4,}/,
      IPv4: /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/,
      Http: /^http(s)?:\/\//i
    },
    Verify: function (str, type) {
      type = KOCString.Regular.Data[type]
      return type ? (type).test(str) : false
    },
  },
  // endregion
  // region StringLength 取得字符串长度(一个中文为两个长度)
  StringLength: function (val) {
    val = KOCString.ToString(val)
    return val.replace(/[\u0391-\uFFE5]/g, 'aa').length
    /* C */
    // var cArr = val.match(/[^\x00-\xff]/ig);
    // return val.length + (cArr ? 0 : cArr.length);

  },
  // endregion
  // region StringLengthCut 截取字符串长度(一个中文为两个长度)
  StringLengthCut: function (val, length, str) {
    length = KOCString.ToIntPositive(length)
    if (!length) {
      return val
    }
    val = KOCString.ToString(val)
    /* L */
    var retString = ''
    /* L */
    var isCut = false
    for (var i = 0; i < val.length; i++) {
      length -= (val[i].match(/[^\x00-\xff]/ig) !== null ? 2 : 1)
      if (length >= 0) {
        retString += val[i]
      } else {
        isCut = true
        break
      }
    }
    return retString + (isCut && str !== false ? '…' : '')
  },
  // endregion
  // region StringLengthBR 字符串换行
  StringLengthBR: function (val, length) {
    length = KOCString.ToIntPositive(length)
    if (!length) {
      return val
    }
    val = KOCString.ToString(val)
    /* C */
    var retStringArray = []
    /* L */
    var len = length
    var retString = ''
    for (var i = 0; i < val.length; i++) {
      len -= (val[i].match(/[^\x00-\xff]/ig) !== null ? 2 : 1)
      if (len >= 0) {
        retString += val[i]
      } else {
        retStringArray.push(retString)
        len = length - 1
        retString = val[i]
      }
    }
    if (retString) {
      retStringArray.push(retString)
    }
    return retStringArray
  },
  // endregion
  /**
   * 字符串脱敏
   * @param {string} str 原始字符串
   * @param {string} type 类型 Name/Phone/IDCard/Email/QQ
   * @param {string} [char] 替代串，默认*
   * @returns {string}
   */
  Cover: function (str, type, char) {
    str = KOCString.ToString(str)
    if (!str) return ''
    char = char || '*'
    if (type === 'Name') {
      return str.substr(0, 1) + char + char
    } else if ((!type || type === 'Phone') && KOCString.Regular.Verify(str, 'Phone')) {
      return str.substr(0, 3) + char + char + char + char + str.substr(str.length - 4)
    } else if ((!type || type === 'IDCard') && KOCString.Regular.Verify(str, 'IDCard')) {
      return str.substr(0, 6) + char + char + char + char + char + char + char + char + str.substr(str.length - 4)
    } else if ((!type || type === 'Email') && KOCString.Regular.Verify(str, 'Email')) {
      var _index = str.indexOf('@')
      if (_index < 3) {
        return char + char + char + str.substr(_index)
      }
      var _len = KOCString.ToInt(_index / 3)
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(_index - _len)
    } else if ((!type || type === 'QQ') && KOCString.Regular.Verify(str, 'QQ')) {
      var _len = KOCString.ToInt(str.length / 3)
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(str.length - _len)
    } else if (str.length >= 3) {
      var _len = KOCString.ToInt(str.length / 3)
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(str.length - _len)
    } else {
      return char + char + char
    }
  },
  /**
   * 转换成字符串
   * @param val 转换值
   * @return {string}
   */
  ToString: function (val) {
    return val == undefined ? '' : val.toString()
  },
  /**
   * 转换成数组类型值
   * @param {number|object|string|Array} val 转换值
   * @param {Array} [defaultval] 默认值
   * @param {string} [separator] 分隔符(默认,)
   * @return {Array}
   */
  ToArray: function (val, defaultval = [], separator = ',') {
    switch (Object.prototype.toString.call(val)) {
      case '[object Number]':
      case '[object Object]':
        return [val]
      case '[object String]':
        return val.split(separator)
      default:
        return Array.isArray(val) ? val : defaultval
    }
  },
  /**
   * 转换成js object
   * @param val 转换值
   * @param [defaultval] 默认值
   * @return {Object}
   */
  ToObject: function (val, defaultval = undefined) {
    return Object.prototype.toString.call(val) === '[object Object]' ? val : defaultval
  },
  /**
   * 转换成整数类型
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param [positive] 是否必须为正值true/false(当true时如果为负值返回defaultval)
   * @returns {number}
   */
  ToInt: function (val, defaultval, positive) {
    defaultval = parseInt(defaultval)
    defaultval = isNaN(defaultval) ? 0 : defaultval
    val = parseInt(val)
    if (isNaN(val)) {
      val = defaultval
    }
    if (positive && val < 0) {
      val = defaultval
    }
    return val
  },
  /**
   * 转换成当地语言整数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param [minimumFractionDigits] 小数位数
   * @return {string}
   */
  ToIntLocaleStr: function (val, defaultval, minimumFractionDigits) {
    return KOCString.ToInt(val, defaultval, false).toLocaleString('arab', { minimumFractionDigits: minimumFractionDigits })
  },
  /**
   * 转换成正整数
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @return {number}
   */
  ToIntPositive: function (val, defaultval) {
    return KOCString.ToInt(val, defaultval, true)
  },
  /**
   * 转换成当地语言正整数字符串
   * @param val                   转换值
   * @param [defaultval]            默认值(不传为0)
   * @param [minimumFractionDigits] 小数位数
   * @return {string}
   */
  ToIntPositiveLocaleStr: function (val, defaultval, minimumFractionDigits) {
    return KOCString.ToInt(val, defaultval, true).toLocaleString('arab', { minimumFractionDigits: minimumFractionDigits })
  },
  /**
   * 转换成浮点数
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param {number} [fixed] 小数位数 默认值(不传为0)
   * @param {boolean} [str] 是否返回字符串
   * @param [positive] 是否必须为正值true/false(当true时如果为负值返回defaultval)
   * @returns {string|number}
   */
  ToFloat: function (val, defaultval, fixed = 0, str, positive) {
    defaultval = isNaN(parseFloat(defaultval)) ? 0 : parseFloat(defaultval)
    val = parseFloat(val)
    if (isNaN(val)) val = defaultval
    if (positive && val < 0) val = defaultval < 0 ? 0 : defaultval
    fixed = KOCString.ToInt(fixed, -1)
    if (fixed >= 0) val = val.toFixed(fixed)
    val = str ? KOCString.ToString(val) : parseFloat(val)
    return val
  },
  /**
   * 转换成正数浮点数
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param {number} [fixed] 小数位数 默认值(不传为0)
   * @returns {number}
   */
  ToFloatPositive: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, false, true)
  },
  // region ToFloatStr 字符串Float
  /**
   * 转换成数浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param {number} [fixed] 小数位数 默认值(不传为0)
   * @returns {string}
   */
  ToFloatStr: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, true)
  },
  // endregion
  /**
   * 转换成当地语言浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param {number} [fixed] 小数位数 默认值(不传为0)
   * @param {boolean} [positive] 是否必须为正值true/false(当true时如果为负值返回defaultval)
   * @param minimumFractionDigits 使用的小数位数的最小数目.可能的值是从 0 到 20；默认为普通的数字和百分比格式为 0；
   * @return {string}
   */
  ToFloatLocaleStr: function (val, defaultval, fixed = 0, positive = false, minimumFractionDigits) {
    return KOCString.ToFloat(val, defaultval, fixed, false, positive).toLocaleString('arab', { minimumFractionDigits })
  },
  /**
   * 转换成当地语言正浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param {number} [fixed] 小数位数 默认值(不传为0)
   * @returns {string}
   */
  ToFloatPositiveStr: function (val, defaultval, fixed = 0) {
    return KOCString.ToFloat(val, defaultval, fixed, true, true)
  },
  /**
   * 转换成金额浮点数
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @returns {number}
   */
  ToCurrency: function (val, defaultval = 0) {
    return KOCString.ToFloat(val, defaultval, 2)
  },
  /**
   * 转换成金额正浮点数
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @returns {number}
   */
  ToCurrencyPositive: function (val, defaultval = 0) {
    return KOCString.ToFloat(val, defaultval, 2, false, true)
  },
  /**
   * 转换成金额浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @returns {string}
   */
  ToCurrencyStr: function (val, defaultval = 0) {
    return KOCString.ToFloat(val, defaultval, 2, true)
  },
  /**
   * 转换成金额正浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @returns {string|number}
   */
  ToCurrencyPositiveStr: function (val, defaultval = 0) {
    return KOCString.ToFloat(val, defaultval, 2, true, true)
  },
  /**
   * 转换成当地语言金额浮点数字符串
   * @param val 转换值
   * @param [defaultval] 默认值(不传为0)
   * @param positive 是否必须为正值true/false(当true时如果为负值返回defaultval)
   * @return {string}
   */
  ToCurrencyLocaleStr: function (val, defaultval = 0, positive) {
    return KOCString.ToFloatLocaleStr(val, defaultval, 2, positive, 2)
  },
  /**
   * 转换成布尔类型值
   * @param val 转换值
   * @param [defaultval] 默认值(false)
   * @return {boolean}
   */
  ToBoolean: function (val, defaultval = false) {
    if (val === true || val === false) return val
    switch (KOCString.ToString(val).toLowerCase()) {
      case 'true':
      case '1':
        return true
      case 'false':
      case '0':
        return false
      default:
        return !!defaultval
    }
  },
  /**
   * 转成JSON
   * @param {string} val 要转换的字符串
   * @param [defaultval] 默认值(null)
   * @return {JSON|null}
   */
  ToJSON: function (val, defaultval = null) {
    try {
      return JSON.parse(KOCString.ToString(val))
    } catch (ex) {
      return defaultval
    }
  },
  /**
   * JSON清理(把null,un的键删除)只支持一级
   * @param {JSON} val
   * @returns {null|*}
   */
  JSONClear: function (val) {
    try {
      /* C */
      for (var ThisKey in val) {
        if (val[ThisKey] === null || val[ThisKey] === undefined) {
          delete val[ThisKey]
        }
      }
    } catch (ex) {
      return null
    }
    return val
  },
  // region FloatSplit 拆分(拆分为 符号,整数,小数)
  FloatSplit: function (val, fixed) {
    val = KOCString.ToFloatStr(val, 0, fixed).split('.')
    val = {
      Minus: val[0].indexOf('-') === 0,
      Int: val[0].replace('-', ''),
      Decimal: val.length > 1 ? val[1] : null,
    }
    val.Html = '<em>' + (val.Minus ? '-' : '') + val.Int + '</em>' + (val.Decimal ? '.' + val.Decimal : '')
    return val
  },
  // endregion
  // region FloatSplitCurrency
  FloatSplitCurrency: function (val) {
    return KOCString.FloatSplit(val, 2)
  },
  // endregion
  // region MD5
  MD5: function (val) {
    return CryptoJS.MD5(val).toString()
  },
  // endregion
  // region SHA1
  SHA1: function (val) {
    return CryptoJS.SHA1(val).toString()
  },
  // endregion
  // region AESEncrypt:AES加密
  /**************************
   *
   * @param val 字符串
   * @param key 密钥
   * @returns {string} 加密字符串
   *************************/
  AESEncrypt: function (val, key) {
    return CryptoJS.AES.encrypt(val, key).toString()
  },
  // endregion
  // region AESDecrypt:AES解密
  /**************************
   *
   * @param val 字符串
   * @param key 密钥
   * @returns {string} 解密字符串
   **************************/
  AESDecrypt: function (val, key) {
    return CryptoJS.AES.decrypt(val, key).toString(CryptoJS.enc.Utf8)
  },
  // endregion
  // region RandomString 随机字符串
  /**
   * 随机字符串
   * @param {number} len 长度
   * @returns {string}
   */
  RandomString: function (len) {
    len = len || 32
    /* C */
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'//默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    /* C */
    var maxPos = chars.length
    /* L */
    var str = ''
    for (/* L */ var i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return str
  },
  // endregion
  /**
   * 用于解析和格式化 URL 查询字符串
   * @method parse(str[, sep[, eq[, options]]]) 将 URL 查询字符串 str 解析为键值对的集合
   * @method stringify(obj[, sep[, eq[, options]]]) 通过 obj 生成 URL 查询字符串
   * @return {string | Object}
   */
  QueryString: require('qs')
}
