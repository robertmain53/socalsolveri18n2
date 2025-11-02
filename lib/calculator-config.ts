type Primitive = string | number | boolean | null;

export type CalculatorComponentType = "converter" | "simple_calc" | "advanced_calc";

export interface CalculatorConfig {
  version: string | null;
  metadata: MetadataConfig | null;
  form: CalculatorFormConfig | null;
  logic: CalculatorLogicConfig | null;
  pageContent: PageContentConfig | null;
  schema: SchemaConfig | null;
  links: LinkConfig | null;
}

export interface MetadataConfig {
  title?: string;
  description?: string;
}

export interface CalculatorFormConfig {
  fields: CalculatorFormField[];
  sections: CalculatorFormSection[];
  result: CalculatorFormResultConfig | null;
}

export interface CalculatorFormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
}

export interface CalculatorFormSection {
  id: string;
  label: string;
  description?: string;
  showWhen?: ShowWhenConfig | null;
  fields: CalculatorFormField[];
}

export interface ShowWhenConfig {
  field: string;
  equals?: string;
  in?: string[];
}

export interface CalculatorFormResultConfig {
  outputs: CalculatorFormOutput[];
}

export interface CalculatorFormOutput {
  id: string;
  label: string;
  unit?: string;
  format?: string;
}

export type CalculatorLogicConfig =
  | ConversionLogicConfig
  | FormulaLogicConfig
  | AdvancedLogicConfig
  | GenericLogicConfig
  | null;

export interface ConversionLogicConfig {
  type: "conversion";
  fromUnitId: string;
  toUnitId: string;
}

export interface FormulaLogicConfig {
  type: "formula";
  outputs: Array<{
    id: string;
    label: string;
    expression: string;
    unit?: string;
    format?: string;
  }>;
}

export interface AdvancedLogicConfig {
  type: "advanced";
  defaultMethod: string;
  methods: AdvancedMethodConfig[];
}

export interface AdvancedMethodConfig {
  id: string;
  label: string;
  description?: string;
  formula?: string;
  variables: Record<string, AdvancedVariableConfig>;
  outputs: AdvancedOutputConfig[];
}

export interface AdvancedVariableConfig {
  expression: string;
  dependencies?: string[];
  label?: string;
  unit?: string;
  format?: string;
  display?: boolean;
}

export interface AdvancedOutputConfig {
  id: string;
  label: string;
  variable: string;
  unit?: string;
  format?: string;
}

export interface GenericLogicConfig {
  type: string;
  data: Record<string, unknown>;
}

export interface PageContentConfig {
  introduction?: string[];
  methodology?: string[];
  examples?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  citations?: Array<{ label?: string; text?: string; url: string }>;
  glossary?: Array<{ term: string; definition: string }>;
  summary?: string[];
}

export interface SchemaConfig {
  additionalTypes?: string[];
}

export interface LinkConfig {
  internal?: string[];
  external?: Array<{ url: string; label?: string; rel?: string[] }>;
}

interface ValidationResult {
  config: CalculatorConfig | null;
  errors: string[];
}

const ALLOWED_TOP_LEVEL_KEYS = new Set([
  "version",
  "metadata",
  "form",
  "logic",
  "calculator_logic",
  "pageContent",
  "page_content",
  "schema",
  "links",
  "seo_links"
]);

const ALLOWED_PAGE_CONTENT_KEYS = new Set([
  "introduction",
  "methodology",
  "examples",
  "faqs",
  "citations",
  "glossary",
  "summary"
]);

export function parseCalculatorConfig(raw: string, context: string): CalculatorConfig {
  const { config, errors } = validateCalculatorConfig(raw, context);
  if (errors.length > 0 || !config) {
    throw new Error(errors.join("; "));
  }
  return config;
}

