'use strict';

/* C */
var CryptoJS = require('crypto-js');

/* C */
var KOCString = {
  // region Regular 正则验证
  Regular: {
    Data: {
      Phone: /^1\d{10}$/,
      Tell: /\d{3}-\d{8}|\d{4}-\d{7}/,
      IDCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
      Email: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
      QQ: /[1-9][0-9]{4,}/,
    },
    Verify: function (str, type) {
      type = KOCString.Regular.Data[type];
      return type ? (type).test(str) : false;
    },
  },
  // endregion
  // region StringLength 取得字符串长度(一个中文为两个长度)
  StringLength: function (val) {
    val = KOCString.ToString(str);
    /* C */
    var cArr = val.match(/[^\x00-\xff]/ig);
    return val.length + (cArr ? 0 : cArr.length);
  },
  // endregion
  // region ToString
  ToString: function (val) {
    return val == undefined ? '' : val.toString();
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
    str = KOCString.ToString(str);
    if (!str) {
      return '';
    }
    char = char || '*';
    if (type == 'Name') {
      return str.substr(0, 1) + char + char;
    } else if ((!type || type == 'Phone') &&
      KOCString.Regular.Verify(str, 'Phone')) {
      return str.substr(0, 3) + char + char + char + char +
        str.substr(str.length - 4);
    } else if ((!type || type == 'IDCard') &&
      KOCString.Regular.Verify(str, 'IDCard')) {
      return str.substr(0, 6) + char + char + char + char + char + char + char +
        char + str.substr(str.length - 4);
    } else if ((!type || type == 'Email') &&
      KOCString.Regular.Verify(str, 'Email')) {
      var _index = str.indexOf('@');
      if (_index < 3) {
        return char + char + char + str.substr(_index);
      }
      var _len = KOCString.ToInt(_index / 3);
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(_index - _len);
    } else if ((!type || type == 'QQ') && KOCString.Regular.Verify(str, 'QQ')) {
      var _len = KOCString.ToInt(str.length / 3);
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(str.length - _len);
    } else if (str.length >= 3) {
      var _len = KOCString.ToInt(str.length / 3);
      return str.substr(0, _len) + char + char + char + char + char +
        str.substr(str.length - _len);
    } else {
      return char + char + char;
    }
  },
  // endregion
  // region ToInt
  /********************************
   * ToInt
   * val
   * defaultval       默认值(不传为0)
   * positive         是否必须为正值true/false(当true时如果为负值返回defaultval)
   ********************************/
  ToInt: function (val, defaultval, positive) {
    defaultval = parseInt(defaultval);
    defaultval = isNaN(defaultval) ? 0 : defaultval;
    val = parseInt(val);
    if (isNaN(val)) {
      val = defaultval;
    }
    if (positive && val < 0) {
      val = defaultval;
    }
    return val;
  },
  // endregion
  // region ToIntPositive
  ToIntPositive: function (val, defaultval) {
    return KOCString.ToInt(val, defaultval, true);
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
    defaultval = isNaN(parseFloat(defaultval)) ? 0 : parseFloat(defaultval);
    val = parseFloat(val);
    if (isNaN(val)) {
      val = defaultval;
    }
    if (notnegative && val < 0) {
      val = defaultval < 0 ? 0 : defaultval;
    }
    fixed = KOCString.ToInt(fixed, -1);
    if (fixed >= 0) {
      val = val.toFixed(fixed);
    }
    val = str ? KOCString.ToString(val) : parseFloat(val);
    return val;
  },
  // endregion
  // region ToFloatPositive 正数Float
  ToFloatPositive: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, false, true);
  },
  // endregion
  // region ToFloatStr 字符串Float
  ToFloatStr: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, true);
  },
  // endregion
  // region ToFloatPositiveStr 正数字符串Float
  ToFloatPositiveStr: function (val, defaultval, fixed) {
    return KOCString.ToFloat(val, defaultval, fixed, true, true);
  },
  // endregion
  // region ToCurrency 金额
  ToCurrency: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2);
  },
  // endregion
  // region ToCurrencyPositive 正数金额
  ToCurrencyPositive: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, false, true);
  },
  // endregion
  // region ToCurrencyStr 字符串金额
  ToCurrencyStr: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, true);
  },
  // endregion
  // region ToCurrencyPositiveStr 正数字符串金额
  ToCurrencyPositiveStr: function (val, defaultval) {
    return KOCString.ToFloat(val, defaultval, 2, true, true);
  },
  // endregion
  // region ToBoolean 返回bool
  ToBoolean: function (val, defaultval) {
    if (val === true || val === false) {
      return val;
    }
    switch (KOCString.ToString(val).toLowerCase()) {
      case 'true':
      case '1':
        return true;
      case 'false':
      case '0':
        return false;
      default:
        return !!defaultval;
    }
  },
  // endregion
  // region ToJSON
  ToJSON: function (val, defaultval) {
    try {
      return JSON.parse(KOCString.ToString(val));
    } catch (ex) {
      return defaultval || null;
    }
  },
  // endregion
  // region FloatSplit 拆分
  FloatSplit: function (val, fixed) {
    val = KOCString.ToFloatStr(val, 0, fixed).split('.');
    return {
      Minus: val[0].indexOf('-') === 0,
      Int: val[0].replace('-', ''),
      Decimal: val.length > 1 ? val[1] : null,
    };
  },
  // endregion
  // region MD5
  MD5: function (val) {
    return CryptoJS.MD5(val).toString();
  },
  // endregion
  // region SHA1
  SHA1: function (val) {
    return CryptoJS.SHA1(val).toString();
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
    return CryptoJS.AES.encrypt(val, key).toString();
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
    return CryptoJS.AES.decrypt(val, key).toString(CryptoJS.enc.Utf8);
  },
  // endregion
  // region RandomString 随机字符串
  /**************************
   *
   * @param len
   * @returns {string}
   **************************/
  RandomString: function (len) {
    len = len || 32;
    /* C */
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';//默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    /* C */
    var maxPos = chars.length;
    /* L */
    var str = '';
    for (/* L */ var i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
  }
  // endregion
};

module.exports = KOCString;