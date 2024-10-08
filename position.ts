import {
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    POOL_FACTORY_CONTRACT_ADDRESS,
    AVAIL_TOKEN,
    WETH_TOKEN,
} from "./constants";
import { BigNumberish, AddressLike, ethers } from "ethers";
import JSBI from "jsbi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { FeeAmount } from "@uniswap/v3-sdk";

const BLOCKCHAIN_URL = process.env.RPC_URL
    ? process.env.RPC_URL
    : "https://eth.llamarpc.com";

export interface PositionInfo {
    token0: AddressLike;
    token1: AddressLike;
    operator: AddressLike;
    fee: number;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumberish;
    feeGrowthInside0LastX128: BigNumberish;
    feeGrowthInside1LastX128: BigNumberish;
    tokensOwed0: BigNumberish;
    tokensOwed1: BigNumberish;
}

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

function getTickAtSqrtPrice(sqrtPriceX96: number): number {
    let tick = Math.floor(
        Math.log((sqrtPriceX96 / JSBI.toNumber(Q96)) ** 2) / Math.log(1.0001)
    );
    return tick;
}

export async function getTokenAmounts(
    liquidity: BigNumberish,
    sqrtPriceX96: bigint,
    tickLow: number,
    tickHigh: number,
    Decimal0: number,
    Decimal1: number
) {
    // console.log("tickLow", tickLow);
    let sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLow));
    let sqrtRatioB = Math.sqrt(1.0001 ** Number(tickHigh));
    let currentTick = getTickAtSqrtPrice(Number(sqrtPriceX96));
    let sqrtPrice = Number(sqrtPriceX96) / JSBI.toNumber(Q96);
    let amount0 = 0;
    let amount1 = 0;
    if (currentTick < tickLow) {
        amount0 = Math.floor(
            ethers.getNumber(liquidity) *
                ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
        );
    } else if (currentTick >= tickHigh) {
        amount1 = Math.floor(
            ethers.getNumber(liquidity) * (sqrtRatioB - sqrtRatioA)
        );
    } else if (currentTick >= tickLow && currentTick < tickHigh) {
        amount0 = Math.floor(
            Number(liquidity) *
                ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
        );
        amount1 = Math.floor(Number(liquidity) * (sqrtPrice - sqrtRatioA));
    }

    let amount0Human = (amount0 / 10 ** Decimal0).toFixed(Decimal0);
    let amount1Human = (amount1 / 10 ** Decimal1).toFixed(Decimal1);

    console.log("Amount Token0 : " + amount0Human);
    console.log("Amount Token1 : " + amount1Human);
    return [amount0Human, amount1Human];
}

export async function getSqrtPriceX96(): Promise<bigint> {
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_URL);

    if (!provider) {
        throw new Error("No provider available");
    }

    const currentPoolAddress = computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: AVAIL_TOKEN,
        tokenB: WETH_TOKEN,
        fee: FeeAmount.HIGH,
    });

    const poolContract = new ethers.Contract(
        currentPoolAddress,
        IUniswapV3PoolABI.abi,
        provider
    );

    const slot0 = await poolContract.slot0();

    return ethers.getBigInt(slot0[0]);
}

export async function getPositionInfo(tokenId: number): Promise<PositionInfo> {
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_URL);

    if (!provider) {
        throw new Error("No provider available");
    }

    const positionContract = new ethers.Contract(
        NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
        NONFUNGIBLE_POSITION_MANAGER_ABI,
        provider
    );

    const position = await positionContract.positions(tokenId);

    // console.log(position);

    return {
        token0: position.token0,
        token1: position.token1,
        operator: position.operator,
        fee: position.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity,
        feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
        tokensOwed0: position.tokensOwed0,
        tokensOwed1: position.tokensOwed1,
    };
}