export function validateCalculatorConfig(raw: string, context: string): ValidationResult {
  const errors: string[] = [];

  if (!raw || !raw.trim()) {
    return { config: null, errors: [`${context}: config_json cannot be empty`] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      config: null,
      errors: [`${context}: config_json is not valid JSON (${(error as Error).message})`]
    };
  }

  if (!isPlainObject(parsed)) {
    return {
      config: null,
      errors: [`${context}: config_json must be a JSON object`]
    };
  }

  const parsedRecord = parsed as Record<string, unknown>;

  const topLevelKeys = Object.keys(parsedRecord);
  const unsupportedKeys = topLevelKeys.filter((key) => !ALLOWED_TOP_LEVEL_KEYS.has(key));
  if (unsupportedKeys.length > 0) {
    errors.push(
      `${context}: unsupported top-level keys: ${unsupportedKeys
        .map((key) => `"${key}"`)
        .join(", ")}`
    );
  }

  const version = parseVersion(parsedRecord.version, context, errors);
  const metadata = parseMetadata(parsedRecord.metadata, context, errors);
  const logic = parseLogic(parsedRecord, context, errors);
  const form = parseForm(parsedRecord.form, context, errors);
  const pageContent = parsePageContent(parsedRecord, context, errors);
  const schema = parseSchema(parsedRecord.schema, context, errors);
  const links = parseLinks(parsedRecord, context, errors);

  if (errors.length > 0) {
    return { config: null, errors };
  }

  return {
    config: {
      version,
      metadata,
      logic,
      form,
      pageContent,
      schema,
      links
    },
    errors
  };
}

function parseVersion(version: unknown, context: string, errors: string[]): string | null {
  if (version === undefined || version === null) {
    return null;
  }

  if (typeof version === "string") {
    return version.trim();
  }

  if (typeof version === "number") {
    return Number.isFinite(version) ? version.toString() : null;
  }

  errors.push(`${context}: version must be a string or number`);
  return null;
}

function parseMetadata(metadata: unknown, context: string, errors: string[]): MetadataConfig | null {
  if (metadata === undefined || metadata === null) {
    return null;
  }

  if (!isPlainObject(metadata)) {
    errors.push(`${context}: metadata must be an object`);
    return null;
  }

  const result: MetadataConfig = {};

  if (metadata.title !== undefined) {
    if (typeof metadata.title === "string") {
      assertNoHtml(metadata.title, `${context}: metadata.title`, errors);
      result.title = metadata.title.trim();
    } else {
      errors.push(`${context}: metadata.title must be a string`);
    }
  }

  if (metadata.description !== undefined) {
    if (typeof metadata.description === "string") {
      assertNoHtml(metadata.description, `${context}: metadata.description`, errors);
      result.description = metadata.description.trim();
    } else {
      errors.push(`${context}: metadata.description must be a string`);
    }
  }

  return result;
}

