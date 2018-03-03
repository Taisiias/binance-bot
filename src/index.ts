import * as binance from "binance";
import * as deepMerge from "deepmerge";
import * as fs from "fs";
import * as yargs from "yargs";

interface Config {
    key: string;
    secret: string;
    databaseUrl: string;
}

const DefaultConfigObject: Config = {
    databaseUrl: "postgres://localhost/binance-bot",
    key: "",
    secret: "",
};

function run(): void {
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
        recvWindow: 10000,
        disableBeautification: false,
        handleDrift: false,
    });

    getCandlesticks(binanceRest).catch(console.log);
}

async function getCandlesticks(binanceRest: binance.BinanceRest): Promise<void> {
    const candleSticksFileName = "candlesticks.json";
    // const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (fs.existsSync(candleSticksFileName)) {
        fs.unlinkSync(candleSticksFileName);
    }

    // tslint:disable-next-line:no-any
    let bufArray = await (binanceRest as any).klines({
        symbol: "VENBTC",
        interval: "1m",
    });
    fs.writeFileSync(candleSticksFileName, JSON.stringify(bufArray));

    const monthAgo = bufArray[0].openTime - 24 * 60 * 60 * 1000;
    let endTimeBuf;

    do {
        let candleSticks = JSON.parse(fs.readFileSync(candleSticksFileName, "utf8"));
        endTimeBuf = candleSticks[0].openTime - 60 * 1000;

        // tslint:disable-next-line:no-any
        bufArray = await (binanceRest as any).klines({
            symbol: "VENBTC",
            interval: "1m",
            endTime: endTimeBuf,
        });

        candleSticks = bufArray.concat(candleSticks);
        console.log(`candleSticks.length: ${candleSticks.length}`);
        fs.writeFileSync(candleSticksFileName, JSON.stringify(candleSticks));

    } while (endTimeBuf > monthAgo);
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
    try {
        run();
    } catch (e) {
        console.log(`An error occurred: ${e.message}`);
    }
}

runAndReport();
