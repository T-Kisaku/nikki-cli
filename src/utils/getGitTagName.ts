export default async () => {
  const command = new Deno.Command("git", {
    args: ["describe", "--tags"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout } = await command.output();

  if (code === 0) {
    const tagName = new TextDecoder().decode(stdout).trim();
    return tagName;
  } else {
    return "ERROR_VERSION";
  }
};
