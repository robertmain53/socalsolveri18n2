'use client';

import { useEffect, useMemo, useState } from "react";

import type {
  AdvancedLogicConfig,
  AdvancedMethodConfig,
  CalculatorConfig,
  CalculatorFormField,
  CalculatorFormSection
} from "@/lib/calculator-config";

interface GenericAdvancedCalculatorProps {
  config: CalculatorConfig | null;
}

interface EvaluatedOutputs {
  variables: Record<string, number>;
  outputs: Array<{
    id: string;
    label: string;
    value: number;
    unit?: string;
    format?: string;
  }>;
}

const HELPER_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  sqrt: Math.sqrt,
  log: Math.log,
  exp: Math.exp
};

export function GenericAdvancedCalculator({ config }: GenericAdvancedCalculatorProps) {
  const rawLogic = config?.logic ?? null;
  const logic = useMemo<AdvancedLogicConfig | null>(() => {
    if (!rawLogic || rawLogic.type !== "advanced") {
      return null;
    }
    return rawLogic as AdvancedLogicConfig;
  }, [rawLogic]);

  const rawForm = config?.form ?? null;
  const formFields = rawForm?.fields;
  const formSections = rawForm?.sections;

  const baseFields = useMemo<CalculatorFormField[]>(
    () => (formFields ? [...formFields] : []),
    [formFields]
  );
  const sections = useMemo<CalculatorFormSection[]>(
    () => (formSections ? [...formSections] : []),
    [formSections]
  );

  const fieldMap = useMemo(() => {
    const map = new Map<string, CalculatorFormField>();
    baseFields.forEach((field) => map.set(field.id, field));
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        map.set(field.id, field);
      });
    });
    return map;
  }, [baseFields, sections]);

  const allFields = useMemo(() => Array.from(fieldMap.values()), [fieldMap]);

  const methods = useMemo<AdvancedMethodConfig[]>(() => {
    if (!logic) {
      return [];
    }
    return [...logic.methods];
  }, [logic]);

  const defaultMethodId = useMemo(() => {
    if (!logic || logic.methods.length === 0) {
      return "";
    }

    const fallback = logic.methods[0]?.id ?? "";
    const candidate = logic.defaultMethod ?? fallback;
    return logic.methods.some((method) => method.id === candidate) ? candidate : fallback;
  }, [logic]);

  const [activeMethodId, setActiveMethodId] = useState<string>(defaultMethodId);

  useEffect(() => {
    setActiveMethodId(defaultMethodId);
  }, [defaultMethodId]);

  const activeMethod = useMemo<AdvancedMethodConfig | null>(() => {
    if (!methods.length) {
      return null;
    }
    return methods.find((method) => method.id === activeMethodId) ?? methods[0] ?? null;
  }, [methods, activeMethodId]);

  const initialValues = useMemo(() => {
    return allFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = field.defaultValue ?? "";
      return acc;
    }, {});
  }, [allFields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const numericValues = useMemo<Record<string, number>>(() => {
    return Object.entries(values).reduce<Record<string, number>>((acc, [id, raw]) => {
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        acc[id] = parsed;
      }
      return acc;
    }, {});
  }, [values]);

  const evaluation = useMemo<EvaluatedOutputs>(() => {
    if (!activeMethod) {
      return { variables: {}, outputs: [] };
    }
    return evaluateAdvancedMethod(activeMethod, numericValues);
  }, [activeMethod, numericValues]);

  if (!logic || methods.length === 0) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Advanced calculator configuration required</h2>
        <p>
          Provide <code>component_type = &quot;advanced_calc&quot;</code>,{" "}
          <code>logic.type = &quot;advanced&quot;</code>, and structured{" "}
          <code>form.fields</code>/<code>form.sections</code> inside <code>config_json</code> to
          enable this experience.
        </p>
      </section>
    );
  }

  if (!activeMethod) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Unable to render calculator</h2>
        <p>Advanced configuration must include at least one method.</p>
      </section>
    );
  }

  return (
    <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
      {methods.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="advanced-method-select">
            Calculation method
          </label>
          <select
            id="advanced-method-select"
            value={activeMethod.id}
            onChange={(event) => setActiveMethodId(event.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeMethod.description && (
        <p className="text-sm text-slate-600">{activeMethod.description}</p>
      )}

      {baseFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Core inputs
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {baseFields.map((field) => renderField(field, values, setValues))}
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-6">
          {sections.map((section) => {
            if (!shouldShowSection(section, values)) {
              return null;
            }
            return (
              <div key={section.id} className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {section.label}
                  </h3>
                  {section.description && (
                    <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => renderField(field, values, setValues))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {evaluation.outputs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Results
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {evaluation.outputs.map((output) => (
              <div
                key={`${activeMethod.id}_${output.id}`}
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

      {evaluation.outputs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Enter input values to see calculated results.
        </div>
      )}
    </section>
  );
}

function renderField(
  field: CalculatorFormField,
  values: Record<string, string>,
  setValues: (updater: (prev: Record<string, string>) => Record<string, string>) => void
) {
  return (
    <label key={field.id} className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      {renderInput(field, values[field.id] ?? "", (next) =>
        setValues((prev) => ({ ...prev, [field.id]: next }))
      )}
      {renderFieldMeta(field)}
    </label>
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
        {!field.required && <option value="">Select...</option>}
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

function shouldShowSection(section: CalculatorFormSection, values: Record<string, string>) {
  if (!section.showWhen) {
    return true;
  }

  const targetValue = values[section.showWhen.field] ?? "";

  if (section.showWhen.equals !== undefined) {
    return targetValue === section.showWhen.equals;
  }

  if (section.showWhen.in) {
    return section.showWhen.in.includes(targetValue);
  }

  return true;
}

function evaluateAdvancedMethod(
  method: AdvancedMethodConfig,
  numericInputs: Record<string, number>
): EvaluatedOutputs {
  const variables: Record<string, number> = {};
  const evaluating = new Set<string>();

  const baseScope: Record<string, unknown> = { Math };
  Object.entries(numericInputs).forEach(([key, value]) => {
    baseScope[key] = value;
  });
  Object.entries(HELPER_FUNCTIONS).forEach(([key, fn]) => {
    baseScope[key] = fn;
  });

  const computeVariable = (variableId: string): number => {
    if (variables[variableId] !== undefined) {
      return variables[variableId];
    }

    const variableConfig = method.variables[variableId];
    if (!variableConfig) {
      return Number.NaN;
    }

    if (evaluating.has(variableId)) {
      return Number.NaN;
    }

    evaluating.add(variableId);

    const scope: Record<string, unknown> = {
      ...baseScope,
      ...variables
    };

    if (Array.isArray(variableConfig.dependencies)) {
      variableConfig.dependencies.forEach((dependency) => {
        if (!(dependency in scope)) {
          if (dependency in numericInputs) {
            scope[dependency] = numericInputs[dependency];
          } else {
            scope[dependency] = computeVariable(dependency);
          }
        }
      });
    }

    const value = evaluateExpression(variableConfig.expression, scope);
    variables[variableId] = value;
    evaluating.delete(variableId);
    return value;
  };

  Object.keys(method.variables).forEach((variableId) => {
    if (variables[variableId] === undefined) {
      computeVariable(variableId);
    }
  });

  const outputs = method.outputs.map((output) => {
    const value =
      variables[output.variable] ?? numericInputs[output.variable] ?? Number.NaN;
    return {
      id: output.id,
      label: output.label,
      value,
      unit: output.unit,
      format: output.format
    };
  });

  return { variables, outputs };
}

function evaluateExpression(expression: string, scope: Record<string, unknown>): number {
  const keys = Object.keys(scope);
  const values = keys.map((key) => scope[key]);

  try {
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      ...keys,
      `"use strict"; return (${expression});`
    ) as (...args: unknown[]) => number;

    const result = evaluator(...values);
    return typeof result === "number" && Number.isFinite(result) ? result : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

function formatOutputValue(value: number, format?: string, unit?: string) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (!format) {
    const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return unit ? `${formatted} ${unit}` : formatted;
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
