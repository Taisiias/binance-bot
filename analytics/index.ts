// tslint:disable-next-line:no-submodule-imports
import * as highcharts from "highcharts/highstock";
import { CurrencyCandlestickRecord } from "../src/lib";

function insertChart(
    chartData: Highcharts.DataPoint[],
): void {
    console.log("Building chart.");
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
                turboThreshold: 50000,
            },
        },
        series: [{
            type: "candlestick",
            name: "Binance Bot Candlesticks",
            data: chartData,
            dataGrouping: {
                units: [["minute", [1]],
                      ["hour", [1]],
                    // ["day", [1, 10, 20, 30]]
                ],
            },
        },
        ],
    });
    console.log("Chart has been built.");
}

function readData(): Highcharts.DataPoint[] {
    const fileContentJson = require("./candlesticks/candlesticks-VENBTC.json");
    const candlesticksArray = fileContentJson as CurrencyCandlestickRecord[];

    let i = 1;

    const chartData: Highcharts.DataPoint[] = [];
    for (const o of candlesticksArray) {
        const oo: Highcharts.DataPoint = {
            x: o.openTime,
            open: Number.parseFloat(o.open),
            high: Number.parseFloat(o.high),
            low: Number.parseFloat(o.low),
            close: Number.parseFloat(o.close),
            name: `Candlestick ${i}`,
            color: "#FF0000",
        };
        chartData.push(oo);
        i++;
    }
    return chartData;
}

window.onload = () => {
    const chartData = readData();
    insertChart(chartData);
};
