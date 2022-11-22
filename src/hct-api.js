const builder = require('xmlbuilder');
const request = require('request');
const { XMLParser } = require("fast-xml-parser");
const CryptoJs = require("crypto-js");
const parser = new XMLParser();
const hctUrl = 'http://hctrt.hct.com.tw/EDI_WebService2/Service1.asmx';
const hctSearchOrderUrl = 'https://hctapiweb.hct.com.tw/phone/searchGoods_Main.aspx';
const hctSearchOrderXmlUrl = `https://hctapiweb.hct.com.tw/phone/searchGoods_Main_Xml.ashx`;
const hctV = '';

function getXmlBody(body) {
  return builder.create(body).end({ pretty: true });;
}

function soapRequest(body) {
  const result = new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: hctUrl,
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8'
      },
      body: body,
    };
    request(options, function (error, response) {
      const responseBody = response.body;

      if (!error && response.statusCode == 200) {
        const result = parser.parse(responseBody);
        resolve(result);
      }
      else {
        console.log('error:' + error);
        console.log('status:' + response.statusCode);
        console.log('body:' + responseBody);
        reject(error)
      }
    });
  })
  return result;
}

async function CallApi(methodName, company, password, jsonData) {
  let body = {
    'soap12:Envelope': {
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      '@xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
      'soap12:Body': {}
    },
  };
  body['soap12:Envelope']['soap12:Body'][`${methodName}_Json`] = {
    '@xmlns': 'http://tempuri.org/',
    ...company,
    ...password,
    ...jsonData,
  }
  const xmlBody = getXmlBody(body);
  const apiResult = await soapRequest(xmlBody);
  const apiResultData = apiResult['soap:Envelope']['soap:Body'][methodName + '_JsonResponse'][methodName + '_JsonResult'] ?? ''
  return apiResultData;
}

async function TransData(company, password, data) {
  const result = await CallApi('TransData', company, password, data);
  return result;
}

async function UpdData(company, password, data) {
  const result = await CallApi('UpdData', company, password, data);
  return result;
}

async function TransReport(company, password, data) {
  const result = await CallApi('TransReport', company, password, data);

  return result;
}

async function QueryEDELNO(company, password, data) {
  const result = await CallApi('QueryEDELNO', company, password, data);
  return result;
}

function HexToBase64Image(hexString) {
  const byteArray = Buffer.from(hexString, 'hex');
  const b64 = Buffer.from(byteArray).toString('base64');
  return b64;
}

function encryptByDESModeCBC(message, key, iv) {

  const keyParse = CryptoJs.enc.Utf8.parse(key);
  const ivParse = CryptoJs.enc.Utf8.parse(iv);
  const messageParse = CryptoJs.enc.Utf8.parse(message);

  const encrypted = CryptoJs.DES.encrypt(messageParse, keyParse, {
    iv: ivParse,
    mode: CryptoJs.mode.CBC,
    padding: CryptoJs.pad.Pkcs7,
  });

  return encrypted.toString();
}

function decryptByDESModeCBC(ciphertext, key, iv) {

  const keyHex = CryptoJs.enc.Utf8.parse(key);
  const ivHex = CryptoJs.enc.Utf8.parse(iv);

  const decrypted = CryptoJs.DES.decrypt({
    ciphertext: CryptoJs.enc.Base64.parse(ciphertext)
  }, keyHex, {
    iv: ivHex,
    mode: CryptoJs.mode.CBC,
    padding: CryptoJs.pad.Pkcs7
  });

  return decrypted.toString(CryptoJs.enc.Utf8);
}

function SearchOrderSingle(orderNumber, key, iv) {
  const no = encryptByDESModeCBC(orderNumber, key, iv);

  return `${hctSearchOrderUrl}?no=${no.substring(0, no.length - 1)}=&v=${hctV}`;
}

async function SearchOrderMulti(orderNumberXml, key, iv) {
  const no = encryptByDESModeCBC(orderNumberXml, key, iv);

  const callUrl = `${hctSearchOrderXmlUrl}`;
  const params = {
    no: no, v: hctV,
  };

  const result = await httpRequest(callUrl, 'POST', params);

  const decryptContent = decryptByDESModeCBC(result, key, iv);

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  };

  const parser = new XMLParser(options);
  const parseContent = parser.parse(decryptContent);

  let data = [];

  parseContent.rlist.orders.map((order) => {
    let tmp_data = {
      id: order['@_ordersid'],
      status: [],
    };
    order.order.map((item, index) => {
      tmp_data.status.push({
        wrktime: item['@_wrktime'],
        content: item['@_status'],
      })
    })

    data.push(tmp_data);
  })

  return data;
}

function httpRequest(url, method, params) {
  const result = new Promise((resolve, reject) => {
    const options = {
      url: url,
      method: method,
      form: params,
      json: true,
    };

    request(options, function (error, response) {
      const responseBody = response.body;

      if (!error && response.statusCode == 200) {
        resolve(responseBody);
      }
      else {
        console.log('error:' + error);
        console.log('status:' + response.statusCode);
        console.log('body:' + responseBody);
        reject(error)
      }
    });
  });

  return result;
}

module.exports = {
  TransData,
  UpdData,
  TransReport,
  QueryEDELNO,
  CallApi,
  HexToBase64Image,
  encryptByDESModeCBC,
  decryptByDESModeCBC,
  httpRequest,
  SearchOrderSingle,
  SearchOrderMulti,
}