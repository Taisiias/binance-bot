// import * as message from "./message";
import * as fs from "fs";
// tslint:disable-next-line:no-submodule-imports
import * as highcharts from "highcharts/highstock";
import { CurrencyCandlestickRecord } from "../src/lib";

function insertChart(): void {
    highcharts.stockChart("container", {
        rangeSelector: {
            selected: 1,
        },

        title: {
            text: "Binance Bot Candlesticks",
        },

        series: [{
            type: "candlestick",
            name: "Binance Bot Candlesticks",
            data: [{
                x: 1,
                open: 9,
                high: 10,
                low: 4,
                close: 6,
                name: "Point1",
                color: "#00FF00",
            }, {
                x: 2,
                open: 4,
                high: 10,
                low: 7,
                close: 7,
                name: "Point2",
                color: "#FF00FF",
            },
            {
                x: 3,
                open: 13,
                high: 14,
                low: 7,
                close: 8,
                name: "Point3",
                color: "#FF00FF",
            }],
            dataGrouping: {
                units: [["week", [1]], ["month", [1, 2, 3, 6]]],
            },
        },
        ],
    });
}

function readData(): void {
    const fileContent =
        JSON.parse(fs.readFileSync("/candlesticks/candlesticks-ADABTC.json").toString());
    const candlesticksArray = fileContent as CurrencyCandlestickRecord[];

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

}

window.onload = () => {
    readData();
    insertChart();
};
