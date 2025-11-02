'use client';

import { useMemo, useState } from "react";

import {
  type ConversionContext,
  buildConversionTable,
  convertValue,
  getUnitById
} from "@/lib/conversions";

interface ConversionCalculatorProps {
  fromUnitId: string;
  toUnitId: string;
}

export function ConversionCalculator({ fromUnitId, toUnitId }: ConversionCalculatorProps) {
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [inputValue, setInputValue] = useState<string>("1");

  const context = useMemo<ConversionContext | null>(() => {
    const from = getUnitById(fromUnitId);
    const to = getUnitById(toUnitId);

    if (!from || !to || from.kind !== to.kind) {
      return null;
    }

    return { from, to, kind: from.kind };
  }, [fromUnitId, toUnitId]);

  const parsedValue = Number.parseFloat(inputValue);
  const isValid = !Number.isNaN(parsedValue);

  const targetValue = useMemo(() => {
    if (!context || !isValid) {
      return NaN;
    }

    return convertValue(parsedValue, direction, context);
  }, [context, direction, parsedValue, isValid]);

  const table = useMemo(() => {
    if (!context) {
      return [];
    }
    const tableSeeds = direction === "forward" ? [1, 5, 10, 25, 50, 100] : [1, 10, 50, 100, 500];
    return buildConversionTable(tableSeeds, context, direction);
  }, [context, direction]);

  if (!context) {
    return (
      <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p>Interactive converter unavailable for this calculator.</p>
        <p className="text-red-600">
          We could not resolve compatible units for this experience. Please verify the slug
          follows the pattern `from-unit-to-unit-converter`.
        </p>
      </section>
    );
  }

  const fromUnit = direction === "forward" ? context.from : context.to;
  const toUnit = direction === "forward" ? context.to : context.from;

  const handleSwap = () => {
    setDirection((state) => (state === "forward" ? "reverse" : "forward"));
    setInputValue(Number.isFinite(parsedValue) ? parsedValue.toString() : "1");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Interactive Converter
          </h2>
          <p className="text-sm text-slate-500">
            Convert between {context.from.label.toLowerCase()} and{" "}
            {context.to.label.toLowerCase()} with precision rounding.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSwap}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
        >
          Swap units
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            {fromUnit.label} ({fromUnit.symbol})
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-lg font-semibold text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            {toUnit.label} ({toUnit.symbol})
          </span>
          <input
            type="text"
            readOnly
            value={isValid ? formatNumber(targetValue, toUnit.decimalPlaces) : "—"}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-lg font-semibold text-slate-900 shadow-sm"
          />
        </label>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick reference table
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">{fromUnit.label}</th>
                <th className="px-4 py-3">{toUnit.label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {table.map((row) => (
                <tr key={`${direction}-${row.input}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatNumber(row.input, fromUnit.decimalPlaces)} {fromUnit.symbol}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatNumber(row.output, toUnit.decimalPlaces)} {toUnit.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function formatNumber(value: number, decimals = 4) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
}
