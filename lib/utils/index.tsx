import { ToolDefinition } from "@/lib/utils/tool-definition";
import { OpenAIStream } from "ai";
import type OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const consumeStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
};

export function runOpenAICompletion<
  T extends Omit<
    Parameters<typeof OpenAI.prototype.chat.completions.create>[0],
    "functions"
  > & {
    functions: ToolDefinition<any, any>[];
  }
>(openai: OpenAI, params: T) {
  let text = "";
  let hasFunction = false;

  type FunctionNames = T["functions"] extends Array<any>
    ? T["functions"][number]["name"]
    : never;

  let onTextContent: (text: string, isFinal: boolean) => void = () => {};

  let onFunctionCall: Record<string, (args: Record<string, any>) => void> = {};

  const { functions, ...rest } = params;

  (async () => {
    consumeStream(
      OpenAIStream(
        (await openai.chat.completions.create({
          ...rest,
          stream: true,
          functions: functions.map((fn) => ({
            name: fn.name,
            description: fn.description,
            parameters: zodToJsonSchema(fn.parameters) as Record<
              string,
              unknown
            >,
          })),
        })) as any,
        {
          async experimental_onFunctionCall(functionCallPayload) {
            hasFunction = true;
            onFunctionCall[
              functionCallPayload.name as keyof typeof onFunctionCall
            ]?.(functionCallPayload.arguments as Record<string, any>);
          },
          onToken(token) {
            text += token;
            if (text.startsWith("{")) return;
            onTextContent(text, false);
          },
          onFinal() {
            if (hasFunction) return;
            onTextContent(text, true);
          },
        }
      )
    );
  })();

  return {
    onTextContent: (
      callback: (text: string, isFinal: boolean) => void | Promise<void>
    ) => {
      onTextContent = callback;
    },
    onFunctionCall: (
      name: FunctionNames,
      callback: (args: any) => void | Promise<void>
    ) => {
      onFunctionCall[name] = callback;
    },
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn();
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Fake data
export function getStockPrice(name: string) {
  let total = 0;
  for (let i = 0; i < name.length; i++) {
    total = (total + name.charCodeAt(i) * 9999121) % 9999;
  }
  return total / 100;
}

export function getWalletTokens(address: string) {
  //fetch it
  return [
    {
      contract_name: "Liquid Staking Matic (PoS)",
      contract_ticker_symbol: "MaticX",
      contract_decimals: 18,
      contract_address: "0xfa68fb4628dff1028cfec22b4162fccd0d45efb6",
      coin: 137,
      balance: "148726464900856685",
      quote: "0.19036987507309655",
      quote_rate: "1.28",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6.png",
      quote_rate_24h: "0.03752451",
      quote_pct_change_24h: 3.02041,
      quote_price: "0.19036987507309655",
    },
    {
      contract_name: "Matic",
      contract_ticker_symbol: "MATIC",
      contract_decimals: 18,
      contract_address: "0x0000000000000000000000000000000000001010",
      coin: 137,
      balance: "121554959470228120",
      quote: "0.1410037529854646",
      quote_rate: "1.16",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x0000000000000000000000000000000000001010.png",
      quote_rate_24h: "0.03062967",
      quote_pct_change_24h: 2.70873,
      quote_price: "0.1410037529854646",
    },
    {
      contract_name: "SushiToken (PoS)",
      contract_ticker_symbol: "SUSHI",
      contract_decimals: 18,
      contract_address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      coin: 137,
      balance: "34074904613529720",
      quote: "0.06780906018092415",
      quote_rate: "1.99",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a.png",
      quote_rate_24h: "0.104722",
      quote_pct_change_24h: 5.56846,
      quote_price: "0.06780906018092415",
    },
    {
      contract_name: "(PoS) Tether USD",
      contract_ticker_symbol: "USDT",
      contract_decimals: 6,
      contract_address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      coin: 137,
      balance: "32891",
      quote: "0.03292389099999999",
      quote_rate: "1.001",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xc2132D05D31c914a87C6611C10748AEb04B58e8F.png",
      quote_rate_24h: "0.00149526",
      quote_pct_change_24h: 0.14966,
      quote_price: "0.03292389099999999",
    },
    {
      contract_name: "(PoS) Dai Stablecoin",
      contract_ticker_symbol: "DAI",
      contract_decimals: 18,
      contract_address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      coin: 137,
      balance: "13971095111010496",
      quote: "0.014013008396343526",
      quote_rate: "1.003",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063.png",
      quote_rate_24h: "0.00186017",
      quote_pct_change_24h: 0.18578,
      quote_price: "0.014013008396343526",
    },
    {
      contract_name: "Pigcoin",
      contract_ticker_symbol: "PIG",
      contract_decimals: 18,
      contract_address: "0xe9bc9ad74cca887aff32ba09a121b1256fc9f052",
      coin: 137,
      balance: "92590000000000000000",
      quote: "0.0039489635",
      quote_rate: "0.00004265",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xe9bC9AD74CCa887Aff32ba09a121B1256fC9f052.png",
      quote_rate_24h: "0.00000202",
      quote_pct_change_24h: 4.97229,
      quote_price: "0.0039489635",
    },
    {
      contract_name: "Wrapped Ether",
      contract_ticker_symbol: "WETH",
      contract_decimals: 18,
      contract_address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      coin: 137,
      balance: "473778467840",
      quote: "0.001849678516294144",
      quote_rate: "3904.1",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png",
      quote_rate_24h: "87.16",
      quote_pct_change_24h: 2.28346,
      quote_price: "0.001849678516294144",
    },
    {
      contract_name: "Wrapped Matic",
      contract_ticker_symbol: "WMATIC",
      contract_decimals: 18,
      contract_address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      coin: 137,
      balance: "793338660517",
      quote: "0.00000092027284619972",
      quote_rate: "1.16",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270.png",
      quote_rate_24h: "0.03089486",
      quote_pct_change_24h: 2.73113,
      quote_price: "0.00000092027284619972",
    },
    {
      contract_name: "(PoS) Decentraland MANA",
      contract_ticker_symbol: "MANA",
      contract_decimals: 18,
      contract_address: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
      coin: 137,
      balance: "922024530230",
      quote: "0.0000006389362607380133",
      quote_rate: "0.692971",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4.png",
      quote_rate_24h: "0.02559246",
      quote_pct_change_24h: 3.83477,
      quote_price: "0.0000006389362607380133",
    },
    {
      contract_name: "CRV (PoS)",
      contract_ticker_symbol: "CRV",
      contract_decimals: 18,
      contract_address: "0x172370d5cd63279efa6d502dab29171933a610af",
      coin: 137,
      balance: "557688572989",
      quote: "0.00000044089575896792467",
      quote_rate: "0.790577",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x172370d5Cd63279eFa6d502DAB29171933a610AF.png",
      quote_rate_24h: "-0.002468618403082657",
      quote_pct_change_24h: -0.31128,
      quote_price: "0.00000044089575896792467",
    },
    {
      contract_name: "Frontier Token (PoS)",
      contract_ticker_symbol: "FRONT",
      contract_decimals: 18,
      contract_address: "0xa3ed22eee92a3872709823a6970069e12a4540eb",
      coin: 137,
      balance: "294712775791",
      quote: "0.00000022026773920064183",
      quote_rate: "0.747398",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xa3eD22EEE92a3872709823a6970069e12A4540Eb.png",
      quote_rate_24h: "0.057456",
      quote_pct_change_24h: 8.32771,
      quote_price: "0.00000022026773920064183",
    },
    {
      contract_name: "Fish",
      contract_ticker_symbol: "FISH",
      contract_decimals: 18,
      contract_address: "0x3a3df212b7aa91aa0402b9035b098891d276572b",
      coin: 137,
      balance: "440032192909",
      quote: "0.00000009228795181880456",
      quote_rate: "0.20973",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x3a3Df212b7AA91Aa0402B9035b098891d276572B.png",
      quote_rate_24h: "-0.005414053285136861",
      quote_pct_change_24h: -2.51648,
      quote_price: "0.00000009228795181880456",
    },
    {
      contract_name: "Aluna (PoS)",
      contract_ticker_symbol: "ALN",
      contract_decimals: 18,
      contract_address: "0xa8fcee762642f156b5d757b6fabc36e06b6d4a1a",
      coin: 137,
      balance: "327595728918",
      quote: "0.0000000010768694041419605",
      quote_rate: "0.00328719",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xa8fcEe762642f156b5D757b6FabC36E06b6d4A1A.png",
      quote_rate_24h: "-0.00002666789494441",
      quote_pct_change_24h: -0.80474,
      quote_price: "0.0000000010768694041419605",
    },
    {
      contract_name: "Mobius Token",
      contract_ticker_symbol: "MOT",
      contract_decimals: 18,
      contract_address: "0x2db0db271a10661e7090b6758350e18f6798a49d",
      coin: 137,
      balance: "144897001000",
      quote: "0.00000000017357791337794",
      quote_rate: "0.00119794",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x2db0Db271a10661e7090b6758350E18F6798a49D.png",
      quote_rate_24h: "0.00006212",
      quote_pct_change_24h: 5.46919,
      quote_price: "0.00000000017357791337794",
    },
    {
      contract_name: "PolkaBridge",
      contract_ticker_symbol: "PBR",
      contract_decimals: 18,
      contract_address: "0x0d6ae2a429df13e44a07cd2969e085e4833f64a0",
      coin: 137,
      balance: "5",
      quote: "0.00000000000000000039648000000000006",
      quote_rate: "0.079296",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x0D6ae2a429df13e44A07Cd2969E085e4833f64A0.png",
      quote_rate_24h: "-0.005594882064964557",
      quote_pct_change_24h: -6.59065,
      quote_price: "0.00000000000000000039648000000000006",
    },
    {
      contract_name: "Snook",
      contract_ticker_symbol: "SNK",
      contract_decimals: 18,
      contract_address: "0x689f8e5913c158ffb5ac5aeb83b3c875f5d20309",
      coin: 137,
      balance: "2",
      quote: "0.000000000000000000019184840000000002",
      quote_rate: "0.00959242",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x689f8e5913C158fFB5Ac5aeb83b3C875F5d20309.png",
      quote_rate_24h: "-0.000051368473294044",
      quote_pct_change_24h: -0.53266,
      quote_price: "0.000000000000000000019184840000000002",
    },
    {
      contract_name: "USD",
      contract_ticker_symbol: "usd-rewards.xyz",
      contract_decimals: 18,
      contract_address: "0x25b255a3519ababde43b65a7ee4874bb7da126a9",
      coin: 137,
      balance: "777000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x25b255A3519AbABde43B65A7EE4874Bb7DA126A9.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Gnosis Token (PoS)",
      contract_ticker_symbol: "GNO",
      contract_decimals: 18,
      contract_address: "0x5ffd62d3c3ee2e81c00a7b9079fb248e7df024a8",
      coin: 137,
      balance: "788068341070280",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x5FFD62D3C3eE2E81C00A7b9079FB248e7dF024A8.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "$ xBets.org",
      contract_ticker_symbol: "$ Free Claim and Play",
      contract_decimals: 8,
      contract_address: "0xaf6b1a3067bb5245114225556e5b7a52cf002752",
      coin: 137,
      balance: "50000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xaf6B1a3067Bb5245114225556e5b7A52cf002752.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Harvest Interest Token",
      contract_ticker_symbol: "miFARM",
      contract_decimals: 18,
      contract_address: "0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff",
      coin: 137,
      balance: "110384408020710",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xab0b2ddB9C7e440fAc8E140A89c0dbCBf2d7Bbff.png",
      quote_rate_24h: "1.89",
      quote_pct_change_24h: 2.58279,
      quote_price: "0",
    },
    {
      contract_name: "GGBoxs.com",
      contract_ticker_symbol: "GGBoxs.com",
      contract_decimals: 18,
      contract_address: "0xcf68f02d7dd6a4642ae6a77f6a3676d0cbc834c9",
      coin: 137,
      balance: "60000000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xcf68f02d7dD6a4642AE6a77f6A3676D0CBC834c9.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "! abict.us",
      contract_ticker_symbol: "Claim Rewards at https://abict.us",
      contract_decimals: 18,
      contract_address: "0xf9cc65b807e5547f839ffd82834c1993e0bb124f",
      coin: 137,
      balance: "177000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xF9CC65b807E5547f839fFD82834c1993E0Bb124f.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "TBBT.org",
      contract_ticker_symbol: "TBBT.org",
      contract_decimals: 18,
      contract_address: "0x5de9eb5baa578666dfcdc00d3b2ee3f94c4f1c55",
      coin: 137,
      balance: "50000000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x5dE9EB5bAa578666Dfcdc00D3b2ee3f94C4f1c55.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "TIA",
      contract_ticker_symbol: "celestia.icu",
      contract_decimals: 18,
      contract_address: "0x31fbc04d7cf5dc2889857dd873624e5b25a41657",
      coin: 137,
      balance: "84000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x31fBC04d7cF5dC2889857DD873624E5b25A41657.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "$0Bets.io",
      contract_ticker_symbol: "0Bets.io",
      contract_decimals: 8,
      contract_address: "0x7f4c2f7671e6817bb01195d24e4eafc94435f5d0",
      coin: 137,
      balance: "300000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x7f4C2f7671e6817Bb01195d24e4eAfC94435f5d0.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "@ MetaWin.to",
      contract_ticker_symbol: "RAFFLE TICKET",
      contract_decimals: 18,
      contract_address: "0x4e06b0b8d8100d1624340ac31361535749ffa710",
      coin: 137,
      balance: "3000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x4e06b0b8d8100d1624340AC31361535749fFa710.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Genesis",
      contract_ticker_symbol: "GENESIS",
      contract_decimals: 18,
      contract_address: "0x51869836681bce74a514625c856afb697a013797",
      coin: 137,
      balance: "38647506521527252500",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x51869836681BcE74a514625c856aFb697a013797.png",
      quote_rate_24h: "0.00007387",
      quote_pct_change_24h: 6.52083,
      quote_price: "0",
    },
    {
      contract_name: "goodgames.lol",
      contract_ticker_symbol: "goodgames.lol",
      contract_decimals: 8,
      contract_address: "0x650a15efcef2c0420d1242dec0c4e5975ccf842b",
      coin: 137,
      balance: "300000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x650a15efceF2C0420D1242dEC0C4E5975cCF842B.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "24drop.net",
      contract_ticker_symbol: "24DROP.NET",
      contract_decimals: 8,
      contract_address: "0x4cd5b93965aa547510066f9e20a39ef84406d232",
      coin: 137,
      balance: "200000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x4cd5b93965aa547510066F9E20a39ef84406D232.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "beefy.finance",
      contract_ticker_symbol: "BIFI",
      contract_decimals: 18,
      contract_address: "0xfbdd194376de19a88118e84e279b977f165d01b8",
      coin: 137,
      balance: "68470556923446",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xFbdd194376de19a88118e84E279b977f165d01b8.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "$ abict.pro",
      contract_ticker_symbol: "Claim Rewards at https://abict.pro",
      contract_decimals: 18,
      contract_address: "0xdfd605a4a50bad494e20fed2de25f667721c9f53",
      coin: 137,
      balance: "752000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xdFd605A4a50BAD494E20feD2De25f667721C9f53.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "999 MATIC",
      contract_ticker_symbol: "https://wincoin.win/",
      contract_decimals: 18,
      contract_address: "0x4e35b8b5deff8786aae88edd8875ee8aa1d5d7c4",
      coin: 137,
      balance: "1000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x4e35B8B5DEFf8786AAE88EDD8875ee8aa1d5d7C4.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "$ HEXPool.io",
      contract_ticker_symbol: "wHEX",
      contract_decimals: 18,
      contract_address: "0x25c3f5ef0328eb71388b77da1c3ee458ec5c1ffb",
      coin: 137,
      balance: "101925000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x25C3f5EF0328eB71388B77dA1c3ee458ec5c1fFb.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "#HEXPool.net",
      contract_ticker_symbol: "wHEX",
      contract_decimals: 18,
      contract_address: "0xd3a86c0ce31a6b91c9c0e0798bfacb6154f0d067",
      coin: 137,
      balance: "157250000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xD3a86c0Ce31A6b91c9C0E0798bfACb6154f0D067.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "TRUST WALLET MYSTERY BOX",
      contract_ticker_symbol: "Use just official link: TRUSTBOX.SITE",
      contract_decimals: 0,
      contract_address: "0x82c1c45b84d5c0f730115121ba2dd9ce3e36389f",
      coin: 137,
      balance: "1",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x82C1C45B84d5c0F730115121ba2dD9ce3e36389f.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "TRUST WALLET MYSTERY BOX",
      contract_ticker_symbol: "Use just official link: Trust-earn.xyz",
      contract_decimals: 0,
      contract_address: "0x423f1774adc872ff8b11199c7668f8a48279be5d",
      coin: 137,
      balance: "1",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x423F1774ADc872ff8B11199C7668f8a48279bE5D.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "PolygonClassics.com",
      contract_ticker_symbol: "PolygonClassics.com",
      contract_decimals: 18,
      contract_address: "0x8a6b62f5501410d179641e731a8f1cecef1c28ec",
      coin: 137,
      balance: "1497000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x8a6b62F5501410D179641e731a8F1CEcef1c28ec.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Fantom Token",
      contract_ticker_symbol: "FTM",
      contract_decimals: 18,
      contract_address: "0xb85517b87bf64942adf3a0b9e4c71e4bc5caa4e5",
      coin: 137,
      balance: "664633000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xB85517b87BF64942adf3A0B9E4c71E4Bc5Caa4e5.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "PolyGamma Finance",
      contract_ticker_symbol: "GAMMA",
      contract_decimals: 18,
      contract_address: "0x329f5e8aff351327e63acdb264389c798a46c2d3",
      coin: 137,
      balance: "161021401790147737",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x329F5e8Aff351327E63ACdB264389c798a46c2D3.png",
      quote_rate_24h: "0.00145139",
      quote_pct_change_24h: 2.39309,
      quote_price: "0",
    },
    {
      contract_name: "! MetaWin",
      contract_ticker_symbol: "ENTRY TICKET - www.metawin.land",
      contract_decimals: 18,
      contract_address: "0xcef2ea886ad6d36ce0029d800d5d0c25d5b5d1eb",
      coin: 137,
      balance: "3000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xCEF2EA886aD6D36cE0029d800d5d0C25D5b5D1eB.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Anyswap",
      contract_ticker_symbol: "ANY",
      contract_decimals: 18,
      contract_address: "0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8",
      coin: 137,
      balance: "647230691054840",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8.png",
      quote_rate_24h: "0.51457",
      quote_pct_change_24h: 9.22032,
      quote_price: "0",
    },
    {
      contract_name: "#LINK",
      contract_ticker_symbol: "Claim at LINKBonus.io",
      contract_decimals: 18,
      contract_address: "0xf02ac2517d9ec6e70888bcaf7dd8d105127f891e",
      coin: 137,
      balance: "146150000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xF02AC2517d9ec6e70888BcAF7dd8d105127F891e.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "ARCY.io",
      contract_ticker_symbol: "Visit [ arcy.io ] and claim special rewards",
      contract_decimals: 18,
      contract_address: "0xf284121100433b49a04618978715fbf2049e1a4c",
      coin: 137,
      balance: "7470000000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xf284121100433b49A04618978715FbF2049e1a4c.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "LINKToken.io",
      contract_ticker_symbol: "tLINK",
      contract_decimals: 18,
      contract_address: "0xf11191cc9567656586924795965cc371f2206f8a",
      coin: 137,
      balance: "189150000000000000000",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xF11191cC9567656586924795965cC371F2206F8a.png",
      quote_rate_24h: "0",
      quote_pct_change_24h: 0,
      quote_price: "0",
    },
    {
      contract_name: "Adamant",
      contract_ticker_symbol: "ADDY",
      contract_decimals: 18,
      contract_address: "0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539",
      coin: 137,
      balance: "2248848598428365",
      quote: "0",
      quote_rate: "0",
      logo_url:
        "https://assets.unmarshal.io/tokens/matic_0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539.png",
      quote_rate_24h: "0.00442344",
      quote_pct_change_24h: 2.61127,
      quote_price: "0",
    },
  ];
}
