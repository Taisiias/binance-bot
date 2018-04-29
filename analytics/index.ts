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
                units: [["week", [1]], ["month", [1, 2, 3, 6]]],
            },
        },
        ],
    });
    console.log("Chart has been built.");
}

function readData(): Highcharts.DataPoint[] {
    const fileContentJson = require("./candlesticks/candlesticks-ADABTC.json");
    const candlesticksArray = fileContentJson as CurrencyCandlestickRecord[];

    let i = 1;
    const chartData: Highcharts.DataPoint[] = [];
    for (const o of candlesticksArray) {
        const oo: Highcharts.DataPoint = {
            x: i,
            open: Number.parseFloat(o.open),
            high: Number.parseFloat(o.high),
            low: Number.parseFloat(o.low),
            close: Number.parseFloat(o.close),
            name: `Candlestick ${i}`,
            color: "#FF00FF",
        };
        chartData.push(oo);
        // const oo: Highcharts.DataPoint  = o;
        // oo.name = `Candlestick ${i}`;
        // oo.color = "#FF00FF";
        i++;
    }
    return chartData;
}

window.onload = () => {
    const chartData = readData();
    insertChart(chartData);
};
