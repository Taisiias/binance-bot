import * as deepMerge from "deepmerge";
import * as fs from "fs";

export interface Config {
    key: string;
    secret: string;
    databaseUrl: string;
    bucketSizeBtc: number;
    cycleTimeMinutes: number;
    maxTimeMinutes: number;
    symbols: string[];
    profitMultiplier: number;
    movingAverageWindow: number;
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
    movingAverageWindow: 60,
};

export interface CurrencyCandlestickRecord {
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

export function readConfig(path: string): Config {
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
