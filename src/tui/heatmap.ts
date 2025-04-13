import { crayon } from "crayon/mod.ts";

import { difference, format } from "@std/datetime";
import { GridLayout, Tui } from "tui/mod.ts";

import { Button } from "tui/src/components/mod.ts";
import {
  countRestartDays,
  countUniqueDays,
  divide,
  getCalendarDates,
} from "@src/utils/date.ts";
import { waitUntilDestroy } from "@src/tui/index.ts";

const colors = {
  0: 0x000000,
  1: 0xd6f5d6,
  2: 0xa8e6a1,
  3: 0x6ecf68,
  4: 0x34a853,
  5: 0x0b6623,
} as const;
export interface HeatmapElement {
  datetime: Date;
  level: 0 | 1 | 2 | 3 | 4 | 5;
}

export default async (tui: Tui, heatmapElements: HeatmapElement[]) => {
  tui.run();
  const elements = getCalendarDates(new Date(), "month").map((date) =>
    format(date, "yyyy-MM-dd")
  );
  const layout = new GridLayout(
    {
      pattern: [
        ["screen", "screen", "screen", "screen", "screen", "screen", "screen"],
        ...divide(elements, 7),
      ],
      gapX: 0,
      gapY: 0,
      rectangle: tui.rectangle, // `tui.rectangle` means we want to occupy the whole Tui's space
    },
  );

  type ElementName = typeof layout["elementNameToIndex"] extends
    Map<infer K, unknown> ? K : never;

  const buttons: Record<ElementName, Button> = {} as Record<
    ElementName,
    Button
  >;

  let i = 0;
  for (const elementName of layout.elementNameToIndex.keys()) {
    const rectangle = layout.element(elementName as ElementName);

    i++;

    const target = heatmapElements.find((element) => {
      return difference(element.datetime, new Date(elementName)).days == 0;
    });
    const color = target ? colors[target.level] : colors[0];

    const days = heatmapElements.map((el) => el.datetime);
    const button = new Button({
      parent: tui,
      theme: {
        base: crayon.bgHex(color),
      },
      rectangle,
      zIndex: 1,
      label: {
        text: elementName === "screen"
          ? `Total: ${countUniqueDays(days)} Restart: ${countRestartDays(days)}`
          : String(new Date(elementName).getDate()),
        align: {
          vertical: "center",
          horizontal: "center",
        },
      },
    });

    buttons[elementName] = button;
  }
  return await waitUntilDestroy(tui);
};
