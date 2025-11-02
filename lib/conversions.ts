export type UnitKind = "length" | "weight" | "temperature" | "volume" | "area";

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  kind: UnitKind;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  decimalPlaces?: number;
}

export interface ConversionContext {
  from: UnitDefinition;
  to: UnitDefinition;
  kind: UnitKind;
}

const units: Record<string, UnitDefinition> = {
  meter: {
    id: "meter",
    label: "Meter",
    symbol: "m",
    kind: "length",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  kilometer: {
    id: "kilometer",
    label: "Kilometer",
    symbol: "km",
    kind: "length",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 4
  },
  foot: {
    id: "foot",
    label: "Foot",
    symbol: "ft",
    kind: "length",
    toBase: (value) => value * 0.3048,
    fromBase: (value) => value / 0.3048,
    decimalPlaces: 4
  },
  inch: {
    id: "inch",
    label: "Inch",
    symbol: "in",
    kind: "length",
    toBase: (value) => value * 0.0254,
    fromBase: (value) => value / 0.0254,
    decimalPlaces: 4
  },
  centimeter: {
    id: "centimeter",
    label: "Centimeter",
    symbol: "cm",
    kind: "length",
    toBase: (value) => value / 100,
    fromBase: (value) => value * 100,
    decimalPlaces: 4
  },
  millimeter: {
    id: "millimeter",
    label: "Millimeter",
    symbol: "mm",
    kind: "length",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  yard: {
    id: "yard",
    label: "Yard",
    symbol: "yd",
    kind: "length",
    toBase: (value) => value * 0.9144,
    fromBase: (value) => value / 0.9144,
    decimalPlaces: 4
  },
  mile: {
    id: "mile",
    label: "Mile",
    symbol: "mi",
    kind: "length",
    toBase: (value) => value * 1609.344,
    fromBase: (value) => value / 1609.344,
    decimalPlaces: 4
  },
  gram: {
    id: "gram",
    label: "Gram",
    symbol: "g",
    kind: "weight",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  kilogram: {
    id: "kilogram",
    label: "Kilogram",
    symbol: "kg",
    kind: "weight",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  pound: {
    id: "pound",
    label: "Pound",
    symbol: "lb",
    kind: "weight",
    toBase: (value) => value * 0.45359237,
    fromBase: (value) => value / 0.45359237,
    decimalPlaces: 4
  },
  ounce: {
    id: "ounce",
    label: "Ounce",
    symbol: "oz",
    kind: "weight",
    toBase: (value) => value * 0.0283495231,
    fromBase: (value) => value / 0.0283495231,
    decimalPlaces: 4
  },
  stone: {
    id: "stone",
    label: "Stone",
    symbol: "st",
    kind: "weight",
    toBase: (value) => value * 6.35029318,
    fromBase: (value) => value / 6.35029318,
    decimalPlaces: 4
  },
  liter: {
    id: "liter",
    label: "Liter",
    symbol: "L",
    kind: "volume",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  milliliter: {
    id: "milliliter",
    label: "Milliliter",
    symbol: "mL",
    kind: "volume",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  gallon: {
    id: "gallon",
    label: "US Gallon",
    symbol: "gal",
    kind: "volume",
    toBase: (value) => value * 3.785411784,
    fromBase: (value) => value / 3.785411784,
    decimalPlaces: 4
  },
  quart: {
    id: "quart",
    label: "US Quart",
    symbol: "qt",
    kind: "volume",
    toBase: (value) => value * 0.946352946,
    fromBase: (value) => value / 0.946352946,
    decimalPlaces: 4
  },
  celsius: {
    id: "celsius",
    label: "Celsius",
    symbol: "°C",
    kind: "temperature",
    toBase: (value) => value + 273.15,
    fromBase: (value) => value - 273.15,
    decimalPlaces: 2
  },
  fahrenheit: {
    id: "fahrenheit",
    label: "Fahrenheit",
    symbol: "°F",
    kind: "temperature",
    toBase: (value) => ((value - 32) * 5) / 9 + 273.15,
    fromBase: (value) => ((value - 273.15) * 9) / 5 + 32,
    decimalPlaces: 2
  },
  kelvin: {
    id: "kelvin",
    label: "Kelvin",
    symbol: "K",
    kind: "temperature",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  square_meter: {
    id: "square_meter",
    label: "Square Meter",
    symbol: "m²",
    kind: "area",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  square_foot: {
    id: "square_foot",
    label: "Square Foot",
    symbol: "ft²",
    kind: "area",
    toBase: (value) => value * 0.09290304,
    fromBase: (value) => value / 0.09290304,
    decimalPlaces: 4
  },
  acre: {
    id: "acre",
    label: "Acre",
    symbol: "ac",
    kind: "area",
    toBase: (value) => value * 4046.8564224,
    fromBase: (value) => value / 4046.8564224,
    decimalPlaces: 4
  },
  hectare: {
    id: "hectare",
    label: "Hectare",
    symbol: "ha",
    kind: "area",
    toBase: (value) => value * 10000,
    fromBase: (value) => value / 10000,
    decimalPlaces: 4
  }
};

const aliasToUnitId: Record<string, string> = {
  meter: "meter",
  meters: "meter",
  metre: "meter",
  metres: "meter",
  m: "meter",
  kilometre: "kilometer",
  kilometres: "kilometer",
  kilometer: "kilometer",
  kilometers: "kilometer",
  km: "kilometer",
  foot: "foot",
  feet: "foot",
  ft: "foot",
  inch: "inch",
  inches: "inch",
  in: "inch",
  centimeter: "centimeter",
  centimeters: "centimeter",
  centimetre: "centimeter",
  centimetres: "centimeter",
  cm: "centimeter",
  millimeter: "millimeter",
  millimeters: "millimeter",
  millimetre: "millimeter",
  millimetres: "millimeter",
  mm: "millimeter",
  yard: "yard",
  yards: "yard",
  yd: "yard",
  mile: "mile",
  miles: "mile",
  mi: "mile",
  gram: "gram",
  grams: "gram",
  g: "gram",
  kilogram: "kilogram",
  kilograms: "kilogram",
  kilogramme: "kilogram",
  kilogrammes: "kilogram",
  kg: "kilogram",
  pound: "pound",
  pounds: "pound",
  lb: "pound",
  lbs: "pound",
  ounce: "ounce",
  ounces: "ounce",
  oz: "ounce",
  stone: "stone",
  stones: "stone",
  liter: "liter",
  liters: "liter",
  litre: "liter",
  litres: "liter",
  l: "liter",
  milliliter: "milliliter",
  milliliters: "milliliter",
  millilitre: "milliliter",
  millilitres: "milliliter",
  ml: "milliliter",
  gallon: "gallon",
  gallons: "gallon",
  gal: "gallon",
  quart: "quart",
  quarts: "quart",
  qt: "quart",
  celsius: "celsius",
  "degrees celsius": "celsius",
  celcius: "celsius",
  "degrees celcius": "celsius",
  fahrenheit: "fahrenheit",
  "degrees fahrenheit": "fahrenheit",
  kelvin: "kelvin",
  kelvins: "kelvin",
  squaremeter: "square_meter",
  squaremeters: "square_meter",
  sqm: "square_meter",
  "square metre": "square_meter",
  "square meter": "square_meter",
  "square meters": "square_meter",
  "square metres": "square_meter",
  squarefoot: "square_foot",
  squarefeet: "square_foot",
  "square foot": "square_foot",
  "square feet": "square_foot",
  sqft: "square_foot",
  acre: "acre",
  acres: "acre",
  hectare: "hectare",
  hectares: "hectare",
  ha: "hectare"
};

const slugSuffixes = ["-converter", "-calculator", "-conversion"];

export function getUnitById(id: string): UnitDefinition | undefined {
  return units[id];
}

export function resolveUnit(token: string): UnitDefinition | undefined {
  const normalized = normalizeToken(token);
  const direct = aliasToUnitId[normalized];
  if (direct) {
    return units[direct];
  }

  const collapsed = normalized.replace(/\s+/g, "");
  const collapsedMatch = aliasToUnitId[collapsed];
  if (collapsedMatch) {
    return units[collapsedMatch];
  }

  return undefined;
}

export function parseConversionFromSlug(slug: string): ConversionContext | null {
  const candidates = extractUnitTokens(slug);
  if (!candidates) {
    return null;
  }

  const fromUnit = resolveUnit(candidates.from);
  const toUnit = resolveUnit(candidates.to);

  if (!fromUnit || !toUnit) {
    return null;
  }

  if (fromUnit.kind !== toUnit.kind) {
    return null;
  }

  return {
    from: fromUnit,
    to: toUnit,
    kind: fromUnit.kind
  };
}

export function convertValue(
  value: number,
  direction: "forward" | "reverse",
  context: ConversionContext
) {
  if (Number.isNaN(value)) {
    return NaN;
  }

  if (direction === "forward") {
    const base = context.from.toBase(value);
    return context.to.fromBase(base);
  }

  const base = context.to.toBase(value);
  return context.from.fromBase(base);
}

export interface ConversionTableRow {
  input: number;
  output: number;
}

export function buildConversionTable(
  seeds: number[],
  context: ConversionContext,
  direction: "forward" | "reverse" = "forward"
): ConversionTableRow[] {
  return seeds.map((seed) => ({
    input: seed,
    output: convertValue(seed, direction, context)
  }));
}

function extractUnitTokens(slug: string): { from: string; to: string } | null {
  const sanitized = slugSuffixes.reduce(
    (value, suffix) => value.replace(new RegExp(`${suffix}$`), ""),
    slug
  );

  const match = sanitized.match(/(.+?)-to-(.+)/);
  if (!match) {
    return null;
  }

  return {
    from: match[1],
    to: match[2]
  };
}

function normalizeToken(token: string) {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
