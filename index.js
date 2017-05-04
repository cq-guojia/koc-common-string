"use strict";

const Crypto = require("crypto");
const Xml2js = require("xml2js");
const KOCReturn = require("koc-common-return");

const KOCString = {
  // region IsEmailFormat
  IsEmailFormat: (val) => {
    return (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(StringUtils.ToString(val));
  },
  // endregion
  // region IsPhone
  IsPhone: (val) => {
    return (/^1\d{10}$/).test(StringUtils.ToString(val));
  },
  // endregion
  // region StringLength 取得字符串长度(一个中文为两个长度)
  StringLength: (val) => {
    val = StringUtils.ToString(str);
    const cArr = val.match(/[^\x00-\xff]/ig);
    return val.length + (cArr ? 0 : cArr.length);
  },
  // endregion
  // region ToString
  ToString: (val) => {
    return val == undefined ? "" : val.toString();
  },
  /********************************
   * ToInt
   * val
   * defaultval       默认值(不传为0)
   * positive         是否必须为正值true/false(当true时如果为负值返回defaultval)
   ********************************/
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
    return StringUtils.ToInt(val, defaultval, true);
  },
  // endregion
  // region ToFloat
  /********************************
   * ToFloat
   * val
   * defaultval       默认值(不传为0)
   * positive         是否必须为正值true/false(当true时如果为负值返回defaultval)
   * fixed            小数位数(四舍五入，返回string值)
   ********************************/
  ToFloat: (val, defaultval, positive, fixed) => {
    defaultval = parseFloat(defaultval);
    defaultval = isNaN(defaultval) ? 0 : defaultval;
    val = parseFloat(val);
    if (isNaN(val)) {
      val = defaultval;
    }
    if (positive && val < 0) {
      val = defaultval;
    }
    if (fixed) {
      val = val.toFixed(StringUtils.ToIntPositive(fixed));
    }
    return val;

  },
  // endregion
  // region ToFloatPositive 返回正值Float
  ToFloatPositive: (val, defaultval, fixed) => {
    return StringUtils.ToFloat(val, defaultval, true, fixed);
  },
  // endregion
  // region ToCurrency 返回金额(2位小数，string)
  ToCurrency: (val, defaultval, positive) => {
    return StringUtils.ToFloat(val, defaultval, positive, 2);
  },
  // endregion
  // region ToCurrencyPositive 返回正值金额(2位小数，string)
  ToCurrencyPositive: (val, defaultval) => {
    return StringUtils.ToFloat(val, defaultval, true, 2);
  },
  // endregion
  // region ToBoolean 返回bool
  ToBoolean: (val, defaultval) => {
    switch (StringUtils.ToString(val).toLowerCase()) {
      case "true":
      case "1":
        return true;
      default:
        return !!defaultval;
    }
  },
  // endregion
  // region MD5
  MD5: (val) => {
    const md5 = Crypto.createHash('md5');
    md5.update(val, 'utf8');
    return md5.digest('hex').toLowerCase();
  },
  // endregion
  // region SHA1
  SHA1: (val) => {
    const shasum = Crypto.createHash('sha1');
    shasum.update(val);
    return shasum.digest('hex').toLowerCase();
  },
  // endregion
  // region RSASHA1
  RSASHA1: (val, key) => {
    const signer = Crypto.createSign('RSA-SHA1');
    signer.update(val, 'utf-8');
    return signer.sign(key, 'base64');
  },
  // endregion
  // region XMLObj2JSON
  XMLObj2JSON: (result) => {
    let message = {};
    if (typeof result === 'object') {
      for (let key in result) {
        if (!(result[key] instanceof Array) || result[key].length === 0) {
          continue;
        }
        if (result[key].length === 1) {
          let val = result[key][0];
          if (typeof val === 'object') {
            message[key] = KOCString.XMLObj2JSON(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message[key] = result[key].map(function (item) {
            return KOCString.XMLObj2JSON(item);
          });
        }
      }
    }
    return message;
  },
  // endregion
  // region XML2JSON
  XML2JSON: (val) => {
    return new Promise((resolve) => {
      Xml2js.parseString(val, {trim: true}, function (err, obj) {
        const retValue = KOCReturn.Value();
        if (err) {
          retValue.hasError = true;
          retValue.message = err.message;
          retValue.returnObject = err;
          resolve(retValue);
          return;
        }
        retValue.returnObject = KOCString.XMLObj2JSON(obj);
        resolve(retValue);
      });
    });
  }
  // endregion
};

module.exports = KOCString;