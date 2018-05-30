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
    // d3.select(".myclass")
    //     .attr("margin", "top: 20, right: 20, bottom: 30, left: 50")
    //     .attr("style", "color: red");

    // d3.select("svg").append("line")
    //     .attr("x1", 100)
    //     .attr("y1", 100)
    //     .attr("x2", 200)
    //     .attr("y2", 200)
    //     .style("stroke", "rgb(255,255,0)")
    //     .style("stroke-width", 2);

    const numbers = [5, 4, 10, 1];
    const data = [
        { date: "2014-01-01", amount: 10 },
        { date: "2014-02-01", amount: 20 },
        { date: "2014-03-01", amount: 40 },
        { date: "2014-04-01", amount: 80 },
    ];

    d3.min(numbers);
    d3.max(data, (d) => d.amount);
    // 80

    d3.extent(numbers);
    // [1, 10]
    // const y =
    d3.scaleLinear()
        .domain([0, 80]) // $0 to $80
        .range([200, 0]); // Seems backwards because SVG is y-down
    const x = d3.scaleTime()
        .domain([
            new Date(Date.parse("2014-01-01")),
            new Date(Date.parse("2014-04-01")),
        ])
        .range([0, 300]);

    // x is the d3.scaleTime()
    const xAxis = d3.axisBottom(x)
        .ticks(4); // specify the number of ticks

    const svg = d3.select("body")
        .append("svg")        // create an <svg> element
        .attr("width", 500) // set its dimentions
        .attr("height", 150);

    svg.append("g")            // create a <g> element
        .attr("class", "x axis") // specify classes
        .call(xAxis);            // let the axis do its thing

    insertChart();
};
