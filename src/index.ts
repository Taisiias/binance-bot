import * as binance from "binance";
import * as fs from "fs";
// import * as randomSeed from "random-seed";
import * as yargs from "yargs";
import { Config, CurrencyCandlestickRecord, readConfig } from "./lib";

interface Bucket {
    symbol: string;
    amount: number; // of bucket currency
    initialPriceBtc: number;
    finalPriceBtc: number;
    buyTime: number;
}

async function run(): Promise<void> {
    const args = yargs.usage("Binance-bot server. Usage: $0 [-c <config file>]")
        .options("config", {
            alias: "c",
            default: "./config.json",
            describe: "Read setting from specified config file path",
            type: "string",
        })
        .locale("en")
        .version()
        .help("help")
        .epilog("Support: https://github.com/Taisiias/binance-bot")
        .strict()
        .argv;

    const config = readConfig(args.config as string);

    const binanceRest = new binance.BinanceRest({
        key: config.key, // Get this from your account on binance.com
        secret: config.secret, // Same for this
        timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
        recvWindow: 15000,
        disableBeautification: false,
        handleDrift: false,
    });
    const btcRealAccountBalance = await getAccountInfo(binanceRest);
    console.log(`Real BTC Account Balance `, btcRealAccountBalance);

    testBinanceBot(config);
}

interface CurrencyDataMap {
    [key: string]: CurrencyCandlestickRecord[];
}

function testBinanceBot(
    config: Config,
): void {
    // const random = randomSeed.create("binance-bot");

    const currencyMap: CurrencyDataMap = {};
    for (const symbol of config.symbols) {
        currencyMap[symbol] = JSON.parse(
            fs.readFileSync(`candlesticks-${symbol}BTC.json`).toString());
    }

    let buckets: Bucket[] = [];

    const currencyHistories: { [key: string]: [number[], number] } = {};
    for (const symbol of config.symbols) {
        currencyHistories[symbol] = [[], 0];
    }

    let btcAmount = 0.03947; // await getAccountInfo(binanceRest);
    const startBtcAmount = btcAmount;
    let i = 2000;
    // const startDate = 0;
    while (true) {
        if (i >= currencyMap[config.symbols[0]].length) { break; }

        for (const symbol of config.symbols) {
            const [history] = currencyHistories[symbol];
            const currentValue = parseFloat(currencyMap[symbol][i].close);
            history.push(currentValue);
            if (history.length > config.movingAverageWindow) {
                history.shift();
            }
            currencyHistories[symbol] = [history, currentValue];
        }

        const currentDateNum = currencyMap[config.symbols[0]][i].closeTime;
        const currentDate = new Date(currentDateNum);

        const newBuckets: Bucket[] = [];

        if (btcAmount > config.bucketSizeBtc) {
            // const currencyToBuy = random(10);
            // const symbol = config.symbols[currencyToBuy];
            const symbol = selectCurrency(config.symbols[0], currencyHistories);
            if (i >= currencyMap[symbol].length) { break; }

            console.log(`${currentDate}`);
            const currentPriceBtc = parseFloat(currencyMap[symbol][i].close);
            console.log(`Let's buy bucket of ${symbol} at ${currentPriceBtc}.`);
            const newBucket = buyBucket(
                config.bucketSizeBtc, symbol, currentPriceBtc, config.profitMultiplier,
                currentDateNum);
            btcAmount -= newBucket.amount * newBucket.initialPriceBtc;
            console.log(`BTC: ${btcAmount}`);
            newBuckets.push(newBucket);
        }

        for (const b of buckets) {
            const currencyDatas = currencyMap[b.symbol];
            if (parseFloat(currencyDatas[i].high) >= b.finalPriceBtc) {
                console.log(`${currentDate}`);
                console.log(
                    `Let's sell bucket of ${b.symbol} with profit. ` +
                    `Bought on ${new Date(b.buyTime)} at ${b.initialPriceBtc}. ` +
                    `Selling at ${b.finalPriceBtc}`);
                btcAmount += b.finalPriceBtc * b.amount;
                console.log(`Got BTC: ${b.finalPriceBtc * b.amount}, BTC: ${btcAmount}`);
            } else if (currentDateNum >= b.buyTime + config.maxTimeMinutes * 60 * 1000) {
                const price = parseFloat(currencyDatas[i].low);
                const percent = 100 - Math.round((price / b.initialPriceBtc) * 10000) / 100;
                console.log(`${currentDate}`);
                console.log(
                    `Let's sell bucket of ${b.symbol} with loss. ` +
                    `Bought on ${new Date(b.buyTime)} at ${b.initialPriceBtc}. ` +
                    `Selling at ${price}. Loss: ${percent}%`);
                const gain = price * b.amount;
                btcAmount += gain;
                console.log(`Got BTC: ${gain}, BTC: ${btcAmount}`);
            } else {
                newBuckets.push(b);
            }
        }
        buckets = newBuckets;

        i++;
    }

    console.log("Selling all remaining buckets.");
    for (const b of buckets) {
        console.log(`Selling ${b.symbol}.`);
        const currencyDatas = currencyMap[b.symbol];
        const lastRecord = currencyDatas[currencyDatas.length - 1];
        const lastPriceBtc = parseFloat(lastRecord.low);
        const gain = lastPriceBtc * b.amount;
        // const gain = b.initialPriceBtc * b.amount;
        btcAmount += gain;
        console.log(`Got BTC: ${gain}, BTC: ${btcAmount}`);
    }

    const overallGain = btcAmount - startBtcAmount;
    const percents = 100 * overallGain / startBtcAmount;
    console.log(`Final BTC amount: ${btcAmount}. Gain: ${overallGain} (${percents}%)`);
}

function buyBucket(
    bucketSizeBtc: number,
    symbol: string,
    initialPriceBtc: number,
    profitMultiplier: number,
    buyTime: number,
): Bucket {
    const newBucket: Bucket = {
        symbol,
        amount: bucketSizeBtc / initialPriceBtc,
        buyTime,
        initialPriceBtc,
        finalPriceBtc: initialPriceBtc * profitMultiplier,
    };
    return newBucket;
}

async function getAccountInfo(binanceRest: binance.BinanceRest): Promise<number> {
    const accountInfo = await binanceRest.account();
    const accountBalance =
        parseFloat(accountInfo.balances.filter((b) => b.asset === "BTC")[0].free);

    return Promise.resolve(accountBalance);
}

function runAndReport(): void {
    run().catch((e: Error) => {
        console.log(`An error occurred: `, e);
    });
}

function selectCurrency(
    defaultSymbol: string,
    histories: { [key: string]: [number[], number] },
): string {
    let minMovingAverageDistance = Infinity;
    let minMovingAverageSymbol = defaultSymbol;
    for (const symbol in histories) {
        if (!histories.hasOwnProperty(symbol)) { continue; }
        const [history, currentValue] = histories[symbol];
        if (history.length === 0) {
            continue;
        }
        const movingAverage = history.reduce((a, i) => a + i, 0) / history.length;
        const movingAverageDistance = (currentValue - movingAverage) / movingAverage;
        // console.log(
        //     `${symbol}: (${currentValue} - ${movingAverage}) / ` +
        //     `${movingAverage} = ${movingAverageDistance}`);
        if (movingAverageDistance < minMovingAverageDistance) {
            minMovingAverageDistance = movingAverageDistance;
            minMovingAverageSymbol = symbol;
        }
    }
    return minMovingAverageSymbol;
}

runAndReport();