function parseLogic(
  parsed: Record<string, unknown>,
  context: string,
  errors: string[]
): CalculatorLogicConfig {
  const logicCandidate =
    ("logic" in parsed ? parsed.logic : undefined) ??
    ("calculator_logic" in parsed ? parsed.calculator_logic : undefined);

  if (logicCandidate === undefined || logicCandidate === null) {
    return null;
  }

  if (!isPlainObject(logicCandidate)) {
    errors.push(`${context}: logic must be an object`);
    return null;
  }

  const rawType = logicCandidate.type;
  let type: string | undefined;

  if (typeof rawType === "string" && rawType.trim() !== "") {
    type = rawType.trim().toLowerCase();
  } else if ("fromUnitId" in logicCandidate && "toUnitId" in logicCandidate) {
    type = "conversion";
  }

  if (type === "advanced_calc") {
    type = "advanced";
  }

  if (!type) {
    errors.push(`${context}: logic.type is required`);
    return null;
  }

  if (type === "conversion" || type === "converter") {
    const fromUnitId = getStringProperty(logicCandidate, "fromUnitId");
    const toUnitId = getStringProperty(logicCandidate, "toUnitId");

    if (!fromUnitId || !toUnitId) {
      errors.push(`${context}: conversion logic requires fromUnitId and toUnitId`);
      return null;
    }

    return {
      type: "conversion",
      fromUnitId,
      toUnitId
    };
  }

  if (type === "formula") {
    const outputsCandidate = logicCandidate.outputs;
    if (!Array.isArray(outputsCandidate) || outputsCandidate.length === 0) {
      errors.push(`${context}: formula logic requires an outputs array`);
      return null;
    }

    const outputs: FormulaLogicConfig["outputs"] = [];

    outputsCandidate.forEach((item, index) => {
      if (!isPlainObject(item)) {
        errors.push(`${context}: formula logic outputs[${index}] must be an object`);
        return;
      }

      const id = getStringProperty(item, "id");
      const label = getStringProperty(item, "label");
      const expression = getStringProperty(item, "expression");

      if (!id || !label || !expression) {
        errors.push(
          `${context}: formula logic outputs[${index}] requires id, label, and expression`
        );
        return;
      }

      assertNoHtml(label, `${context}: formula logic outputs[${index}].label`, errors);
      outputs.push({
        id,
        label,
        expression,
        unit: getOptionalString(item, "unit"),
        format: getOptionalString(item, "format")
      });
    });

    if (outputs.length === 0) {
      errors.push(`${context}: formula logic must define at least one valid output`);
      return null;
    }

    return { type: "formula", outputs };
  }

  if (type === "multi_method" || type === "advanced") {
    const methodsCandidate = logicCandidate.methods;
    if (!isPlainObject(methodsCandidate)) {
      errors.push(`${context}: advanced logic requires a methods object`);
      return null;
    }

    const methods: AdvancedMethodConfig[] = [];

    for (const [methodId, methodCandidate] of Object.entries(methodsCandidate)) {
      if (!isPlainObject(methodCandidate)) {
        errors.push(`${context}: logic.methods["${methodId}"] must be an object`);
        continue;
      }

      const label =
        getOptionalString(methodCandidate, "label") ?? startCaseFromId(methodId);
      const description = getOptionalString(methodCandidate, "description");
      const formulaVar = getOptionalString(methodCandidate, "formula");

      const variablesCandidate = methodCandidate.variables;
      if (!isPlainObject(variablesCandidate) || Object.keys(variablesCandidate).length === 0) {
        errors.push(`${context}: logic.methods["${methodId}"].variables must be an object`);
        continue;
      }

      const variables: Record<string, AdvancedVariableConfig> = {};
      for (const [variableId, variableCandidate] of Object.entries(variablesCandidate)) {
        if (
          !isPlainObject(variableCandidate) &&
          typeof variableCandidate !== "string"
        ) {
          errors.push(
            `${context}: logic.methods["${methodId}"].variables["${variableId}"] must be an object or expression string`
          );
          continue;
        }

        let expression: string | null = null;
        if (typeof variableCandidate === "string") {
          expression = variableCandidate;
        } else if (typeof variableCandidate.expression === "string") {
          expression = variableCandidate.expression;
        }

        if (!expression) {
          errors.push(
            `${context}: logic.methods["${methodId}"].variables["${variableId}"] requires an expression`
          );
          continue;
        }

        const dependencies: string[] | undefined = Array.isArray(
          (variableCandidate as Record<string, unknown>).dependencies
        )
          ? ((variableCandidate as Record<string, unknown>).dependencies as unknown[]).flatMap((item, depIndex) => {
              if (typeof item === "string" && item.trim() !== "") {
                return item.trim();
              }
              errors.push(
                `${context}: logic.methods["${methodId}"].variables["${variableId}"].dependencies[${depIndex}] must be a string`
              );
              return [];
            })
          : undefined;

        const labelOverride = getOptionalString(
          variableCandidate as Record<string, unknown>,
          "label"
        );
        const unit = getOptionalString(variableCandidate as Record<string, unknown>, "unit");
        const format = getOptionalString(
          variableCandidate as Record<string, unknown>,
          "format"
        );
        const display =
          typeof (variableCandidate as Record<string, unknown>).display === "boolean"
            ? Boolean((variableCandidate as Record<string, unknown>).display)
            : false;

        variables[variableId] = {
          expression,
          dependencies,
          label: labelOverride ?? undefined,
          unit: unit ?? undefined,
          format: format ?? undefined,
          display
        };
      }

      if (Object.keys(variables).length === 0) {
        errors.push(`${context}: logic.methods["${methodId}"] must define at least one variable`);
        continue;
      }

      const outputs: AdvancedOutputConfig[] = [];
      if (Array.isArray(methodCandidate.outputs)) {
        methodCandidate.outputs.forEach((outputCandidate: unknown, outputIndex: number) => {
          if (!isPlainObject(outputCandidate)) {
            errors.push(
              `${context}: logic.methods["${methodId}"].outputs[${outputIndex}] must be an object`
            );
            return;
          }

          const outputId = getStringProperty(outputCandidate, "id");
          const outputLabel =
            getStringProperty(outputCandidate, "label") ??
            startCaseFromId(outputId ?? `output_${outputIndex}`);
          const variableRef =
            getStringProperty(outputCandidate, "variable") ??
            getStringProperty(outputCandidate, "value");

          if (!outputId || !variableRef) {
            errors.push(
              `${context}: logic.methods["${methodId}"].outputs[${outputIndex}] requires id and variable`
            );
            return;
          }

          outputs.push({
            id: outputId,
            label: outputLabel ?? startCaseFromId(outputId),
            variable: variableRef,
            unit: getOptionalString(outputCandidate, "unit"),
            format: getOptionalString(outputCandidate, "format")
          });
        });
      }

      if (outputs.length === 0) {
        if (formulaVar && variables[formulaVar]) {
          outputs.push({
            id: `${methodId}_${formulaVar}`,
            label: startCaseFromId(formulaVar),
            variable: formulaVar
          });
        }

        for (const [variableId, variableConfig] of Object.entries(variables)) {
          if (variableConfig.display || variableConfig.label) {
            outputs.push({
              id: `${methodId}_${variableId}`,
              label: variableConfig.label ?? startCaseFromId(variableId),
              variable: variableId,
              unit: variableConfig.unit,
              format: variableConfig.format
            });
          }
        }
      }

      if (outputs.length === 0) {
        errors.push(
          `${context}: logic.methods["${methodId}"] must expose at least one output (via outputs array or formula/display flags)`
        );
        continue;
      }

      methods.push({
        id: methodId,
        label,
        description,
        formula: formulaVar ?? undefined,
        variables,
        outputs
      });
    }

    if (methods.length === 0) {
      errors.push(`${context}: advanced logic must define at least one valid method`);
      return null;
    }

    const defaultMethod =
      getOptionalString(logicCandidate, "defaultMethod") ??
      getOptionalString(logicCandidate, "default_method") ??
      methods[0]!.id;

    if (!methods.some((method) => method.id === defaultMethod)) {
      errors.push(
        `${context}: advanced logic defaultMethod "${defaultMethod}" does not match any method id`
      );
    }

    return {
      type: "advanced",
      defaultMethod: methods.some((method) => method.id === defaultMethod)
        ? defaultMethod
        : methods[0]!.id,
      methods
    };
  }

  const data = { ...logicCandidate };
  return {
    type,
    data
  };
}

