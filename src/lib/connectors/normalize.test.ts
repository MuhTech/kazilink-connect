import { describe, expect, it } from "vitest";
import { dedupeKey, eligibilityFrom, salary } from "./normalize";
import { mapRemoteOk } from "./sources";

describe("eligibility is never invented", () => {
  it("empty location is unspecified", () => expect(eligibilityFrom("")).toBe("unspecified"));
  it("Tanzania is detected", () => expect(eligibilityFrom("Tanzania, Kenya")).toBe("tanzania"));
  it("worldwide is detected", () => expect(eligibilityFrom("Worldwide")).toBe("worldwide"));
  it("Africa is detected", () => expect(eligibilityFrom("EMEA")).toBe("africa"));
  it("other countries are restricted", () => expect(eligibilityFrom("USA only")).toBe("restricted"));
});

describe("salary is never invented", () => {
  it("zero means not listed", () => expect(salary("0")).toBeNull());
  it("positive value kept", () => expect(salary("50000")).toBe(50000));
  it("remote ok job without pay has no currency", () => {
    const [j] = mapRemoteOk([{ legal: "x" }, { id: "1", position: "Dev", company: "A", url: "https://remoteok.com/x", salary_min: 0, salary_max: 0 }]);
    expect(j?.currency).toBeNull();
    expect(j?.pay_unit).toBeNull();
  });
});

describe("duplicates", () => {
  it("same title and company match across sources", () =>
    expect(dedupeKey("Senior  Developer!", "ACME Inc")).toBe(dedupeKey("senior developer", "acme inc")));
});
