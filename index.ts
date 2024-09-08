import { AVAIL_TOKEN, WETH_TOKEN } from "./constants";
import { PositionInfoDB, connectToDB } from "./db";
import { getCoinPrice } from "./price";
import { getPositionInfo, getTokenAmounts, getSqrtPriceX96 } from "./position";
import express, { Application } from "express";
import Server from "./server";

const POSTION_ID = process.env.POSITION_ID
    ? parseInt(process.env.POSITION_ID, 10)
    : 10000;

function startHttpSever() {
    const app: Application = express();
    const server: Server = new Server(app);
    const PORT: number = process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 8080;

    app.listen(PORT, "localhost", function () {
        console.log(`Server is running on port ${PORT}.`);
    }).on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            console.log("Error: address already in use");
        } else {
            console.log(err);
        }
    });
}

async function queryAndSave() {
    let pos = await getPositionInfo(POSTION_ID);
    let sqrtPriceX86 = await getSqrtPriceX96();

    let amounts = await getTokenAmounts(
        pos.liquidity,
        sqrtPriceX86,
        pos.tickLower,
        pos.tickUpper,
        18,
        18
    );

    let priceAvail = await getCoinPrice(AVAIL_TOKEN.name);
    let priceEth = await getCoinPrice(WETH_TOKEN.name);

    await PositionInfoDB.create({
        token0Name: WETH_TOKEN.name,
        token0Amount: amounts[0],
        token0Price: priceEth,
        token1Name: AVAIL_TOKEN.name,
        token1Amount: amounts[1],
        token1Price: priceAvail,
    });
}

function start() {
    connectToDB();
    startHttpSever();
    const QUERY_INTERVAL: number = process.env.QUERY_INTERVAL
        ? parseInt(process.env.QUERY_INTERVAL, 10)
        : 1;
    setInterval(async () => await queryAndSave(), QUERY_INTERVAL * 60 * 1000);
}

start();
