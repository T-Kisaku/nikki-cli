import { crayon } from "crayon/mod.ts";

import {
  GridLayout,
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
  Signal,
  Tui,
} from "tui/mod.ts";

import { Button } from "tui/src/components/mod.ts";
import { num, separator } from "@src/utils/asciiArt.ts";

export default (endCallback: (currentSeconds: number) => void) => {
  const tui = new Tui({
    style: crayon.bgBlack,
    refreshRate: 1000 / 60,
  });

  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);
  tui.dispatch();
  tui.run();

  tui.on("keyPress", ({ key }) => {
    if (key === "q") {
      tui.emit("destroy");
    }
  });

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
      theme: {
        base: crayon.bgBlack,
        focused: crayon.bgBlack,
        active: crayon.bgBlack,
      },
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
  function countUp(
    maxSeconds: number,
    callback?: (second: number) => void,
  ): void {
    const intervalId = setInterval(() => {
      current++;
      if (callback) callback(current);
      if (current >= maxSeconds) {
        clearInterval(intervalId);
      }
    }, 1000);
  }

  countUp(60 * 60 * 4, (_sec) => {
    const minutes = Math.floor(current / 60);
    const seconds = current % 60;

    display[1].value = num[Math.floor(minutes / 10)];
    display[2].value = num[minutes % 10];
    display[3].value = num[Math.floor(seconds / 10)];
    display[4].value = num[seconds % 10];
  });
  globalThis.addEventListener("unload", () => endCallback(current));
};
