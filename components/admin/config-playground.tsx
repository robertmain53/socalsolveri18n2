'use client';

import { useEffect, useMemo, useState } from "react";

import {
  type CalculatorComponentType,
  validateCalculatorConfig
} from "@/lib/calculator-config";

import { GenericAdvancedCalculator } from "@/components/generic-advanced-calculator";
import { GenericConverter } from "@/components/generic-converter";
import { GenericSimpleCalculator } from "@/components/generic-simple-calculator";

const SAMPLE_CONFIG = `{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "Meters to Feet Converter",
      "description": "Convert meters to feet with precision and see worked examples."
    },
    "logic": {
      "type": "conversion",
      "fromUnitId": "meter",
      "toUnitId": "foot"
    },
    "form": {
      "fields": [
        {
          "id": "value",
          "label": "Meters",
          "type": "number",
          "default": 1,
          "min": 0
        }
      ]
    },
    "page_content": {
      "introduction": [
        "Convert meters to feet instantly with engineering-grade precision."
      ]
    },
    "links": {
      "internal": [
        "/conversions/length/meters-to-centimeters-converter"
      ]
    }
  }
}`;

export function ConfigPlayground() {
  const [rawConfig, setRawConfig] = useState<string>(SAMPLE_CONFIG);
  const [componentType, setComponentType] = useState<CalculatorComponentType>("converter");

  const parsedInput = useMemo(() => {
    try {
      const json = JSON.parse(rawConfig);
      if (json && typeof json === "object" && "config_json" in json) {
        const configJson = JSON.stringify(json.config_json, null, 2);
        const detectedType =
          typeof json.component_type === "string"
            ? (json.component_type as CalculatorComponentType)
            : null;
        return { configText: configJson, detectedType };
      }
    } catch {
      // fall through
    }

    return { configText: rawConfig, detectedType: null as CalculatorComponentType | null };
  }, [rawConfig]);

  useEffect(() => {
    if (parsedInput.detectedType && parsedInput.detectedType !== componentType) {
      setComponentType(parsedInput.detectedType);
    }
  }, [parsedInput.detectedType, componentType]);

  const validation = useMemo(
    () => validateCalculatorConfig(parsedInput.configText, "playground"),
    [parsedInput.configText]
  );
  const validationErrors = validation.errors;
  const parsedConfig = validation.config;

  const inferredComponentType = useMemo<CalculatorComponentType | null>(() => {
    if (!parsedConfig || !parsedConfig.logic) {
      return null;
    }
    if (parsedConfig.logic.type === "conversion") {
      return "converter";
    }
    if (parsedConfig.logic.type === "formula") {
      return "simple_calc";
    }
    if (parsedConfig.logic.type === "advanced") {
      return "advanced_calc";
    }
    return null;
  }, [parsedConfig]);

  const activeComponentType = inferredComponentType ?? componentType;

  const preview = useMemo(() => {
    if (!parsedConfig || validationErrors.length > 0) {
      return null;
    }

    switch (activeComponentType) {
      case "converter":
        return <GenericConverter config={parsedConfig} />;
      case "simple_calc":
        return <GenericSimpleCalculator config={parsedConfig} />;
      case "advanced_calc":
        return <GenericAdvancedCalculator config={parsedConfig} />;
      default:
        return null;
    }
  }, [activeComponentType, parsedConfig, validationErrors.length]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Select component type
            <select
              value={componentType}
              onChange={(event) => setComponentType(event.target.value as CalculatorComponentType)}
              className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="converter">converter</option>
              <option value="simple_calc">simple_calc</option>
              <option value="advanced_calc">advanced_calc</option>
            </select>
          </label>
          {inferredComponentType && (
            <p className="text-xs text-slate-500">
              Inferred from config: <span className="font-medium">{inferredComponentType}</span>
            </p>
          )}
        </div>
        <textarea
          value={rawConfig}
          onChange={(event) => setRawConfig(event.target.value)}
          spellCheck={false}
          className="h-[540px] w-full rounded-xl border border-slate-300 bg-slate-900 font-mono text-sm text-slate-100 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {validationErrors.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <h2 className="font-semibold">Validation errors</h2>
            <ul className="list-disc space-y-1 pl-5">
              {validationErrors.map((error, index) => (
                <li key={`error-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Config validated successfully. Paste this JSON into the CSV once the review is
            complete.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Paste either the entire JSON object (with <code>component_type</code> +
            <code>config_json</code>) or the inner <code>config_json</code>. Validation runs
            automatically as you type.
          </p>
        </div>
        <div className="space-y-4">
          {preview ?? (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm shadow-slate-200">
              <h2 className="text-base font-semibold text-slate-800">Awaiting valid config</h2>
              <p>Fix validation errors to render the interactive preview.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
