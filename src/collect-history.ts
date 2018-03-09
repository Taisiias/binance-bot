import * as binance from "binance";
import * as fs from "fs";

export async function collectHistory(
    binanceRest: binance.BinanceRest,
    pair: string,
): Promise<void> {
    const candleSticksFileName = `candlesticks-${pair}.json`;

    if (fs.existsSync(candleSticksFileName)) {
        fs.unlinkSync(candleSticksFileName);
    }

    // tslint:disable-next-line:no-any
    let bufArray = await (binanceRest as any).klines({
        symbol: pair,
        interval: "1m",
    });
    fs.writeFileSync(candleSticksFileName, JSON.stringify(bufArray));

    const monthAgo = bufArray[0].openTime - 30 * 24 * 60 * 60 * 1000;

    // const monthAgo = bufArray[bufArray.length - 1].openTime - 24 * 60 * 60 * 1000;
    console.log(`monthAgo: ${monthAgo}`);
    let endTimeBuf = bufArray[0].openTime - 60 * 1000;
    console.log(`endTimeBuf: ${endTimeBuf}`);

    while (endTimeBuf > monthAgo) {
        let candleSticks = JSON.parse(fs.readFileSync(candleSticksFileName, "utf8"));

        // tslint:disable-next-line:no-any
        bufArray = await (binanceRest as any).klines({
            symbol: "VENBTC",
            interval: "1m",
            endTime: endTimeBuf,
        });

        candleSticks = bufArray.concat(candleSticks);
        console.log(`candleSticks.length: ${candleSticks.length}`);
        fs.writeFileSync(candleSticksFileName, JSON.stringify(candleSticks));
        endTimeBuf = candleSticks[0].openTime - 60 * 1000;
        console.log(`endTimeBuf: ${endTimeBuf}`);
    }
}
