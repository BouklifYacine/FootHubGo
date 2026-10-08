import { describe, expect, test } from "bun:test";
import { detectImageType } from "./image-type";

const bytes = (...values: (number | string)[]) =>
  new Uint8Array(values.flatMap((v) => (typeof v === "string" ? [...v].map((c) => c.charCodeAt(0)) : [v])));

describe("detectImageType", () => {
  test("recognises the accepted formats", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0))).toBe("image/jpeg");
    expect(detectImageType(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png");
    expect(detectImageType(bytes("GIF89a", 0))).toBe("image/gif");
    expect(detectImageType(bytes("RIFF", 0, 0, 0, 0, "WEBPVP8 "))).toBe("image/webp");
  });

  test("refuses anything else, whatever the file claims to be", () => {
    expect(detectImageType(bytes("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
    expect(detectImageType(bytes("<html><script>"))).toBeNull();
    expect(detectImageType(bytes("RIFF", 0, 0, 0, 0, "WAVE"))).toBeNull();
    expect(detectImageType(bytes(0xff, 0xd8))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
