import { useState, useMemo } from "react";
import NumberField from "../components/Forms/NumberField.jsx";

function CalculatorPage() {
  const [amount, setAmount] = useState("");
  const [taxPercent, setTaxPercent] = useState("");

  const result = useMemo(() => {
    if (!amount || !taxPercent || amount <= 0 || taxPercent <= 0 || taxPercent >= 100) {
      return null;
    }

    const amountNum = Number(amount);
    const taxPercentNum = Number(taxPercent);
    const taxDecimal = taxPercentNum / 100;
    const transferAmount = amountNum / (1 - taxDecimal);
    const taxAmount = transferAmount - amountNum;

    return {
      transferAmount,
      taxAmount,
      finalAmount: amountNum,
    };
  }, [amount, taxPercent]);

  return (
    <div>
      <div className="page-header">
        <h2>Калькулятор перевода с налогом</h2>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Расчет суммы перевода</h3>
        
        <NumberField
          label="Сумма к получению"
          value={amount}
          onChange={setAmount}
          min={0}
          step={0.01}
        />

        <NumberField
          label="Процент налога (%)"
          value={taxPercent}
          onChange={setTaxPercent}
          min={0}
          max={99.99}
          step={0.01}
        />

        {result && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "var(--bg-tertiary)",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: "16px" }}>Результат расчета:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Сумма к переводу:</span>
                <strong style={{ fontSize: "18px", color: "var(--text-primary)" }}>
                  {result.transferAmount.toLocaleString("ru-RU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Налог ({taxPercent}%):</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {result.taxAmount.toLocaleString("ru-RU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
              >
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Итого к получению:</span>
                <strong style={{ fontSize: "20px", color: "var(--btn-primary)" }}>
                  {result.finalAmount.toLocaleString("ru-RU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            </div>
          </div>
        )}

        {amount && taxPercent && !result && (
          <div
            style={{
              marginTop: "24px",
              padding: "12px",
              background: "#fee2e2",
              borderRadius: "8px",
              color: "#991b1b",
            }}
          >
            Пожалуйста, введите корректные значения. Процент налога должен быть больше 0 и меньше 100.
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: "600px", marginTop: "16px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Как это работает?</h3>
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
          Калькулятор помогает определить, какую сумму нужно перевести, чтобы после вычета налога
          получатель получил нужную сумму. Например, если нужно, чтобы человек получил 100 000 рублей
          и при этом налог составляет 7%, калькулятор покажет, что нужно перевести 107 526.88 рублей.
        </p>
      </div>
    </div>
  );
}

export default CalculatorPage;

