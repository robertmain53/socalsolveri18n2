'use client';

import type { CalculatorConfig, ConversionLogicConfig } from "@/lib/calculator-config";

import { ConversionCalculator } from "@/components/conversion-calculator";

interface GenericConverterProps {
  config: CalculatorConfig | null;
}

export function GenericConverter({ config }: GenericConverterProps) {
  const conversionLogic = getConversionLogic(config);

  if (!conversionLogic) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Converter configuration required</h2>
        <p>
          Provide <code>logic.type = &quot;conversion&quot;</code> with <code>fromUnitId</code> and{" "}
          <code>toUnitId</code> inside <code>config_json</code> to enable the interactive
          experience.
        </p>
      </section>
    );
  }

  return (
    <ConversionCalculator
      fromUnitId={conversionLogic.fromUnitId}
      toUnitId={conversionLogic.toUnitId}
    />
  );
}

function getConversionLogic(config: CalculatorConfig | null): ConversionLogicConfig | null {
  if (!config) {
    return null;
  }
  const logic = config.logic;
  return isConversionLogic(logic) ? logic : null;
}

function isConversionLogic(
  logic: CalculatorConfig["logic"] | null | undefined
): logic is ConversionLogicConfig {
  return Boolean(
    logic &&
    logic.type === "conversion" &&
    "fromUnitId" in logic &&
    "toUnitId" in logic
  );
}
