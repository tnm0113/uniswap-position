import "dotenv/config";

const dig = (obj, target) =>
    target in obj
        ? obj[target]
        : Object.values(obj).reduce((acc, val) => {
              if (acc !== undefined) return acc;
              if (typeof val === "object") return dig(val, target);
          }, undefined);

export async function getCoinPrice(coinName: string): Promise<any> {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "x-cg-demo-api-key": process.env.GECKO_API,
        },
    };

    let response = await (
        await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=usd`,
            options
        )
    ).json();

    return dig(response, "usd");
}
