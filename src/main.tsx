import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DAYS_PER_YEAR,
  type EconomicsInputs,
  calculateEconomics,
  formatFixed,
  formatNumber,
} from "./economics";
import "./styles.css";

const defaultInputs: EconomicsInputs = {
  stakedNear: 2000,
  nearPriceUsd: 2,
  stakingApyPercent: 4.5,
  discountPercent: 75,
  creditPriceUsd: 1,
};

const defaultInputValues = Object.fromEntries(
  Object.entries(defaultInputs).map(([key, value]) => [key, String(value)]),
) as Record<keyof EconomicsInputs, string>;

type NumericFieldProps = {
  label: string;
  value: string;
  suffix?: string;
  step?: string;
  min?: string;
  onChange: (value: string) => void;
};

function NumericField({
  label,
  value,
  suffix,
  step = "0.01",
  min = "0",
  onChange,
}: NumericFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <span>{suffix}</span> : null}
      </div>
    </label>
  );
}

function ResultRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="resultRow">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function App() {
  const [inputValues, setInputValues] = useState(defaultInputValues);
  const inputs = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(inputValues).map(([key, value]) => [
          key,
          value === "" ? 0 : Number(value),
        ]),
      ) as EconomicsInputs,
    [inputValues],
  );
  const outputs = useMemo(() => calculateEconomics(inputs), [inputs]);

  function setInput(key: keyof EconomicsInputs, value: string) {
    setInputValues((current) => ({ ...current, [key]: value }));
  }

  function resetDefaults() {
    setInputValues(defaultInputValues);
  }

  return (
    <main>
      <header className="appHeader">
        <div>
          <p className="eyebrow">NEAR AI Cloud</p>
          <h1>Staking Economics</h1>
        </div>
        <button type="button" onClick={resetDefaults}>
          Reset
        </button>
      </header>

      <section className="workspace">
        <form className="panel inputsPanel">
          <h2>Inputs</h2>
          <NumericField
            label="Staked NEAR"
            value={inputValues.stakedNear}
            step="1"
            onChange={(value) => setInput("stakedNear", value)}
          />
          <NumericField
            label="NEAR price"
            value={inputValues.nearPriceUsd}
            suffix="USD"
            onChange={(value) => setInput("nearPriceUsd", value)}
          />
          <NumericField
            label="Staking APY"
            value={inputValues.stakingApyPercent}
            suffix="%"
            onChange={(value) => setInput("stakingApyPercent", value)}
          />
          <NumericField
            label="Discount"
            value={inputValues.discountPercent}
            suffix="%"
            onChange={(value) => setInput("discountPercent", value)}
          />
          <div className="constantRow">
            <span>Days per year</span>
            <strong>{DAYS_PER_YEAR} days</strong>
          </div>
        </form>

        <section className="panel">
          <h2>Subscriptions (Agent Hosting)</h2>
          <ResultRow
            label="Monthly credits"
            value={formatNumber(outputs.monthlyCredits, 8)}
            note="credits issued for the entered stake amount"
          />
          <ResultRow
            label="Monthly credits per staked NEAR"
            value={formatNumber(outputs.monthlyCreditsPerNear, 10)}
          />
          <ResultRow
            label="Annual credits per staked NEAR"
            value={formatNumber(outputs.annualCreditsPerNear, 10)}
          />
        </section>

        <section className="panel">
          <h2>Staking Farm (NEAR AI Cloud)</h2>
          <ResultRow
            label="Monthly equivalent credits"
            value={formatNumber(outputs.farmMonthlyEquivalentCredits, 8)}
            note="for the entered stake amount"
          />
          <ResultRow
            label="Earned credits per second"
            value={formatFixed(outputs.creditsPerSecond, 12)}
            note="for the entered stake amount"
          />
          <ResultRow
            label="Earned credits per second per NEAR"
            value={formatFixed(outputs.farmRewardRatePerSecond, 15)}
          />
        </section>
      </section>

      <section className="formulaBand">
        <h2>Formula</h2>
        <code>
          monthly credits = staked NEAR * NEAR price * APY / 12 / discount /
          credit price
        </code>
        <code>
          earned credits per second = staked NEAR * NEAR price * APY / discount
          / credit price / seconds per year
        </code>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
