import {
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
  Tui,
} from "tui/mod.ts";

export const rootTui = () => {
  const tui = new Tui({
    refreshRate: 1000 / 60,
  });

  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);

  tui.on("keyPress", ({ key }) => {
    if (key === "q") {
      tui.emit("destroy");
    }
  });
  return tui;
};

export const waitUntilDestroy = (tui: Tui) => {
  tui.off("destroy");
  return new Promise<Tui>((resolve) => {
    tui.on("destroy", () => {
      resolve(tui);
    });
  });
};
export const tuiExit = async (tui: Tui) => {
  tui.destroy();
  await Promise.resolve();
  Deno.exit(0);
};
