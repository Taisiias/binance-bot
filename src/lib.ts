import * as fs from "fs";

export interface Config {
    key: string;
    secret: string;
    databaseUrl: string;
    bucketSizeBtc: number;
    cycleTimeMinutes: number;
    forceSellInMinutes: number;
    symbols: string[];
    profitMultiplier: number;
    movingAverageWindow: number;
    exchangeFee: number;
}

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
    const json = JSON.parse(fileContent) as Config;

    if (!json.hasOwnProperty("key") && !json.key) {
        throw new Error(`Property key is missing.`);
    }

    if (!json.hasOwnProperty("secret") && !json.secret) {
        throw new Error(`Property secret is missing.`);
    }

    return json as Config;
}
