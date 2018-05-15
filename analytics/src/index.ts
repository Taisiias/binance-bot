// tslint:disable-next-line:no-submodule-imports
import * as highcharts from "highcharts/highstock";
import { analyzeCurrency, ReportFormat } from "./analyze";
import { CurrencyCandlestickRecord } from "./lib";

function insertChart(
    candlesticksArray: CurrencyCandlestickRecord[],
): void {
    const [averageData, candleSticksData] =
        analyzeCurrency(candlesticksArray, 240, 2, ReportFormat.MASell, -3);
    console.log(averageData[0]);
    // const groups = [["minute", [1, 2, 5, 10, 15, 30]],
    // ["hour", [1, 2, 3, 4, 6, 8, 12]],
    // [
    //     "day",
    //     [1],
    // ], [
    //     "week",
    //     [1],
    // ], [
    //     "month",
    //     [1, 3, 6],
    // ]];

    highcharts.stockChart("container", {
        rangeSelector: {
            selected: 0,
        },
        chart: {
            zoomType: "y",
            panning: true,
            // panKey: "shift",
            resetZoomButton: {
                position: {
                    // align: "right", // by default
                    // verticalAlign: "top", // by default
                    x: 0,
                    y: -70,
                },
            },
        },
        title: {
            text: "Binance Bot Candlesticks",
        },
        plotOptions: {
            series: {
                turboThreshold: 0,
                lineWidth: 0,
            },
            // candlestick: {
            //     color: "red",
            //     upColor: "green",
            //     colorByPoint: true,
            // },
        },
        series: [
            {
                type: "column",
                name: "Binance Bot Candlesticks",
                // pointIntervalUnit: "hour",
                data: candleSticksData,
                // lineWidth: 3,
                // marker: {
                //     radius: 4,
                // },

                color: "brown",
                upColor: "yellow",

                // dataGrouping: {
                //     units: [["minute", [1, 2, 5, 10, 15, 30]],
                //     ["hour", [1, 2, 3, 4, 6, 8, 12]],
                //     [
                //         "day",
                //         [1],
                //     ], [
                //         "week",
                //         [1],
                //     ], [
                //         "month",
                //         [1, 3, 6],
                //     ]],
                //     // [["minute", []],
                //     // ["hour", [1]],
                //     // ["day", [1, 10, 20, 30]],
                //     // ["month", [1, 2, 3]],
                //     // ["year", [1]],
                //     // ],
                // },
            },
            {
                type: "spline",
                name: "Binance Bot Average 60",
                data: averageData[0],
                color: "magenta",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                // dataGrouping: {
                //     units: [["minute", [1, 2, 5, 10, 15, 30]],
                //     ["hour", [1, 2, 3, 4, 6, 8, 12]],
                //     [
                //         "day",
                //         [1],
                //     ], [
                //         "week",
                //         [1],
                //     ], [
                //         "month",
                //         [1, 3, 6],
                //     ]],
                // },
            },
            {
                type: "spline",
                name: "Binance Bot Average 240",
                data: averageData[1],
                color: "blue",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                // dataGrouping: {
                //     units: [["minute", [1, 2, 5, 10, 15, 30]],
                //     ["hour", [1, 2, 3, 4, 6, 8, 12]],
                //     [
                //         "day",
                //         [1],
                //     ], [
                //         "week",
                //         [1],
                //     ], [
                //         "month",
                //         [1, 3, 6],
                //     ]],
                // },
            },
            {
                type: "spline",
                name: "Binance Bot Average 720",
                data: averageData[2],
                color: "black",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                // dataGrouping: {
                //     units: [["minute", [1, 2, 5, 10, 15, 30]],
                //     ["hour", [1, 2, 3, 4, 6, 8, 12]],
                //     [
                //         "day",
                //         [1],
                //     ], [
                //         "week",
                //         [1],
                //     ], [
                //         "month",
                //         [1, 3, 6],
                //     ]],
                // },
            },
            {
                type: "spline",
                name: "Binance Bot Average 1440",
                data: averageData[3],
                color: "purple",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                // dataGrouping: {
                //     units: [["minute", [1, 2, 5, 10, 15, 30]],
                //     ["hour", [1, 2, 3, 4, 6, 8, 12]],
                //     [
                //         "day",
                //         [1],
                //     ], [
                //         "week",
                //         [1],
                //     ], [
                //         "month",
                //         [1, 3, 6],
                //     ]],
                // },
            },
        ],
    });
}

function readData(symbol: string): CurrencyCandlestickRecord[] {
    const filename = `../../candlesticks/candlesticks-${symbol}BTC.json`;
    console.log(filename);
    const fileContentJson = require("../../candlesticks/candlesticks-EOSBTC.json");
    return fileContentJson as CurrencyCandlestickRecord[];
}

window.onload = () => {
    const candlesticksArray = readData("ADA");
    insertChart(candlesticksArray);
};
