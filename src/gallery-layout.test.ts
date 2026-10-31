import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { sampleFlow, sampleLayout } from "../gallery/sample-flow";
import { layoutFlow } from "./layout";

it("the gallery layout file is what ELK produces now (UPDATE_LAYOUT=1 rewrites it)", async () => {
  const fresh = await layoutFlow(sampleFlow, "en");
  if (process.env.UPDATE_LAYOUT) writeFileSync(join(process.cwd(), "gallery/sample-flow.layout.json"), JSON.stringify(fresh, null, 2) + "\n");
  else expect(sampleLayout).toEqual(fresh);
});
