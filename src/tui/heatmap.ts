// Copyright 2023 Im-Beast. MIT license.
// Simple calculator demo using grid layout
// 薄い緑（低い継続）：#d6f5d6
//
// 少し濃い緑：#a8e6a1
//
// 中間の緑：#6ecf68
//
// 濃い緑（高い継続）：#34a853
//
// とても濃い緑（最高継続）：#0b6623

import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";

import { GridLayout, Tui } from "https://deno.land/x/tui@2.1.11/mod.ts";
import { handleInput } from "https://deno.land/x/tui@2.1.11/mod.ts";
import {
  handleKeyboardControls,
  handleMouseControls,
} from "https://deno.land/x/tui@2.1.11/mod.ts";

import { Button } from "https://deno.land/x/tui@2.1.11/src/components/button.ts";
import {
  countRestarts,
  findDatedFilesWithHeading,
} from "@src/utils/markdown/habitTrack.ts";
import getFullWeeksWithDates from "@src/utils/getFullWeeksWithDates.ts";

export default async (search: string, directory: string) => {
  const tui = new Tui({
    style: crayon.bgBlack,
    refreshRate: 1000 / 60,
  });

  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);
  tui.dispatch();
  tui.run();

  const layout = new GridLayout(
    {
      pattern: [
        ["screen", "screen", "screen", "screen", "screen", "screen", "screen"],
        ...getFullWeeksWithDates(),
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
  const doneDays = await findDatedFilesWithHeading(
    search,
    directory,
  );
  for (const elementName of layout.elementNameToIndex.keys()) {
    const rectangle = layout.element(elementName as ElementName);

    i++;

    const color = doneDays.includes(elementName) ? 0x34a853 : 0x000000;

    const button = new Button({
      parent: tui,
      theme: {
        base: crayon.bgHex(color),
        focused: crayon.bgHex(color + 0x101010),
        active: crayon.bgHex(color + 0x303030),
      },
      rectangle,
      zIndex: 1,
      label: {
        text: elementName === "screen"
          ? `Total: ${doneDays.length} Restart: ${countRestarts(doneDays)}`
          : String(new Date(elementName).getDate()),
        align: {
          vertical: "center",
          horizontal: "center",
        },
      },
    });

    buttons[elementName] = button;
  }

  tui.on("keyPress", ({ key }) => {
    if (key === "q") {
      tui.emit("destroy");
    }
  });
};
