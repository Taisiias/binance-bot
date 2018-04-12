import * as binance from "binance";
import * as deepMerge from "deepmerge";
import * as fs from "fs";
import * as randomSeed from "random-seed";
import * as yargs from "yargs";
// import { collectHistory } from "./collect-history";

interface Config {
    key: string;
    secret: string;
    databaseUrl: string;
    bucketSizeBtc: number;
    cycleTimeMinutes: number;
    maxTimeMinutes: number;
    symbols: string[];
    profitMultiplier: number;
}

const DefaultConfigObject: Config = {
    databaseUrl: "postgres://localhost/binance-bot",
    key: "",
    secret: "",
    bucketSizeBtc: 0.00437, // $30
    cycleTimeMinutes: 5,
    maxTimeMinutes: 1440,
    symbols: [],
    profitMultiplier: 2,
};

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

    // console.log(`BTC Balance: 1`, accountBalance);
    // const pairs = ["VENBTC", "ETHBTC", "XRPBTC",
    //     "DASHBTC", "LTCBTC", "ADABTC", "NEOBTC",
    //     "XLMBTC", "EOSBTC", "XMRBTC"];

    // for (const pair of pairs) {
    //     console.log(`Getting history of ${pair}`);
    //     collectHistory(binanceRest, pair).catch((e) => {
    //         console.log(`Error in ${pair}: ${e}`);
    //     });
    // }
}

interface CurrencyCandlestickRecord {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    trades: number;
    takerBaseAssetVolume: string;
    takerQuoteAssetVolume: string;
    ignored: string;
}

interface CurrencyDataMap {
    [key: string]: CurrencyCandlestickRecord[];
}

function testBinanceBot(
    config: Config,
): void {
    const random = randomSeed.create("binance-bot");

    const currencyMap: CurrencyDataMap = {};
    for (const symbol of config.symbols) {
        currencyMap[symbol] = JSON.parse(
            fs.readFileSync(`candlesticks-${symbol}BTC.json`).toString());
    }

    let buckets: Bucket[] = [];

    let btcAmount = 0.03947; // await getAccountInfo(binanceRest);
    const startBtcAmount = btcAmount;
    let i = 0;
    const startDate = 0;
    while (true) {
        // console.log(`Step ${i}`);
        const newBuckets: Bucket[] = [];

        const currentDate = startDate + i * 60 * 1000;

        if (btcAmount > config.bucketSizeBtc) {
            const currencyToBuy = random(10);
            const symbol = config.symbols[currencyToBuy];
            if (i >= currencyMap[symbol].length) { break; }

            console.log(`Let's buy bucket of ${symbol}.`);
            const currentPriceBtc = parseFloat(currencyMap[symbol][i].high);
            const newBucket = buyBucket(
                config.bucketSizeBtc, symbol, currentPriceBtc, config.profitMultiplier,
                currentDate);
            btcAmount -= newBucket.amount * newBucket.initialPriceBtc;
            console.log(`BTC: ${btcAmount}`);
            newBuckets.push(newBucket);
        }

        if (i >= currencyMap[config.symbols[0]].length) { break; }

        for (const b of buckets) {
            const currencyDatas = currencyMap[b.symbol];
            if (parseFloat(currencyDatas[i].high) >= b.finalPriceBtc) {
                console.log(`Let's sell bucket of ${b.symbol} with profit.`);
                btcAmount += b.finalPriceBtc * b.amount;
                console.log(`Got BTC: ${b.finalPriceBtc * b.amount}, BTC: ${btcAmount}`);
            } else if (currentDate >= b.buyTime + config.maxTimeMinutes * 60 * 1000) {
                console.log(`Let's sell bucket of ${b.symbol} with loss.`);
                const gain = parseFloat(currencyDatas[i].low) * b.amount;
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

function readConfig(path: string): Config {
    if (!fs.existsSync(path)) {
        throw new Error(`Config file was not found.`);
    }

    let fileContent = "";
    try {
        fileContent = fs.readFileSync(path).toString();
    } catch (e) {
        throw new Error(`Config file cannot be read. ${e}`);
    }
    let cf: Config;
    try {
        if (fileContent === "") {
            throw new Error(`Config file is empty`);
        }
        cf = createConfigObject(fileContent);
    } catch (e) {
        throw new Error(`Config file cannot be parsed. ${e}`);
    }
    return cf;
}

function createConfigObject(fileContent: string): Config {
    let cf: Config;
    const json = JSON.parse(fileContent) as Config;
    /* tslint:disable:no-any */
    const mergedObject: { [k: string]: any } = deepMerge(DefaultConfigObject, json);

    if (!mergedObject.hasOwnProperty("key") && !mergedObject.key) {
        throw new Error(`Property key is missing.`);
    }

    if (!mergedObject.hasOwnProperty("secret") && !mergedObject.secret) {
        throw new Error(`Property secret is missing.`);
    }

    cf = mergedObject as Config;

    return cf;
}

function runAndReport(): void {
    run().catch((e: Error) => {
        console.log(`An error occurred: `, e);
    });
}

runAndReport();
