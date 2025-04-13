import { GridLayout, Signal, Tui } from "tui/mod.ts";

import { Button } from "tui/src/components/mod.ts";
import { num, separator } from "@src/utils/asciiArt.ts";
import { waitUntilDestroy } from "@src/tui/index.ts";

export default (
  tui: Tui,
  maxSeconds: number,
) => {
  tui.run();
  const layout = new GridLayout(
    {
      pattern: [
        ["1", "2", ":", "3", "4"],
      ],
      gapX: 2,
      gapY: 1,
      rectangle: tui.rectangle,
    },
  );
  type ElementName = typeof layout["elementNameToIndex"] extends
    Map<infer K, unknown> ? K : never;
  const display = {
    1: new Signal(num[0]),
    2: new Signal(num[0]),
    3: new Signal(num[0]),
    4: new Signal(num[0]),
    ":": separator,
  };

  for (const elementName of layout.elementNameToIndex.keys()) {
    const rectangle = layout.element(elementName as ElementName);

    new Button({
      parent: tui,
      theme: {},
      rectangle,
      zIndex: 1,
      label: {
        text: display[elementName],
        align: {
          vertical: "center",
          horizontal: "center",
        },
      },
    });
  }

  let current = 0;

  const intervalId = setInterval(() => {
    current++;
    const minutes = Math.floor(current / 60);
    const seconds = current % 60;

    display[1].value = num[Math.floor(minutes / 10)];
    display[2].value = num[minutes % 10];
    display[3].value = num[Math.floor(seconds / 10)];
    display[4].value = num[seconds % 10];
    if (current >= maxSeconds) {
      clearInterval(intervalId);
      tui.emit("destroy");
    }
  }, 1000);
  return waitUntilDestroy(tui);
};
