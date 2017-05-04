"use strict";

const crypto = require('crypto');
const xml2js = require('xml2js');
const KOCReturn = require("koc-common-return");

const StringUtils = {
  /********************************
   * IsEmailFormat
   ********************************/
  IsEmailFormat: (val) => {
    return (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(StringUtils.ToString(val));
  },
  /********************************
   * IsPhone
   ********************************/
  IsPhone: (val) => {
    return (/^1\d{10}$/).test(StringUtils.ToString(val));
  },
  /********************************
   * getStringLength 取得字符串长度(一个中文为两个长度)
   ********************************/
  StringLength: (val) => {
    val = StringUtils.ToString(str);
    const cArr = val.match(/[^\x00-\xff]/ig);
    return val.length + (cArr ? 0 : cArr.length);
  },
  ToString: (val) => {
    return val == undefined ? "" : val.toString();
  },
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
  /********************************
   * ToIntPositive 返回正值Int
   ********************************/
  ToIntPositive: (val, defaultval) => {
    return StringUtils.ToInt(val, defaultval, true);
  },
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
  /********************************
   * ToFloatPositive 返回正值Float
   ********************************/
  ToFloatPositive: (val, defaultval, fixed) => {
    return StringUtils.ToFloat(val, defaultval, true, fixed);
  },
  /********************************
   * ToCurrency 返回金额(2位小数，string)
   ********************************/
  ToCurrency: (val, defaultval, positive) => {
    return StringUtils.ToFloat(val, defaultval, positive, 2);
  },
  /********************************
   * ToCurrencyPositive 返回正值金额(2位小数，string)
   ********************************/
  ToCurrencyPositive: (val, defaultval) => {
    return StringUtils.ToFloat(val, defaultval, true, 2);
  },
  /********************************
   * ToBoolean 返回bool
   ********************************/
  ToBoolean: (val, defaultval) => {
    switch (StringUtils.ToString(val).toLowerCase()) {
      case "true":
      case "1":
        return true;
      default:
        return !!defaultval;
    }
  },
  /********************************
   * MD5
   ********************************/
  MD5: (val) => {
    const md5 = crypto.createHash('md5');
    md5.update(val, 'utf8');
    return md5.digest('hex').toLowerCase();
  },
  /********************************
   * SHA1
   ********************************/
  SHA1: (val) => {
    const shasum = crypto.createHash('sha1');
    shasum.update(val);
    return shasum.digest('hex').toLowerCase();
  },
  /********************************
   * RSASHA1
   ********************************/
  RSASHA1: (val, key) => {
    const signer = crypto.createSign('RSA-SHA1');
    signer.update(val, 'utf-8');
    return signer.sign(key, 'base64');
  },
  //region xml转换成json
  ParseXML: (xml) => {
    return new Promise((resolve) => {
      xml2js.parseString(xml, {trim: true}, function (err, obj) {
        const retValue = KOCReturn.Value();
        if (err) {
          retValue.hasError = true;
          retValue.message = err.message;
          retValue.returnObject = err;
          resolve(retValue);
          return;
        }
        retValue.returnObject = obj;
        resolve(retValue);
      });
    });
  },
  //endregion
  //region 将xml2js解析出来的对象转换成直接可访问的对象
  FormatXMLJSObj: (result) => {
    let message = {};
    if (typeof result === 'object') {
      for (let key in result) {
        if (!(result[key] instanceof Array) || result[key].length === 0) {
          continue;
        }
        if (result[key].length === 1) {
          let val = result[key][0];
          if (typeof val === 'object') {
            message[key] = StringUtils.FormatXMLJSObj(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message[key] = result[key].map(function (item) {
            return StringUtils.FormatXMLJSObj(item);
          });
        }
      }
    }
    return message;
  }
  //endregion
};

module.exports = StringUtils;