// import chartjs from "chart.js";
import "chartjs-plugin-zoom";
import * as d3 from "d3";
import { analyzeCurrency, ReportFormat } from "./analyze";
import { CurrencyCandlestickRecord } from "./lib";

function insertChart(
    // candlesticksArray: CurrencyCandlestickRecord[],
): void {
    // const [averageData, redCandleSticksData, greenCandleSticksData] =
    //     analyzeCurrency(candlesticksArray, 240, 2, ReportFormat.MASell, -3);
    // console.log(averageData[0]);
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

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // parse the date / time
    // const d3ParseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // define the line
    const valueline = d3.line()
        // tslint:disable-next-line:no-any
        .x((d: any) => x(d.date))
        // tslint:disable-next-line:no-any
        .y((d: any) => y(d.close));

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    // tslint:disable-next-line:no-any
    d3.csv("../data.csv", (data: any) => {

        // format the data
        // tslint:disable-next-line:no-any
        data.forEach((d: any) => {
            d.date = Date.parse(d.date);
            d.close = +d.close;
        });

        // Scale the range of the data

        // tslint:disable-next-line:no-any
        const ext = d3.extent(data, (d: any) => d.date);
        x.domain([Date.parse(ext[0] as string), Date.parse(ext[1] as string)]);
        // tslint:disable-next-line:no-any
        const max = d3.max(data, (d: any) => d.close as string);
        y.domain([0, Number.parseFloat(max as string)]);

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueline);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        return undefined;

    });

    insertChart();
};
