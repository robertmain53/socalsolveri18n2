'use client';

import { useEffect, useMemo, useState } from "react";

import type {
  CalculatorConfig,
  CalculatorFormConfig,
  CalculatorFormField,
  CalculatorFormOutput,
  CalculatorLogicConfig,
  FormulaLogicConfig
} from "@/lib/calculator-config";

interface GenericSimpleCalculatorProps {
  config: CalculatorConfig | null;
}

interface CompiledOutput extends CalculatorFormOutput {
  evaluate: (variables: Record<string, number>) => number;
}

export function GenericSimpleCalculator({ config }: GenericSimpleCalculatorProps) {
  const form = config?.form;
  const logic = isFormulaLogic(config?.logic) ? (config?.logic ?? null) : null;

  if (!form || !logic) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Formula configuration required</h2>
        <p>
          Provide <code>form.fields</code>, <code>form.result.outputs</code>, and{" "}
          <code>logic.type = &quot;formula&quot;</code> with output expressions in{" "}
          <code>config_json</code> to enable the simple calculator experience.
        </p>
      </section>
    );
  }

  return <SimpleCalculatorForm form={form} logic={logic} />;
}

interface SimpleCalculatorFormProps {
  form: CalculatorFormConfig;
  logic: FormulaLogicConfig;
}

function SimpleCalculatorForm({ form, logic }: SimpleCalculatorFormProps) {
  const fieldsSource = form.fields;
  const fields = useMemo(
    () => (fieldsSource ? [...fieldsSource] : []),
    [fieldsSource]
  );
  const fieldIds = useMemo(() => fields.map((field) => field.id), [fields]);

  const initialValues = useMemo(() => {
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = field.defaultValue ?? "";
      return acc;
    }, {});
  }, [fields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const compiledOutputs = useMemo<CompiledOutput[]>(() => {
    return logic.outputs.map((output) => ({
      ...output,
      evaluate: compileExpression(output.expression, fieldIds)
    }));
  }, [logic.outputs, fieldIds]);

  const numericValues = useMemo<Record<string, number>>(() => {
    return fieldIds.reduce<Record<string, number>>((acc, id) => {
      const raw = values[id];
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        acc[id] = parsed;
      }
      return acc;
    }, {});
  }, [values, fieldIds]);

  const outputs = useMemo(() => {
    return compiledOutputs.map((output) => {
      const value = output.evaluate(numericValues);
      return {
        id: output.id,
        label: output.label,
        value,
        unit: output.unit,
        format: output.format
      };
    });
  }, [compiledOutputs, numericValues]);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.id} className="space-y-2">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            {renderInput(field, values[field.id] ?? "", (next) =>
              setValues((prev) => ({ ...prev, [field.id]: next }))
            )}
            {renderFieldMeta(field)}
          </label>
        ))}
      </div>

      {outputs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Results</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-600">{output.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {formatOutputValue(output.value, output.format, output.unit)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function renderInput(
  field: CalculatorFormField,
  value: string,
  onChange: (value: string) => void
) {
  if (field.type === "select" && field.options) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <option value="">Select...</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const inputType = field.type === "integer" ? "number" : "number";
  const step =
    field.step ??
    (field.type === "integer"
      ? 1
      : field.type === "percent"
        ? 0.01
        : field.type === "currency"
          ? 0.01
          : "any");

  return (
    <input
      type={inputType}
      inputMode="decimal"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      min={field.min}
      max={field.max}
      step={step}
      placeholder={field.placeholder}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
    />
  );
}

function renderFieldMeta(field: CalculatorFormField) {
  const hints: string[] = [];

  if (field.helpText) {
    hints.push(field.helpText);
  }
  if (field.placeholder) {
    hints.push(field.placeholder);
  }
  if (typeof field.min === "number") {
    hints.push(`Min ${field.min}`);
  }
  if (typeof field.max === "number") {
    hints.push(`Max ${field.max}`);
  }

  if (hints.length === 0) {
    return null;
  }

  return <p className="text-xs text-slate-500">{hints.join(" · ")}</p>;
}

function compileExpression(expression: string, fieldIds: string[]) {
  const uniqueFieldIds = Array.from(new Set(fieldIds));
  const helperEntries: Array<[string, unknown]> = [
    ["pow", Math.pow],
    ["min", Math.min],
    ["max", Math.max],
    ["abs", Math.abs],
    ["sqrt", Math.sqrt],
    ["log", Math.log],
    ["exp", Math.exp],
    ["Math", Math]
  ];
  const helperKeys = helperEntries.map(([key]) => key);

  try {
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      ...uniqueFieldIds,
      ...helperKeys,
      `"use strict"; return (${expression});`
    ) as (...args: unknown[]) => number;

    return (variables: Record<string, number>) => {
      const computedValues = uniqueFieldIds.map((id) => variables[id] ?? NaN);
      const helperValues = helperEntries.map(([, value]) => value);
      const args: unknown[] = [...computedValues, ...helperValues];
      try {
        const result = evaluator(...args);
        return typeof result === "number" && Number.isFinite(result) ? result : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

function formatOutputValue(value: number, format?: string, unit?: string) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (!format) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }

  switch (format) {
    case "currency": {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
      });
      return formatter.format(value);
    }
    case "percent": {
      return `${(value * 100).toFixed(2)}%`;
    }
    case "decimal": {
      return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    }
    case "integer": {
      return Math.round(value).toLocaleString("en-US");
    }
    default: {
      const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 4 });
      return unit ? `${formatted} ${unit}` : formatted;
    }
  }
}

function isFormulaLogic(
  logic: CalculatorLogicConfig | null | undefined
): logic is FormulaLogicConfig {
  if (!logic || logic.type !== "formula") {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(logic, "outputs") && Array.isArray((logic as FormulaLogicConfig).outputs);
}