function parseForm(
  formCandidate: unknown,
  context: string,
  errors: string[]
): CalculatorFormConfig | null {
  if (formCandidate === undefined || formCandidate === null) {
    return null;
  }

  if (!isPlainObject(formCandidate)) {
    errors.push(`${context}: form must be an object`);
    return null;
  }

  const fields: CalculatorFormField[] = [];
  if (formCandidate.fields !== undefined) {
    if (!Array.isArray(formCandidate.fields)) {
      errors.push(`${context}: form.fields must be an array`);
    } else {
      formCandidate.fields.forEach((item: unknown, index: number) => {
        const field = parseFormField(item, `${context}: form.fields[${index}]`, errors);
        if (field) {
          fields.push(field);
        }
      });
    }
  }

  const sections: CalculatorFormSection[] = [];
  if (formCandidate.sections !== undefined) {
    if (!Array.isArray(formCandidate.sections)) {
      errors.push(`${context}: form.sections must be an array`);
    } else {
      formCandidate.sections.forEach((sectionCandidate: unknown, index: number) => {
        const section = parseFormSection(
          sectionCandidate,
          `${context}: form.sections[${index}]`,
          errors
        );
        if (section) {
          sections.push(section);
        }
      });
    }
  }

  if (fields.length === 0 && sections.length === 0) {
    errors.push(`${context}: form must define at least one field or section`);
  }

  let result: CalculatorFormResultConfig | null = null;
  if (formCandidate.result !== undefined && formCandidate.result !== null) {
    if (!isPlainObject(formCandidate.result)) {
      errors.push(`${context}: form.result must be an object`);
    } else if (!Array.isArray(formCandidate.result.outputs)) {
      errors.push(`${context}: form.result.outputs must be an array`);
    } else {
      const outputs: CalculatorFormOutput[] = [];
      formCandidate.result.outputs.forEach((output: unknown, index: number) => {
        if (!isPlainObject(output)) {
          errors.push(`${context}: form.result.outputs[${index}] must be an object`);
          return;
        }

        const id = getStringProperty(output, "id");
        const label = getStringProperty(output, "label");
        if (!id || !label) {
          errors.push(`${context}: form.result.outputs[${index}] requires id and label`);
          return;
        }

        assertNoHtml(label, `${context}: form.result.outputs[${index}].label`, errors);
        outputs.push({
          id,
          label,
          unit: getOptionalString(output, "unit"),
          format: getOptionalString(output, "format")
        });
      });
      result = { outputs };
    }
  }

  return {
    fields,
    sections,
    result
  };
}

