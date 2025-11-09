"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuote = getQuote;
exports.getMultipleQuotes = getMultipleQuotes;
const axios_1 = __importDefault(require("axios"));
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d473fphr01qh8nnav5t0d473fphr01qh8nnav5tg";
const FINNHUB_BASE = "https://finnhub.io/api/v1";
async function getQuote(symbol) {
    // Indian stock symbols need .NS (NSE) or .BO (BSE) suffix for Finnhub
    // Try with .NS first (most common), then .BO, then original symbol
    const formats = [
        `${symbol}.NS`, // NSE format
        `${symbol}.BO`, // BSE format
        symbol, // Original format (for US stocks like AAPL, TSLA)
    ];
    for (const formattedSymbol of formats) {
        try {
            const res = await axios_1.default.get(`${FINNHUB_BASE}/quote`, {
                params: { symbol: formattedSymbol, token: FINNHUB_API_KEY },
            });
            if (res.data && res.data.c > 0) {
                return res.data;
            }
        }
        catch (error) {
            // Try next format
            continue;
        }
    }
    console.error(`Finnhub quote error for ${symbol}: No valid quote found in any format`);
    return null;
}
async function getMultipleQuotes(symbols) {
    const results = {};
    await Promise.all(symbols.map(async (sym) => {
        const quote = await getQuote(sym);
        if (quote)
            results[sym] = quote;
    }));
    return results;
}
