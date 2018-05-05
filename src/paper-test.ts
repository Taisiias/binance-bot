// import * as binance from "binance";
import * as fs from "fs";
// import * as randomSeed from "random-seed";
import { Config, CurrencyCandlestickRecord, readConfig } from "./lib";

interface Bucket {
    symbol: string;
    amount: number; // of bucket currency
    initialPriceBtc: number;
    finalPriceBtc: number;
    buyTime: number;
    paidBtc: number;
}

async function run(): Promise<void> {
    const config = readConfig("./config.json" as string);

    // const binanceRest = new binance.BinanceRest({
    //     key: config.key, // Get this from your account on binance.com
    //     secret: config.secret, // Same for this
    //     timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
    //     recvWindow: 15000,
    //     disableBeautification: false,
    //     handleDrift: false,
    // });
    // const btcRealAccountBalance = await getAccountInfo(binanceRest);
    // console.log(`Real BTC Account Balance `, btcRealAccountBalance);

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
            fs.readFileSync(`./candlesticks/candlesticks-${symbol}BTC.json`).toString());
    }

    let buckets: Bucket[] = [];

    const currencyHistories: { [key: string]: [number[], number] } = {};
    for (const symbol of config.symbols) {
        currencyHistories[symbol] = [[], 0];
    }

    let btcAmount = 0.04; // await getAccountInfo(binanceRest);
    const startBtcAmount = btcAmount;
    let totalBtcAmount = btcAmount;
    let i = 0;
    // const startDate = 0;
    let buys = 0;
    let profitSells = 0;
    let lossSells = 0;
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
            const [symbol, maDistance] = selectCurrency(config.symbols[0], currencyHistories);
            if (i >= currencyMap[symbol].length) { break; }

            const currentPriceBtc = parseFloat(currencyMap[symbol][i].close);
            const fee = config.bucketSizeBtc * config.exchangeFee;
            const rawPrice = config.bucketSizeBtc - fee;
            const amount = rawPrice / currentPriceBtc;
            const initialPriceBtc = currentPriceBtc + currentPriceBtc * config.exchangeFee;
            const paidBtc = amount * initialPriceBtc;
            console.log(`BUY ${symbol} - ${currentDate}`);
            console.log(`   MA distance: ${maDistance}`);
            console.log(`   ${currentPriceBtc} (${initialPriceBtc} incl. fee).`);
            const newBucket: Bucket = {
                symbol,
                amount,
                buyTime: currentDateNum,
                initialPriceBtc,
                finalPriceBtc: initialPriceBtc * config.profitMultiplier,
                paidBtc,
            };
            btcAmount -= paidBtc;
            console.log(`   BTC: ${btcAmount}`);
            newBuckets.push(newBucket);
            buys++;
        }

        for (const b of buckets) {
            const currencyDatas = currencyMap[b.symbol];
            if (parseFloat(currencyDatas[i].high) >= b.finalPriceBtc) {
                console.log(`SELL ${b.symbol} PROFIT - ${currentDate}`);
                console.log(`   Bought on ${new Date(b.buyTime)} at ${b.initialPriceBtc}. `);
                const gain = b.finalPriceBtc * b.amount;
                const fee = gain * config.exchangeFee;
                const totalGain = gain - fee;
                btcAmount += totalGain;
                totalBtcAmount += totalGain - b.paidBtc;
                const overallGainPercent = (totalBtcAmount / startBtcAmount) * 100;
                const bucketProfitPercent = ((totalGain - b.paidBtc) / b.paidBtc) * 100;
                console.log(
                    `   Selling at ${b.finalPriceBtc}. ` +
                    `Bucket profit: ${bucketProfitPercent}%`);
                console.log(
                    `   Gain BTC: ${totalGain}, Total BTC: ${totalBtcAmount} ` +
                    `(${overallGainPercent}%)`);
                profitSells++;
            } else if (currentDateNum >= b.buyTime + config.forceSellInMinutes * 60 * 1000) {
                console.log(`SELL ${b.symbol} LOSS - ${currentDate}`);
                console.log(`   Bought on ${new Date(b.buyTime)} at ${b.initialPriceBtc}. `);
                const price = parseFloat(currencyDatas[i].close);
                const gain = price * b.amount;
                const fee = gain * config.exchangeFee;
                const totalGain = gain - fee;
                const bucketLossPercent = ((b.paidBtc - totalGain) / b.paidBtc) * 100;
                console.log(`   Selling at ${price}. Bucket loss: ${bucketLossPercent}%`);
                btcAmount += totalGain;
                totalBtcAmount += totalGain - b.paidBtc;
                const overallGainPercent = (totalBtcAmount / startBtcAmount) * 100;
                console.log(
                    `   Got BTC: ${totalGain}, Total BTC: ${totalBtcAmount} ` +
                    `(${overallGainPercent}%)`);
                lossSells++;
            } else {
                newBuckets.push(b);
            }
        }
        buckets = newBuckets;

        i++;
    }

    console.log("Retrieving all remaining buckets.");
    for (const b of buckets) {
        console.log(`   Retrieving ${b.symbol}.`);
        const currencyDatas = currencyMap[b.symbol];
        const lastRecord = currencyDatas[currencyDatas.length - 1];
        const lastPriceBtc = parseFloat(lastRecord.low);
        const gain = lastPriceBtc * b.amount;
        // const gain = b.initialPriceBtc * b.amount;
        btcAmount += gain;
        console.log(`       Got BTC: ${gain}, BTC: ${btcAmount}`);
    }

    const overallGain = btcAmount - startBtcAmount;
    const percents = 100 * overallGain / startBtcAmount;
    console.log(`Started with BTC: ${startBtcAmount}`);
    console.log(`Final BTC amount: ${btcAmount}. Gain: ${overallGain} (${percents}%)`);
    console.log(`Buys: ${buys}, Profit sells: ${profitSells}, Loss sells: ${lossSells}`);
}

// async function getAccountInfo(binanceRest: binance.BinanceRest): Promise<number> {
//     const accountInfo = await binanceRest.account();
//     const accountBalance =
//         parseFloat(accountInfo.balances.filter((b) => b.asset === "BTC")[0].free);

//     return Promise.resolve(accountBalance);
// }

function runAndReport(): void {
    run().catch((e: Error) => {
        console.log(`An error occurred: `, e);
    });
}

function selectCurrency(
    defaultSymbol: string,
    histories: { [key: string]: [number[], number] },
): [string, number] {
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
    return [minMovingAverageSymbol, minMovingAverageDistance];
}

runAndReport();
