import * as binance from "binance";
import * as fs from "fs";
import { CurrencyCandlestickRecord, readConfig } from "./lib";

async function run(): Promise<void> {
    const config = readConfig("./config.json");

    const binanceRest = new binance.BinanceRest({
        key: config.key, // Get this from your account on binance.com
        secret: config.secret, // Same for this
        timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
        recvWindow: 15000,
        disableBeautification: false,
        handleDrift: false,
    });

    const pairs = config.symbols.map((s) => `${s}BTC`);

    for (const pair of pairs) {
        console.log(`Getting history of ${pair}`);
        await collectHistory(binanceRest, pair).catch((e) => {
            console.log(`Error in ${pair}: ${e}`);
        });
    }
}

export async function collectHistory(
    binanceRest: binance.BinanceRest,
    pair: string,
): Promise<void> {
    const fileName = `candlesticks-${pair}.json`;

    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    let startDate = new Date("2018-02-01").getTime();
    const endDate = new Date("2018-03-01").getTime();
    // tslint:disable-next-line:no-any
    let klines: CurrencyCandlestickRecord[] = [];
    do {
        // tslint:disable-next-line:no-any
        const newKlines: CurrencyCandlestickRecord[] = await (binanceRest as any).klines({
            symbol: pair,
            interval: "1m",
            startTime: startDate,
        });
        const lastKline = newKlines[newKlines.length - 1];
        console.log(
            `Loaded ${newKlines.length} candlesticks. ` +
            `Last date: ${new Date(lastKline.openTime)}`);
        klines = klines.concat(newKlines);

        startDate = lastKline.openTime + 60 * 1000;
        if (startDate > endDate) { break; }
    } while (true);

    fs.writeFileSync(fileName, JSON.stringify(klines, undefined, 4));
}

run().catch((e) => { console.log(e); });
