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
    d3.select(".myclass")
        .attr("margin", "top: 20, right: 20, bottom: 30, left: 50")
        .attr("style", "color: red");

    d3.select("svg").append("line")
        .attr("x1", 100)
        .attr("y1", 100)
        .attr("x2", 200)
        .attr("y2", 200)
        .style("stroke", "rgb(255,255,0)")
        .style("stroke-width", 2);

    insertChart();
};