function parseFormField(
  candidate: unknown,
  context: string,
  errors: string[]
): CalculatorFormField | null {
  if (!isPlainObject(candidate)) {
    errors.push(`${context} must be an object`);
    return null;
  }

  const id = getStringProperty(candidate, "id");
  const label = getStringProperty(candidate, "label");
  const type = getStringProperty(candidate, "type");

  if (!id || !label || !type) {
    errors.push(`${context} requires id, label, and type`);
    return null;
  }

  assertNoHtml(label, `${context}.label`, errors);

  const field: CalculatorFormField = {
    id,
    label,
    type,
    required: candidate.required === undefined ? true : Boolean(candidate.required)
  };

  const placeholder = getOptionalString(candidate, "placeholder");
  if (placeholder !== undefined) {
    assertNoHtml(placeholder, `${context}.placeholder`, errors);
    field.placeholder = placeholder;
  }

  const helpText =
    getOptionalString(candidate, "helpText") ?? getOptionalString(candidate, "help_text");
  if (helpText !== undefined) {
    assertNoHtml(helpText, `${context}.help_text`, errors);
    field.helpText = helpText;
  }

  if (candidate.default !== undefined) {
    if (typeof candidate.default === "string" || typeof candidate.default === "number") {
      field.defaultValue = String(candidate.default);
    } else {
      errors.push(`${context}.default must be a string or number`);
    }
  } else if (candidate.default_value !== undefined) {
    if (
      typeof candidate.default_value === "string" ||
      typeof candidate.default_value === "number"
    ) {
      field.defaultValue = String(candidate.default_value);
    } else {
      errors.push(`${context}.default_value must be a string or number`);
    }
  }

  if (candidate.min !== undefined) {
    if (typeof candidate.min === "number") {
      field.min = candidate.min;
    } else {
      errors.push(`${context}.min must be a number`);
    }
  }

  if (candidate.max !== undefined) {
    if (typeof candidate.max === "number") {
      field.max = candidate.max;
    } else {
      errors.push(`${context}.max must be a number`);
    }
  }

  if (candidate.step !== undefined) {
    if (typeof candidate.step === "number") {
      field.step = candidate.step;
    } else {
      errors.push(`${context}.step must be a number`);
    }
  }

  if (candidate.options !== undefined) {
    if (!Array.isArray(candidate.options)) {
      errors.push(`${context}.options must be an array`);
    } else {
      field.options = [];
      candidate.options.forEach((optionCandidate, optionIndex) => {
        if (!isPlainObject(optionCandidate)) {
          errors.push(`${context}.options[${optionIndex}] must be an object`);
          return;
        }

        const optionLabel = getStringProperty(optionCandidate, "label");
        const optionValue = getStringProperty(optionCandidate, "value");

        if (!optionLabel || !optionValue) {
          errors.push(`${context}.options[${optionIndex}] requires label and value`);
          return;
        }

        assertNoHtml(optionLabel, `${context}.options[${optionIndex}].label`, errors);
        field.options!.push({ label: optionLabel, value: optionValue });
      });
    }
  }

  return field;
}

