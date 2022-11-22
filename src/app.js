const express = require('express');
const { TransData, UpdData, TransReport, QueryEDELNO, HexToBase64Image, SearchOrderSingle, SearchOrderMulti } = require('./hct-api.js');
const TestDataTransData = require('./data/test-trans-data')
const TestDataUpdData = require('./data/test-upd-data')
const TestDataTransReport = require('./data/test-trans-report')
const TestDataQueryEdelno = require('./data/test-query-edelno')
const TestDataImageHexString = require('./data/test-hex-to-image')
const { TestDataSearchOrder, TestDataSearchOrderXml } = require('./data/test-search-order')
const TestCompany = 'test';
const TestPassword = 'test1';

function StartAppServer() {
    const app = express();

    app.use(express.json());

    app.get('/TransData', async (req, res) => {
        const apiResultData = await TransData({ company: TestCompany }, { password: TestPassword }, { json: JSON.stringify(TestDataTransData) })
        res.json({
            status: 'success',
            data: JSON.parse(apiResultData),
            error: undefined,
        });
    });

    app.get('/UpdData', async (req, res) => {
        const apiResultData = await UpdData({ company: TestCompany }, { password: TestPassword }, { json: JSON.stringify(TestDataUpdData) })
        res.json({
            status: 'success',
            data: JSON.parse(apiResultData),
            error: undefined,
        });
    });

    app.get('/TransReport', async (req, res) => {
        const apiResultData = await TransReport({ sCompany: TestCompany }, { sPassword: TestPassword }, { dsCusJson: JSON.stringify(TestDataTransReport) })
        res.json({
            status: 'success',
            data: JSON.parse(apiResultData),
            error: undefined,
        });
    })

    app.get('/QueryEDELNO', async (req, res) => {
        const apiResultData = await QueryEDELNO({ company: TestCompany }, { password: TestPassword }, { json: JSON.stringify(TestDataQueryEdelno) })
        res.json({
            status: 'success',
            data: JSON.parse(apiResultData),
            error: undefined,
        });
    })

    app.get('/ImageDecode', async (req, res) => {
        const result = HexToBase64Image(TestDataImageHexString);
        res.send(`<img src="data:png;base64,${result}" />`);
    })

    app.get('/SearchOrderSingle', async (req, res) => {

        const result = SearchOrderSingle(TestDataSearchOrder.orderNumber, TestDataSearchOrder.key, TestDataSearchOrder.iv);

        res.json({
            status: 'success',
            data: result,
            error: undefined,
        });
    })

    app.get('/SearchOrderMulti', async (req, res) => {

        const result = await SearchOrderMulti(TestDataSearchOrderXml.orderNumber, TestDataSearchOrderXml.key, TestDataSearchOrderXml.iv);

        res.json({
            status: 'success',
            data: result,
            error: undefined,
        });
    })

    const port = 8080;
    app.listen(port, () => {
        console.log(`API service on url: http://localhost:${port}`);
    });
}

(async () => {
    StartAppServer();
})();
