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

    highcharts.stockChart("container", {
        rangeSelector: {
            selected: 1,
        },
        chart: {
            zoomType: "x",
            panning: true,
            // panKey: "shift",
            resetZoomButton: {
                position: {
                    // align: 'right', // by default
                    // verticalAlign: 'top', // by default
                    x: 0,
                    y: -30,
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
            candlestick: {
                color: "magenta",
                upColor: "brown",
                colorByPoint: true,
            },
        },
        series: [
            {
                type: "spline",
                name: "Binance Bot Candlesticks",
                data: candleSticksData,
                lineWidth: 3,
                marker: {
                    radius: 4,
                },
                // color: "black",
                dataGrouping: {
                    units: [["minute", []],
                        // ["hour", [1]],
                        // ["day", [1, 10, 20, 30]],
                        // ["month", [1, 2, 3]],
                        // ["year", [1]],
                    ],
                },
            },
            {
                type: "spline",
                name: "Binance Bot Average 60",
                data: averageData[0],
                color: "#FF0000",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                dataGrouping: {
                    units: [["minute", [1]],
                    // ["hour", [1]],
                        // ["day", [1, 10, 20, 30]],
                        // ["month", [1, 2, 3]],
                        // ["year", [1]],
                    ],
                },
            },
            {
                type: "spline",
                name: "Binance Bot Average 240",
                data: averageData[1],
                color: "#49FF00",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                dataGrouping: {
                    units: [["minute", [1]],
                    // ["hour", [1]],
                        // ["day", [1, 10, 20, 30]],
                        // ["month", [1, 2, 3]],
                        // ["year", [1]],
                    ],
                },
            },
            {
                type: "spline",
                name: "Binance Bot Average 720",
                data: averageData[2],
                color: "#30810F",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                dataGrouping: {
                    units: [["minute", [1]],
                    // ["hour", [1]],
                        // ["day", [1, 10, 20, 30]],
                        // ["month", [1, 2, 3]],
                        // ["year", [1]],
                    ],
                },
            },
            {
                type: "spline",
                name: "Binance Bot Average 1440",
                data: averageData[3],
                color: "#FF5733",
                lineWidth: 1,
                marker: {
                    radius: 2,
                },
                // dataGrouping: {
                //     units: [["minute", [1]],
                //     ["hour", [1]],
                //         // ["day", [1, 10, 20, 30]],
                //         // ["month", [1, 2, 3]],
                //         // ["year", [1]],
                //     ],
                // },
            },
        ],
    });
}

function readData(symbol: string): CurrencyCandlestickRecord[] {
    const filename = `../../candlesticks/candlesticks-${symbol}BTC.json`;
    console.log(filename);
    const fileContentJson = require("../../candlesticks/candlesticks-ADABTC.json");
    return fileContentJson as CurrencyCandlestickRecord[];
}

window.onload = () => {
    const candlesticksArray = readData("ETH");
    insertChart(candlesticksArray);
};
