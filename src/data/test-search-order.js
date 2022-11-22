const date = new Date();
date.setDate(date.getDate() - 189);
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

const key = `${year}0${month}${day}`;
const iv = '';
const v = '';
const testOrderNumber = '';
const testOrderNumberXml = '';

const TestDataSearchOrder = {
    key: key,
    iv: iv,
    orderNumber: testOrderNumber,
    v: v,
}

const TestDataSearchOrderXml = {
    key: key,
    iv: iv,
    orderNumber: `<?xml version="1.0" encoding="utf-8"?><qrylist>${testOrderNumberXml}</qrylist>`,
    v: v,
}

module.exports = {
    TestDataSearchOrder,
    TestDataSearchOrderXml,
};