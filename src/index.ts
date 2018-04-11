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
    bucketSizeBTC: number;
    cycleTimeMinutes: number;
    maxTimeMinutes: number;
    listOfPairs: [""];
    priceLimit: number;
}

const DefaultConfigObject: Config = {
    databaseUrl: "postgres://localhost/binance-bot",
    key: "",
    secret: "",
    bucketSizeBTC: 0.00437, // $30
    cycleTimeMinutes: 5,
    maxTimeMinutes: 1440,
    listOfPairs: [""],
    priceLimit: 2,
};

interface Bucket {
    symbol: string;
    amount: number;
    amountInBtc: number;
    initialPriceBTC: number;
    finalPriceBTC: number;
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
    const random = randomSeed.create("binance-bot");
    const config = readConfig(args.config as string);

    const binanceRest = new binance.BinanceRest({
        key: config.key, // Get this from your account on binance.com
        secret: config.secret, // Same for this
        timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
        recvWindow: 15000,
        disableBeautification: false,
        handleDrift: false,
    });

    const venHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-VENBTC.json`).toString());
    const ethHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-ETHBTC.json`).toString());
    const xrpHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-XRPBTC.json`).toString());
    const dashHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-DASHBTC.json`).toString());
    const ltcHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-LTCBTC.json`).toString());
    const adaHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-ADABTC.json`).toString());
    const neoHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-NEOBTC.json`).toString());
    const xlmHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-XLMBTC.json`).toString());
    const eosHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-EOSBTC.json`).toString());
    const xmrHistoryJson = JSON.parse(fs.readFileSync(`candlesticks-XMRBTC.json`).toString());

    console.log(`VEN history: `, venHistoryJson.length);
    console.log(`ETH history: `, ethHistoryJson.length);
    console.log(`XRP history: `, xrpHistoryJson.length);
    console.log(`DASH history: `, dashHistoryJson.length);
    console.log(`LTC history: `, ltcHistoryJson.length);
    console.log(`ADA history: `, adaHistoryJson.length);
    console.log(`NEO history: `, neoHistoryJson.length);
    console.log(`XLM history: `, xlmHistoryJson.length);
    console.log(`EOS history: `, eosHistoryJson.length);
    console.log(`XMR history: `, xmrHistoryJson.length);

    const buckets: Bucket[] = [];

    const btcAccountBalance = await getAccountInfo(binanceRest);
    console.log(`Real BTC Account Balance `, btcAccountBalance);

    let btcAmount = 0.0437; // await getAccountInfo(binanceRest);
    if (btcAmount > config.bucketSizeBTC) {
        const currencyToBuy = random(10);
        console.log(`Let's buy bucket of ${config.listOfPairs[currencyToBuy]}.`);
        const newBucket = await buyBucket(config, currencyToBuy);
        btcAmount = btcAmount - newBucket.amountInBtc;
        buckets.push(newBucket);
    }
    for (const b of buckets) {
        if (b.finalPriceBTC >= 0.999 || // get current price for b
            Date.now() >= b.buyTime + config.maxTimeMinutes * 60 * 1000) {
            console.log(`Let's sell b `, btcAmount);
        }
    }

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

async function buyBucket(
    config: Config,
    currencyToBuy: number,
): Promise<Bucket> {
    const newBucket: Bucket = {
        symbol: config.listOfPairs[currencyToBuy],
        amount: config.bucketSizeBTC / 1, // 1 for BTC rate
        amountInBtc: config.bucketSizeBTC,
        buyTime: Date.now(),
        initialPriceBTC: 1,
        finalPriceBTC: 1 * (1 + config.priceLimit),
    }; // 1 for initialPriceBTC
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
