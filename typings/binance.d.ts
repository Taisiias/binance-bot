/// <reference types="node" />

declare module "binance" {
    interface BinanceRestOptions {
        key: string,
        secret: string,
        recvWindow?: number,
        timeout?: number,
        disableBeautification?: boolean,
        handleDrift?: boolean,
    }

    interface RateLimit {
        rateLimitType: string,
        interval: string,
        limit: number,
    }

    interface FilterInfo {
        filterType: string,
        minPrice?: string,
        maxPrice?: string,
        tickSize?: string,
        minQty?: string,
        maxQty?: string,
        stepSize?: string,
        minNotional?: string,
    }

    interface SymbolInfo {
        symbol: string,
        status: string,
        baseAsset: string,
        baseAssetPrecision: number,
        quoteAsset: string,
        quotePrecision: number,
        orderTypes: string[],
        icebergAllowed: boolean,
        filters: FilterInfo[],
    }

    interface ExchangeInfo {
        timezone: string,
        serverTime: number,
        rateLimits: RateLimit[],
        exchangeFilters: FilterInfo[],
        symbols: SymbolInfo[],
    }

    interface Balance {
        asset: string,
        free: string,
        locked: string,
    }

    interface AccountInfo {
        makerCommission: number,
        takerCommission: number,
        buyerCommission: number,
        sellerCommission: number,
        canTrade: true,
        canWithdraw: true,
        canDeposit: true,
        updateTime: number,
        balances: Balance[],
    }

    interface TickerPrice {
        symbol: string,
        price: string,
    }

    interface Ticker24HrPrice {
        symbol: string,
        priceChange: string,
        priceChangePercent: string,
        weightedAvgPrice: string,
        prevClosePrice: string,
        lastPrice: string,
        lastQty: string,
        bidPrice: string,
        bidQty: string,
        askPrice: string,
        askQty: string,
        openPrice: string,
        highPrice: string,
        lowPrice: string,
        volume: string,
        quoteVolume: string,
        openTime: number,
        closeTime: number,
        firstId: number,
        lastId: number,
        count: number
    }

    interface OrderQuery {
        symbol: string,
        side: "BUY" | "SELL",
        type: OrderType,
        timeInForce?: "GTC" | "IOC" | "FOK",
        quantity: number | string,
        price?:  number | string,
        newClientOrderId?: string,
        stopPrice?: number | string,
        icebergQty?: number | string,
        newOrderRespType?: "ACK" | "RESULT" | "FULL",
        recvWindow?: number,
        timestamp?: number,
    }

    type OrderType =
        "LIMIT" |
        "MARKET" |
        "STOP_LOSS" |
        "STOP_LOSS_LIMIT" |
        "TAKE_PROFIT" |
        "TAKE_PROFIT_LIMIT" |
        "LIMIT_MAKER";

    interface OrderResult {
        symbol: string,
        orderId: number,
        clientOrderId: string,
        transactTime: number,
        price?: string,
        origQty?: string,
        executedQty?: string,
        status?: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED",
        timeInForce?: "GTC" | "IOC" | "FOK",
        type?: OrderType,
        side?: "BUY" | "SELL",
        fills?: OrderFill[],
    }

    interface OrderFill {
        price: string,
        qty: string,
        commission: string,
        commissionAsset: string,
        tradeId: number,
    }

    class BinanceRest {
        constructor(options: BinanceRestOptions);
        time(): Promise<{ serverTime: number }>;
        exchangeInfo(): Promise<ExchangeInfo>;
        depth(query: { symbol: string, limit: number } | string): Promise<any>;
        trades(query: { symbol: string, limit: number } | string): Promise<any>;
        openOrders(query?: {
            symbol?: string,
            recvWindow?: number,
            timestamp?: number,
        }): Promise<any>;
        allOrders(query: string|{
            symbol: string,
            orderId?: number,
            limit?: number,
            recvWindow?: number,
            timestamp?: number,
        }): Promise<any>;
        accountStatus(): Promise<any>;
        account(): Promise<AccountInfo>;
        tickerPrice(query: string): Promise<TickerPrice>;
        ticker24hr(query: string): Promise<Ticker24HrPrice>;
        newOrder(query: OrderQuery): Promise<OrderResult>;
    }

    class BinanceWS {
        constructor(beautify: boolean);
    }
}