function parseFormSection(
  candidate: unknown,
  context: string,
  errors: string[]
): CalculatorFormSection | null {
  if (!isPlainObject(candidate)) {
    errors.push(`${context} must be an object`);
    return null;
  }

  const sectionId = getStringProperty(candidate, "id") ?? `section_${context}`;
  const labelCandidate =
    getOptionalString(candidate, "label") ?? startCaseFromId(sectionId);

  if (!labelCandidate) {
    errors.push(`${context} requires a label`);
    return null;
  }

  assertNoHtml(labelCandidate, `${context}.label`, errors);

  const description = getOptionalString(candidate, "description");
  if (description !== undefined) {
    assertNoHtml(description, `${context}.description`, errors);
  }

  const showWhenCandidate =
    candidate.showWhen !== undefined ? candidate.showWhen : candidate.show_when;
  const showWhen = parseShowWhen(showWhenCandidate, `${context}.showWhen`, errors);

  const fields: CalculatorFormField[] = [];
  if (!Array.isArray(candidate.fields) || candidate.fields.length === 0) {
    errors.push(`${context}.fields must be a non-empty array`);
  } else {
    candidate.fields.forEach((fieldCandidate: unknown, fieldIndex: number) => {
      const field = parseFormField(
        fieldCandidate,
        `${context}.fields[${fieldIndex}]`,
        errors
      );
      if (field) {
        fields.push(field);
      }
    });
  }

  return {
    id: sectionId,
    label: labelCandidate,
    description: description ?? undefined,
    showWhen,
    fields
  };
}

function parseShowWhen(
  candidate: unknown,
  context: string,
  errors: string[]
): ShowWhenConfig | null {
  if (candidate === undefined || candidate === null) {
    return null;
  }

  if (!isPlainObject(candidate)) {
    errors.push(`${context} must be an object`);
    return null;
  }

  const field = getStringProperty(candidate, "field");
  if (!field) {
    errors.push(`${context}.field is required`);
    return null;
  }

  const equals = getOptionalString(candidate, "equals");
  let inValues: string[] | undefined;

  if (candidate.in !== undefined) {
    if (!Array.isArray(candidate.in)) {
      errors.push(`${context}.in must be an array of strings`);
    } else {
      inValues = [];
      candidate.in.forEach((value, index) => {
        if (typeof value === "string" && value.trim() !== "") {
          inValues!.push(value.trim());
        } else {
          errors.push(`${context}.in[${index}] must be a string`);
        }
      });
    }
  }

  return {
    field,
    equals: equals ?? undefined,
    in: inValues
  };
}

