// tslint:disable-next-line:no-submodule-imports
import * as highcharts from "highcharts/highstock";
import { analyzeCurrency, ReportFormat } from "./analyze";
import { CurrencyCandlestickRecord } from "./lib";

function insertChart(
    chartData: Highcharts.DataPoint[],
    candlesticksArray: CurrencyCandlestickRecord[],
): void {
    const averageData = analyzeCurrency(candlesticksArray, 240, 2, ReportFormat.MASell, -3);
    highcharts.stockChart("container", {
        rangeSelector: {
            selected: 1,
        },
        chart: {
            zoomType: "x",
        },
        title: {
            text: "Binance Bot Candlesticks",
        },
        plotOptions: {
            series: {
                turboThreshold: 0,
                lineWidth: 0,
            },
        },
        series: [{
            type: "candlestick",
            name: "Binance Bot Candlesticks",
            data: chartData,
            dataGrouping: {
                units: [["minute", [1]],
                      ["hour", [1]],
                    // ["day", [1, 10, 20, 30]],
                    // ["month", [1, 2, 3]],
                    ["year", [1]],
                ],
            },
        },
        {
            type: "spline",
            name: "Binance Bot Average",
            data: averageData,
            dataGrouping: {
                units: [["minute", [1]],
                      ["hour", [1]],
                    // ["day", [1, 10, 20, 30]],
                    // ["month", [1, 2, 3]],
                    // ["year", [1]],
                ],
            },
        },
        ],
    });
}

function readData(): [Highcharts.DataPoint[], CurrencyCandlestickRecord[]]  {
    const fileContentJson = require("../../candlesticks/candlesticks-XMRBTC.json");
    const candlesticksArray = fileContentJson as CurrencyCandlestickRecord[];

    let i = 1;

    const chartData: Highcharts.DataPoint[] = [];
    for (const o of candlesticksArray) {
        let oo: Highcharts.DataPoint;
        oo = {
            x: o.openTime,
            open: Number.parseFloat(o.open),
            high: Number.parseFloat(o.high),
            low: Number.parseFloat(o.low),
            close: Number.parseFloat(o.close),
            name: `Candlestick ${i}`,
            color: "#AAAAAA",
            negativeColor: "#0088FF",
        };
        chartData.push(oo);
        i++;
    }
    return [chartData, candlesticksArray];
}

window.onload = () => {
    const [chartData, candlesticksArray] = readData();
    insertChart(chartData, candlesticksArray);
};
