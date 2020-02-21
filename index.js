'use strict'

var CryptoJS = require('crypto-js')

var KOCString = module.exports = {
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
  // region ToString
  /**
   * @description 转换成字符串
   * @param val 要转换的值
   * @return {string}
   */
  ToString: function (val) {
    return val == undefined ? '' : val.toString()
  },
  // endregion
  // region Cover
  /********************************
   * Cover
   * str
   * type             Phone/IDCard/Email/QQ
   * char             替代串，默认*
   ********************************/
  Cover: function (str, type, char) {
    str = KOCString.ToString(str)
    if (!str) {
      return ''
    }
    char = char || '*'
    if (type == 'Name') {
      return str.substr(0, 1) + char + char
    } else if ((!type || type == 'Phone') &&
      KOCString.Regular.Verify(str, 'Phone')) {
      return str.substr(0, 3) + char + char + char + char +
        str.substr(str.length - 4)
    } else if ((!type || type == 'IDCard') &&
      KOCString.Regular.Verify(str, 'IDCard')) {
      return str.substr(0, 6) + char + char + char + char + char + char + char +
        char + str.substr(str.length - 4)
    } else if ((!type || type == 'Email') &&
      KOCString.Regular.Verify(str, 'Email')) {
      var _index = str.indexOf('@')
      if (_index < 3) {
        return char + char + char + str.substr(_index)
      }
      var _len = KOCString.ToInt(_index / 3)
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(_index - _len)
    } else if ((!type || type == 'QQ') && KOCString.Regular.Verify(str, 'QQ')) {
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
  // endregion
  /**
   * @description 转换成数组类型值
   * @param val 要转换数据
   * @param defaultval 默认值
   * @return {Array}
   */
  ToArray: function (val, defaultval = []) {
    return Array.isArray(val) ? val : defaultval
  },
  /**
   * @description 转换成js object
   * @param val 要转换的数据
   * @param defaultval 默认值
   * @return {Object}
   */
  ToObject: function (val, defaultval = undefined) {
    return Object.prototype.toString.call(val) === '[object Object]' ? val : defaultval
  },
  // region ToInt
  /********************************
   * ToInt
   * val
   * defaultval       默认值(不传为0)
   * positive         是否必须为正值true/false(当true时如果为负值返回defaultval)
   * @return {number}
   ********************************/
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
  // endregion
  // region ToIntLocaleStr
  /**
   * ToIntLocaleStr
   * val                   转换值
   * defaultval            默认值(不传为0)
   * minimumFractionDigits 小数位数
   * @return {string}
   */
  ToIntLocaleStr: function (val, defaultval, minimumFractionDigits) {
    return KOCString.ToInt(val, defaultval, false).toLocaleString('arab', { minimumFractionDigits: minimumFractionDigits })
  },
  // endregion
  // region ToIntPositive
  /**
   * ToIntPositive
   * val                   转换值
   * defaultval            默认值(不传为0)
   *
   * @return {number}
   */
  ToIntPositive: function (val, defaultval) {
    return KOCString.ToInt(val, defaultval, true)
  },
  // endregion
  // region ToIntLocaleStr
  /**
   * ToIntPositiveLocaleStr
   * val                   转换值
   * defaultval            默认值(不传为0)
   * minimumFractionDigits 小数位数
   * @return {string}
   */
  ToIntPositiveLocaleStr: function (val, defaultval, minimumFractionDigits) {
    return KOCString.ToInt(val, defaultval, true).toLocaleString('arab', { minimumFractionDigits: minimumFractionDigits })
  },
  // endregion
  // region ToFloat
  /********************************
   * ToFloat
   * val
   * defaultval       默认值(不传为0)
   * fixed            小数位数
   * str              是否返回字符串
   * notnegative      是否必须为正值true/false(当true时如果为负值返回defaultval)
   ********************************/
  ToFloat: function (val, defaultval, fixed, str, positive, notnegative) {
    defaultval = isNaN(parseFloat(defaultval)) ? 0 : parseFloat(defaultval)
    val = parseFloat(val)
    if (isNaN(val)) {
      val = defaultval
    }
    if (notnegative && val < 0) {
      val = defaultval < 0 ? 0 : defaultval
    }
    fixed = KOCString.ToInt(fixed, -1)
    if (fixed >= 0) {
      val = val.toFixed(fixed)
    }
    val = str ? KOCString.ToString(val) : parseFloat(val)
    return val
  },
  // endregion
  // region ToFloatPositive 正数Float
  ToFloatPositive: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, false, true)
  },
  // endregion
  // region ToFloatStr 字符串Float
  ToFloatStr: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, true)
  },
  // endregion
  // region ToFloatPositiveStr 正数字符串Float
  ToFloatPositiveStr: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, true, true)
  },
  // endregion
  // region ToCurrency 金额
  ToCurrency: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2)
  },
  // endregion
  // region ToCurrencyPositive 正数金额
  ToCurrencyPositive: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, false, true)
  },
  // endregion
  // region ToCurrencyStr 字符串金额
  ToCurrencyStr: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, true)
  },
  // endregion
  // region ToCurrencyPositiveStr 正数字符串金额
  ToCurrencyPositiveStr: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, true, true)
  },
  // endregion
  /**
   * @description 转换成布尔类型值
   * @param val 要转换的字符串
   * @param defaultval 默认值
   * @return {boolean}
   */
  ToBoolean: function (val, defaultval) {
    if (val === true || val === false) {
      return val
    }
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
  // region ToJSON
  /**
   * @description 转成JSON
   * @param val 要转换的字符串
   * @param defaultval 默认值
   * @return {*|null}
   */
  ToJSON: function (val, defaultval) {
    try {
      return JSON.parse(KOCString.ToString(val))
    } catch (ex) {
      return defaultval || null
    }
  },
  // endregion
  // JSONClear JSON清理(把null,un的键删除)只支持一级
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
  /**************************
   *
   * @param len
   * @returns {string}
   **************************/
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