function startCaseFromId(input: string | null): string {
  if (!input) {
    return "";
  }

  const normalized = input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parsePageContent(
  parsed: Record<string, unknown>,
  context: string,
  errors: string[]
): PageContentConfig | null {
  const pageContentCandidate =
    ("pageContent" in parsed ? parsed.pageContent : undefined) ??
    ("page_content" in parsed ? parsed.page_content : undefined);

  if (pageContentCandidate === undefined || pageContentCandidate === null) {
    return null;
  }

  if (!isPlainObject(pageContentCandidate)) {
    errors.push(`${context}: page_content must be an object`);
    return null;
  }

  const keys = Object.keys(pageContentCandidate);
  const invalidKeys = keys.filter((key) => !ALLOWED_PAGE_CONTENT_KEYS.has(key));
  if (invalidKeys.length > 0) {
    errors.push(
      `${context}: unsupported page_content keys: ${invalidKeys.map((key) => `"${key}"`).join(", ")}`
    );
  }

  const introduction = coerceStringArray(pageContentCandidate.introduction, `${context}: page_content.introduction`, errors);
  const methodology = coerceStringArray(pageContentCandidate.methodology, `${context}: page_content.methodology`, errors);
  const examples = coerceStringArray(pageContentCandidate.examples, `${context}: page_content.examples`, errors);
  const summary = coerceStringArray(pageContentCandidate.summary, `${context}: page_content.summary`, errors);
  const faqs = parseFaqs(pageContentCandidate.faqs, context, errors);
  const citations = parseCitations(pageContentCandidate.citations, context, errors);
  const glossary = parseGlossary(pageContentCandidate.glossary, context, errors);

  return {
    introduction,
    methodology,
    examples,
    summary,
    faqs,
    citations,
    glossary
  };
}

function parseSchema(schemaCandidate: unknown, context: string, errors: string[]): SchemaConfig | null {
  if (schemaCandidate === undefined || schemaCandidate === null) {
    return null;
  }

  if (!isPlainObject(schemaCandidate)) {
    errors.push(`${context}: schema must be an object`);
    return null;
  }

  const schema: SchemaConfig = {};
  if (schemaCandidate.additionalTypes !== undefined) {
    const additionalTypes = coerceStringArray(
      schemaCandidate.additionalTypes,
      `${context}: schema.additionalTypes`,
      errors
    );
    if (additionalTypes) {
      schema.additionalTypes = additionalTypes;
    }
  }

  return schema;
}

function parseLinks(
  parsed: Record<string, unknown>,
  context: string,
  errors: string[]
): LinkConfig | null {
  const linksCandidate =
    ("links" in parsed ? parsed.links : undefined) ??
    ("seo_links" in parsed ? parsed.seo_links : undefined);

  if (linksCandidate === undefined || linksCandidate === null) {
    return null;
  }

  if (!isPlainObject(linksCandidate)) {
    errors.push(`${context}: links must be an object`);
    return null;
  }

  const linkConfig: LinkConfig = {};

  if (linksCandidate.internal !== undefined) {
    const internal = coerceStringArray(
      linksCandidate.internal,
      `${context}: links.internal`,
      errors
    );
    if (internal) {
      linkConfig.internal = internal;
    }
  }

  if (linksCandidate.external !== undefined) {
    if (!Array.isArray(linksCandidate.external)) {
      errors.push(`${context}: links.external must be an array`);
    } else {
      const external: NonNullable<LinkConfig["external"]> = [];
      linksCandidate.external.forEach((item, index) => {
        if (!isPlainObject(item)) {
          errors.push(`${context}: links.external[${index}] must be an object`);
          return;
        }

        const url = getStringProperty(item, "url");
        if (!url) {
          errors.push(`${context}: links.external[${index}] requires url`);
          return;
        }

        const label = getOptionalString(item, "label");
        if (label) {
          assertNoHtml(label, `${context}: links.external[${index}].label`, errors);
        }

        let rel: string[] | undefined;
        if (item.rel !== undefined) {
          if (Array.isArray(item.rel)) {
            rel = [];
            item.rel.forEach((relEntry, relIndex) => {
              if (typeof relEntry === "string") {
                rel!.push(relEntry.trim());
              } else {
                errors.push(
                  `${context}: links.external[${index}].rel[${relIndex}] must be a string`
                );
              }
            });
          } else if (typeof item.rel === "string") {
            rel = item.rel
              .split(" ")
              .map((token) => token.trim())
              .filter(Boolean);
          } else {
            errors.push(`${context}: links.external[${index}].rel must be a string or array`);
          }
        }

        external.push({ url, label, rel });
      });
      if (external.length > 0) {
        linkConfig.external = external;
      }
    }
  }

  return linkConfig;
}

function parseFaqs(
  candidate: unknown,
  context: string,
  errors: string[]
): PageContentConfig["faqs"] {
  if (candidate === undefined || candidate === null) {
    return undefined;
  }

  if (!Array.isArray(candidate)) {
    errors.push(`${context}: page_content.faqs must be an array`);
    return undefined;
  }

  const faqs: Required<PageContentConfig>["faqs"] = [];

  candidate.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push(`${context}: page_content.faqs[${index}] must be an object`);
      return;
    }

    const question = getStringProperty(item, "question");
    const answer = getStringProperty(item, "answer");
    if (!question || !answer) {
      errors.push(`${context}: page_content.faqs[${index}] requires question and answer`);
      return;
    }

    assertNoHtml(question, `${context}: page_content.faqs[${index}].question`, errors);
    assertNoHtml(answer, `${context}: page_content.faqs[${index}].answer`, errors);

    faqs.push({ question, answer });
  });

  return faqs.length > 0 ? faqs : undefined;
}

