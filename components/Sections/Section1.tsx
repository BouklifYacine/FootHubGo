import React from "react";
import { FeaturesSectionWithHoverEffects } from "../feature-section-with-hover-effects";


function Section1() {
  return (
    <div className="min-h-screen w-full">
      <div className="absolute top-0 left-0 w-full">
        <FeaturesSectionWithHoverEffects />
      </div>
    </div>
  );
}

export { Section1 };