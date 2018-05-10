import * as fs from "fs";
import { analyzeCurrency, ReportFormat } from "./analyze";
import { CurrencyCandlestickRecord } from "./lib";

function runAnalysis(
    symbol: string,
): void {
    console.log(symbol);
    const fileContentJson: CurrencyCandlestickRecord[] =
        JSON.parse(fs.readFileSync(`../candlesticks/candlesticks-${symbol}BTC.json`).toString());

    const currencyData = fileContentJson as CurrencyCandlestickRecord[];

    analyzeCurrency(currencyData, 240, 2, ReportFormat.MASell, -3);
}

runAnalysis("XMR");
