# staking-economics

NEAR staking economics calculator for House of Stake agent-hosting subscriptions
and the Private Inference staking farm.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

This repo is configured for GitHub Pages. Pushes to `main` build and publish the
app with GitHub Actions.

Published URL:

```text
https://think-in-universe.github.io/staking-economics/
```

## What It Calculates

- Monthly credits for agent-hosting subscriptions from staked NEAR.
- Monthly equivalent credits for a Private Inference staking farm position.
- Earned credits per second for the entered stake amount.
- Earned credits per second per staked NEAR.

The calculator assumes one credit is worth `$1.00`.

## Default Assumptions

- 2,000 staked NEAR
- $2.00 NEAR price
- 4.5% NEAR staking APY
- 75% discount
- $1.00 per credit fixed
- 365.25 days per year fixed

With these defaults, both subscription monthly credits and farm monthly
equivalent credits are `20`.

## Formula

```text
monthly credits =
  staked NEAR * NEAR price * APY / 12 / discount
```

```text
earned credits per second =
  staked NEAR * NEAR price * APY / discount / seconds per year
```