function parseCitations(
  candidate: unknown,
  context: string,
  errors: string[]
): PageContentConfig["citations"] {
  if (candidate === undefined || candidate === null) {
    return undefined;
  }

  if (!Array.isArray(candidate)) {
    errors.push(`${context}: page_content.citations must be an array`);
    return undefined;
  }

  const citations: Required<PageContentConfig>["citations"] = [];

  candidate.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push(`${context}: page_content.citations[${index}] must be an object`);
      return;
    }

    const url = getStringProperty(item, "url");
    if (!url) {
      errors.push(`${context}: page_content.citations[${index}] requires url`);
      return;
    }

    const label = getOptionalString(item, "label");
    const text = getOptionalString(item, "text");

    if (label) {
      assertNoHtml(label, `${context}: page_content.citations[${index}].label`, errors);
    }

    if (text) {
      assertNoHtml(text, `${context}: page_content.citations[${index}].text`, errors);
    }

    citations.push({ url, label, text });
  });

  return citations.length > 0 ? citations : undefined;
}

function parseGlossary(
  candidate: unknown,
  context: string,
  errors: string[]
): PageContentConfig["glossary"] {
  if (candidate === undefined || candidate === null) {
    return undefined;
  }

  if (!Array.isArray(candidate)) {
    errors.push(`${context}: page_content.glossary must be an array`);
    return undefined;
  }

  const glossary: Required<PageContentConfig>["glossary"] = [];

  candidate.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push(`${context}: page_content.glossary[${index}] must be an object`);
      return;
    }

    const term = getStringProperty(item, "term");
    const definition = getStringProperty(item, "definition");
    if (!term || !definition) {
      errors.push(`${context}: page_content.glossary[${index}] requires term and definition`);
      return;
    }

    assertNoHtml(term, `${context}: page_content.glossary[${index}].term`, errors);
    assertNoHtml(definition, `${context}: page_content.glossary[${index}].definition`, errors);

    glossary.push({ term, definition });
  });

  return glossary.length > 0 ? glossary : undefined;
}

function coerceStringArray(
  candidate: unknown,
  fieldPath: string,
  errors: string[]
): string[] | undefined {
  if (candidate === undefined || candidate === null) {
    return undefined;
  }

  const values = Array.isArray(candidate) ? candidate : [candidate];
  const result: string[] = [];

  values.forEach((value, index) => {
    if (typeof value === "string") {
      assertNoHtml(value, `${fieldPath}[${index}]`, errors);
      const trimmed = value.trim();
      if (trimmed) {
        result.push(trimmed);
      }
      return;
    }

    if (isPlainObject(value)) {
      const slug =
        getStringProperty(value, "slug") ??
        getStringProperty(value, "path") ??
        getStringProperty(value, "href");
      if (slug) {
        result.push(slug);
        return;
      }
    }

    errors.push(`${fieldPath}[${index}] must be a string or object with a slug`);
  });

  return result.length > 0 ? result : undefined;
}

function getStringProperty(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return null;
}

function getOptionalString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" ? trimmed : undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : undefined;
  }
  return undefined;
}

function assertNoHtml(value: string, fieldPath: string, errors: string[]) {
  if (value.includes("<") || value.includes(">")) {
    errors.push(`${fieldPath} must not include HTML tags. Use plain text or Markdown.`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatValidationErrors(errors: string[]): string {
  return errors.join("; ");
}

export function stringifyValue(value: Primitive): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value);
}
