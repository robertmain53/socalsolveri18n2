import {
  getAllCalculators,
  getCalculatorByPath,
  getCategories,
  getTopCalculators,
  invalidateCache
} from "./content";

describe("content data layer", () => {
  beforeEach(() => {
    invalidateCache();
  });

  it("loads calculator records from CSV", () => {
    const calculators = getAllCalculators();
    expect(calculators.length).toBeGreaterThan(0);
    expect(calculators[0]).toHaveProperty("fullPath");
    expect(calculators[0]).toHaveProperty("title");
  });

  it("resolves calculators by normalized path", () => {
    const calculators = getAllCalculators();
    const target = calculators[0];

    const match = getCalculatorByPath(target.fullPath);
    expect(match?.title).toBe(target.title);
  });

  it("aggregates categories with traffic totals", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].trafficTotal).toBeGreaterThan(0);
  });

  it("ranks top calculators by traffic", () => {
    const top = getTopCalculators(5);
    expect(top.length).toBeGreaterThan(0);
    expect(top.length).toBeLessThanOrEqual(5);
    if (top.length > 1) {
      expect(top[0].trafficEstimate).toBeGreaterThanOrEqual(top[top.length - 1].trafficEstimate);
    }
  });
});
