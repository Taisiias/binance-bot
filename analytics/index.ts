// import * as message from "./message";
// tslint:disable-next-line:no-submodule-imports
import * as highcharts from "highcharts/highstock";

function insertChart(): void {
    highcharts.stockChart("container", {
        rangeSelector: {
            selected: 1,
        },

        title: {
            text: "AAPL Stock Price",
        },

        series: [{
            type: "candlestick",
            name: "AAPL Stock Price",
            data: [{
                x: 1,
                open: 9,
                high: 10,
                low: 4,
                close: 6,
                // name: "Point2",
                // color: "#00FF00",
            }, {
                x: 2,
                open: 4,
                high: 10,
                low: 7,
                close: 7,
                name: "Point1",
                color: "#FF00FF",
            },
            {
                x: 3,
                open: 13,
                high: 14,
                low: 7,
                close: 8,
                // name: "Point1",
                // color: "#FF00FF",
            }],
            dataGrouping: {
                 units: [[ "week", [1]], [ "month", [1, 2, 3, 6]]]},
            },
        ],
    });
}

window.onload = () => {
    insertChart();
};
