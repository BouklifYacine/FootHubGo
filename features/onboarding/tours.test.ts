import { describe, expect, test } from "bun:test";
import { MAX_TOUR_STEPS, TOURS, buildTour, sideFor } from "./tours";

const everything = (anchor: string) => anchor;

describe("onboarding tours", () => {
  test("each tour has at most 6 steps", () => {
    expect(TOURS.coach.length).toBeLessThanOrEqual(MAX_TOUR_STEPS);
    expect(TOURS.player.length).toBeLessThanOrEqual(MAX_TOUR_STEPS);
  });

  test("steps whose element is missing are dropped", () => {
    const steps = buildTour("player", { sectionCount: 1, find: (anchor) => (anchor === "callup-answer" ? null : anchor) });
    expect(steps.map((step) => step.anchor)).not.toContain("callup-answer");
    expect(steps).toHaveLength(5);
  });

  test("the section switcher comes first for members of several sections, still 6 steps max", () => {
    const steps = buildTour("coach", { sectionCount: 2, find: everything });
    expect(steps[0].anchor).toBe("section-switcher");
    expect(steps).toHaveLength(MAX_TOUR_STEPS);
    expect(steps.at(-1)?.anchor).toBe("nav-more");
  });

  test("no section step with one section", () => {
    expect(buildTour("coach", { sectionCount: 1, find: everything })[0].anchor).toBe("home-next-event");
  });

  test("bubbles of the bottom tabs open above them on mobile", () => {
    expect(sideFor("nav-agenda", true)).toBe("top");
    expect(sideFor("nav-agenda", false)).toBeUndefined();
  });
});
