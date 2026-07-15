export const REWARD_UNIT_SCALE = 10n ** 24n;
export const DAYS_PER_YEAR = 365.25;
const DECIMAL_SCALE = 1_000_000n;
const SECONDS_PER_DAY = 86_400n;

export type EconomicsInputs = {
  stakedNear: number;
  nearPriceUsd: number;
  stakingApyPercent: number;
  discountPercent: number;
  creditPriceUsd: number;
};

export type EconomicsOutputs = {
  annualCreditsPerNear: number;
  monthlyCreditsPerNear: number;
  monthlyCredits: number;
  creditsPerSecond: number;
  farmMonthlyEquivalentCredits: number;
  creditsPerStakedNearNanoUsd: number;
  farmRewardRate: bigint;
  farmRewardRatePerSecond: number;
};

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function scaled(value: number): bigint {
  const normalized = positive(value, 0).toFixed(6);
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(6, "0"));
}

function calculateFarmRewardRate(inputs: EconomicsInputs): bigint {
  const nearPrice = scaled(inputs.nearPriceUsd);
  const stakingApyPercent = scaled(inputs.stakingApyPercent);
  const discountPercent = scaled(inputs.discountPercent);
  const creditPrice = scaled(inputs.creditPriceUsd);
  const daysPerYear = scaled(DAYS_PER_YEAR);

  if (
    nearPrice === 0n ||
    stakingApyPercent === 0n ||
    discountPercent === 0n ||
    creditPrice === 0n ||
    daysPerYear === 0n
  ) {
    return 0n;
  }

  return (
    (nearPrice * stakingApyPercent * DECIMAL_SCALE * REWARD_UNIT_SCALE) /
    (discountPercent * creditPrice * daysPerYear * SECONDS_PER_DAY)
  );
}

export function calculateEconomics(inputs: EconomicsInputs): EconomicsOutputs {
  const stakedNear = positive(inputs.stakedNear, 0);
  const nearPriceUsd = positive(inputs.nearPriceUsd, 0);
  const stakingApy = positive(inputs.stakingApyPercent, 0) / 100;
  const discount = positive(inputs.discountPercent, 100) / 100;
  const creditPriceUsd = positive(inputs.creditPriceUsd, 1);
  const secondsPerYear = DAYS_PER_YEAR * 24 * 60 * 60;

  const annualCreditsPerNear =
    (nearPriceUsd * stakingApy) / discount / creditPriceUsd;
  const monthlyCreditsPerNear = annualCreditsPerNear / 12;
  const monthlyCredits = stakedNear * monthlyCreditsPerNear;
  const creditsPerSecond =
    (stakedNear * annualCreditsPerNear) / secondsPerYear;
  const farmMonthlyEquivalentCredits = (creditsPerSecond * secondsPerYear) / 12;
  const farmRewardRatePerSecond = annualCreditsPerNear / secondsPerYear;
  const farmRewardRate = calculateFarmRewardRate(inputs);
  const creditsPerStakedNearNanoUsd =
    monthlyCreditsPerNear * creditPriceUsd * 1_000_000_000;

  return {
    annualCreditsPerNear,
    monthlyCreditsPerNear,
    monthlyCredits,
    creditsPerSecond,
    farmMonthlyEquivalentCredits,
    creditsPerStakedNearNanoUsd,
    farmRewardRate,
    farmRewardRatePerSecond,
  };
}

export function formatNumber(value: number, maximumFractionDigits = 6): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatFixed(value: number, fractionDigits = 8): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
