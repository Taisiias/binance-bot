import chartjs from "chart.js";
import "chartjs-plugin-zoom";
import { analyzeCurrency, ReportFormat } from "./analyze";
import { CurrencyCandlestickRecord } from "./lib";

function insertChart(
    // candlesticksArray: CurrencyCandlestickRecord[],
): void {
    // const [averageData, redCandleSticksData, greenCandleSticksData] =
    //     analyzeCurrency(candlesticksArray, 240, 2, ReportFormat.MASell, -3);
    // console.log(averageData[0]);

    // highcharts.stockChart("container", {
    //     rangeSelector: {
    //         selected: 0,
    //     },
    //     yAxis: {
    //         scrollbar: {
    //             enabled: true,
    //         },
    //     },
    //     chart: {
    //         zoomType: "y",
    //         panning: true,
    //         resetZoomButton: {
    //             position: {
    //                 x: 0,
    //                 y: -70,
    //             },
    //         },
    //     },
    //     title: {
    //         text: "Binance Bot Candlesticks",
    //     },
    //     plotOptions: {
    //         series: {
    //             turboThreshold: 0,
    //         },
    //         line: {
    //             lineWidth: 1,
    //             marker: {
    //                 radius: 1,
    //             },
    //         },
    //         spline: {
    //             lineWidth: 0,
    //             marker: {
    //                 enabled: true,
    //                 radius: 2,
    //             },
    //         },
    //     },
    //     series: [
    //         {
    //             type: "spline",
    //             name: "Red Binance Bot Candlesticks",
    //             data: redCandleSticksData,
    //             color: "red",
    //         },
    //         {
    //             type: "spline",
    //             name: "Green Binance Bot Candlesticks",
    //             data: greenCandleSticksData,
    //             color: "green",
    //         },
    //         {
    //             type: "line",
    //             name: "Binance Bot Average 60",
    //             data: averageData[0],
    //             color: "magenta",
    //         },
    //         {
    //             type: "line",
    //             name: "Binance Bot Average 240",
    //             data: averageData[1],
    //             color: "blue",
    //         },
    //         {
    //             type: "line",
    //             name: "Binance Bot Average 720",
    //             data: averageData[2],
    //             color: "black",
    //         },
    //         {
    //             type: "line",
    //             name: "Binance Bot Average 1440",
    //             data: averageData[3],
    //             color: "brown",
    //         },
    //     ],
    // });
}

export function readData(symbol: string): CurrencyCandlestickRecord[] {
    const filename = `../../candlesticks/candlesticks-${symbol}BTC.json`;
    console.log(filename);
    const fileContentJson = require("../../candlesticks/candlesticks-EOSBTC.json");
    return fileContentJson as CurrencyCandlestickRecord[];
}

window.onload = () => {
    const candlesticksArray = readData("ADA");
    // insertChart(candlesticksArray);
    const [averageData, candleSticksData] =
        analyzeCurrency(candlesticksArray, 240, 2, ReportFormat.MASell, -3);
    console.log(averageData[0]);
    console.log(candleSticksData[0]);

    const chart = new chartjs.Chart("myChart", {
        type: "scatter",
        data: {
            // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange", "White", "Beige"],
            datasets: [{
                label: "Binance Bot CandleSticks and Moving Averages",
                data: candleSticksData, // [12, 19, 3, 5, 2, 3, 10, 7],
                fill: false,
                type: "line",
                borderColor: "red",
                borderWidth: 1,
                backgroundColor: "green",
            }],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }],
            },

            // Container for pan options
            pan: {
                // Boolean to enable panning
                enabled: true,

                // Panning directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow panning in the y direction
                mode: "xy",
            },

            // Container for zoom options
            zoom: {
                // Boolean to enable zooming
                enabled: true,
                // drag: true,

                // Zooming directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow zooming in the y direction
                mode: "xy",
            },
            // tslint:disable-next-line:no-any
        } as any,
    });
    // chart.update();
    console.log(chart.ctx);
    insertChart();
};
