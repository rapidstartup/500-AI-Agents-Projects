import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Mock reference database for common lab tests.
 * In production, this would connect to a medical reference API.
 */
const MOCK_REFERENCE_RANGES: Record<
  string,
  { unit: string; low: number; high: number; description: string }
> = {
  "glucose": { unit: "mg/dL", low: 70, high: 100, description: "Fasting blood glucose" },
  "hdl": { unit: "mg/dL", low: 40, high: 60, description: "HDL cholesterol" },
  "ldl": { unit: "mg/dL", low: 0, high: 100, description: "LDL cholesterol" },
  "total cholesterol": { unit: "mg/dL", low: 0, high: 200, description: "Total cholesterol" },
  "triglycerides": { unit: "mg/dL", low: 0, high: 150, description: "Triglycerides" },
  "hemoglobin a1c": { unit: "%", low: 4, high: 5.6, description: "HbA1c (diabetes marker)" },
  "creatinine": { unit: "mg/dL", low: 0.7, high: 1.3, description: "Kidney function" },
  "bun": { unit: "mg/dL", low: 7, high: 20, description: "Blood urea nitrogen" },
  "alt": { unit: "U/L", low: 7, high: 56, description: "Alanine aminotransferase (liver)" },
  "ast": { unit: "U/L", low: 10, high: 40, description: "Aspartate aminotransferase (liver)" },
  "tsh": { unit: "mIU/L", low: 0.4, high: 4.0, description: "Thyroid stimulating hormone" },
  "wbc": { unit: "K/uL", low: 4.5, high: 11.0, description: "White blood cell count" },
  "rbc": { unit: "M/uL", low: 4.5, high: 5.5, description: "Red blood cell count" },
  "hemoglobin": { unit: "g/dL", low: 12, high: 17, description: "Hemoglobin" },
  "hematocrit": { unit: "%", low: 38, high: 50, description: "Hematocrit" },
  "platelets": { unit: "K/uL", low: 150, high: 400, description: "Platelet count" },
};

const labResultSchema = z.object({
  testName: z.string(),
  value: z.number(),
  unit: z.string(),
  referenceRange: z.string(),
  status: z.enum(["normal", "low", "high", "critical"]),
});

/**
 * Parses raw lab report text into structured data.
 * Uses regex patterns to extract test names, values, units, and reference ranges.
 */
export const parseLabReport = createTool({
  id: "parseLabReport",
  description:
    "Parse a lab report text string into structured data. Extracts test name, value, unit, reference range, and status (normal/low/high/critical) for each lab result.",
  inputSchema: z.object({
    labReportText: z.string().describe("Raw text content of the lab report"),
  }),
  outputSchema: z.object({
    results: z.array(labResultSchema),
    summary: z.string().describe("Brief summary of findings"),
  }),
  execute: async ({ context }) => {
    const { labReportText } = context;
    const results: z.infer<typeof labResultSchema>[] = [];
    const lines = labReportText.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      const match = line.match(
        /([A-Za-z\s]+(?:A1c|HDL|LDL|WBC|RBC|TSH)?)\s*[:=]?\s*([\d.]+)\s*([a-zA-Z/%]+)?\s*(?:\(([^)]+)\)|\[([^\]]+)\])?/i
      );
      if (match) {
        const [, name, valueStr, unit, refParen, refBracket] = match;
        const testName = (name ?? "").trim().toLowerCase();
        const value = parseFloat(valueStr ?? "0");
        const refStr = refParen ?? refBracket ?? "";
        const refMatch = refStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
        let low = 0,
          high = 100;
        if (refMatch) {
          low = parseFloat(refMatch[1]);
          high = parseFloat(refMatch[2]);
        } else {
          const ref = MOCK_REFERENCE_RANGES[testName];
          if (ref) {
            low = ref.low;
            high = ref.high;
          }
        }
        const status =
          value < low ? (value < low * 0.7 ? "critical" : "low") : value > high ? (value > high * 1.3 ? "critical" : "high") : "normal";
        results.push({
          testName: (name ?? "").trim(),
          value,
          unit: unit ?? MOCK_REFERENCE_RANGES[testName]?.unit ?? "",
          referenceRange: refStr || `${low}-${high}`,
          status,
        });
      }
    }

    const abnormalCount = results.filter((r) => r.status !== "normal").length;
    const summary =
      abnormalCount > 0
        ? `Parsed ${results.length} results; ${abnormalCount} outside reference range.`
        : `Parsed ${results.length} results; all within reference range.`;

    return { results, summary };
  },
});

