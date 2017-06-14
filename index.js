"use strict";

const CryptoJS = require("crypto-js");

const KOCString = {
  // region IsEmailFormat
  IsEmailFormat: (val) => {
    return (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(KOCString.ToString(val));
  },
  // endregion
  // region IsPhone
  IsPhone: (val) => {
    return (/^1\d{10}$/).test(KOCString.ToString(val));
  },
  // endregion
  // region StringLength 取得字符串长度(一个中文为两个长度)
  StringLength: (val) => {
    val = KOCString.ToString(str);
    const cArr = val.match(/[^\x00-\xff]/ig);
    return val.length + (cArr ? 0 : cArr.length);
  },
  // endregion
  // region ToString
  ToString: (val) => {
    return val == undefined ? "" : val.toString();
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
      return "";
    }
    char = char || "*";
    if (type == "Name") {
      return str.substr(0, 1) + char + char;
    } else if ((!type || type == "Phone") && RegularUtils.Verify(str, "Phone")) {
      return str.substr(0, 3) + char + char + char + char + str.substr(str.length - 4);
    } else if ((!type || type == "IDCard") && RegularUtils.Verify(str, "IDCard")) {
      return str.substr(0, 6) + char + char + char + char + char + char + char + char + str.substr(str.length - 4);
    } else if ((!type || type == "Email") && RegularUtils.Verify(str, "Email")) {
      var _index = str.indexOf("@");
      if (_index < 3) {
        return char + char + char + str.substr(_index);
      }
      var _len = KOCString.ToInt(_index / 3);
      return str.substr(0, _len) + char + char + char + char + char + str.substr(_index - _len);
    } else if ((!type || type == "QQ") && RegularUtils.Verify(str, "QQ")) {
      var _len = KOCString.ToInt(str.length / 3);
      return str.substr(0, _len) + char + char + char + char + char + str.substr(str.length - _len);
    } else if (str.length >= 3) {
      var _len = KOCString.ToInt(str.length / 3);
      return str.substr(0, _len) + char + char + char + char + char + str.substr(str.length - _len);
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
  ToInt: (val, defaultval, positive) => {
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
  ToIntPositive: (val, defaultval) => {
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
  ToFloat: (val, defaultval, fixed, str, positive, notnegative) => {
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
  ToBoolean: (val, defaultval) => {
    if (val === true || val === false) {
      return val;
    }
    switch (KOCString.ToString(val).toLowerCase()) {
      case "true":
      case "1":
        return true;
      case "false":
      case "0":
        return false;
      default:
        return !!defaultval;
    }
  },
  // endregion
  // region ToJSON
  ToJSON: (val, defaultval) => {
    try {
      return JSON.parse(KOCString.ToString(val));
    } catch (ex) {
      return defaultval || null;
    }
  },
  // endregion
  // region FloatSplit 拆分
  FloatSplit: (val, fixed) => {
    val = KOCString.ToFloatStr(val, 0, fixed).split(".");
    return {
      Minus: val[0].indexOf("-") === 0,
      Int: val[0].replace("-", ""),
      Decimal: val.length > 1 ? val[1] : null
    };
  },
  // endregion
  // region MD5
  MD5: (val) => {
    return CryptoJS.MD5(val).toString();
  }
  // endregion
};

module.exports = KOCString;