/**
 * Looks up normal reference ranges for a given lab test.
 * Mock implementation using built-in reference data.
 */
export const lookupMedicalReference = createTool({
  id: "lookupMedicalReference",
  description:
    "Look up normal reference ranges for a given lab test. Returns unit, typical range, and a brief description. Use when you need to interpret or validate lab values.",
  inputSchema: z.object({
    testName: z.string().describe("Name of the lab test (e.g., glucose, HDL, creatinine)"),
  }),
  outputSchema: z.object({
    testName: z.string(),
    unit: z.string(),
    referenceRange: z.string(),
    description: z.string(),
    found: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { testName } = context;
    const normalized = testName.trim().toLowerCase();
    const ref = MOCK_REFERENCE_RANGES[normalized];

    if (ref) {
      return {
        testName: testName.trim(),
        unit: ref.unit,
        referenceRange: `${ref.low}-${ref.high}`,
        description: ref.description,
        found: true,
      };
    }

    return {
      testName: testName.trim(),
      unit: "",
      referenceRange: "Unknown - consult medical reference",
      description: "Test not found in reference database",
      found: false,
    };
  },
});

/**
 * Evaluates risk factors based on lab values.
 * Mock implementation that assesses common cardiovascular and metabolic markers.
 */
export const assessRiskFactors = createTool({
  id: "assessRiskFactors",
  description:
    "Evaluate risk factors based on lab values. Assesses cardiovascular, metabolic, and kidney health markers. Returns risk level and factors of concern.",
  inputSchema: z.object({
    labResults: z.array(
      z.object({
        testName: z.string(),
        value: z.number(),
        unit: z.string(),
      })
    ),
  }),
  outputSchema: z.object({
    overallRisk: z.enum(["low", "moderate", "elevated", "high"]),
    factorsOfConcern: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { labResults } = context;
    const factorsOfConcern: string[] = [];
    const recommendations: string[] = [];

    for (const r of labResults) {
      const name = r.testName.toLowerCase();
      const v = r.value;

      if (name.includes("glucose") && v > 126) {
        factorsOfConcern.push(`Fasting glucose elevated (${v}) - possible diabetes risk`);
        recommendations.push("Discuss blood sugar management with a healthcare provider");
      }
      if (name.includes("ldl") && v > 130) {
        factorsOfConcern.push(`LDL cholesterol elevated (${v}) - cardiovascular risk`);
        recommendations.push("Consider dietary changes and discuss lipid-lowering options with a doctor");
      }
      if (name.includes("hdl") && v < 40) {
        factorsOfConcern.push(`HDL cholesterol low (${v}) - cardiovascular risk`);
        recommendations.push("Lifestyle modifications may help raise HDL");
      }
      if (name.includes("creatinine") && v > 1.3) {
        factorsOfConcern.push(`Creatinine elevated (${v}) - possible kidney function concern`);
        recommendations.push("Follow up with a nephrologist or primary care provider");
      }
      if (name.includes("hemoglobin a1c") && v >= 5.7) {
        factorsOfConcern.push(`HbA1c (${v}%) - prediabetes or diabetes range`);
        recommendations.push("Discuss diabetes screening and prevention with a healthcare provider");
      }
    }

    const riskLevel =
      factorsOfConcern.length >= 3
        ? "high"
        : factorsOfConcern.length >= 2
          ? "elevated"
          : factorsOfConcern.length >= 1
            ? "moderate"
            : "low";

    if (riskLevel === "low" && factorsOfConcern.length === 0) {
      recommendations.push("Continue routine health screenings as recommended by your provider");
    }

    return {
      overallRisk: riskLevel,
      factorsOfConcern,
      recommendations,
    };
  },
});
