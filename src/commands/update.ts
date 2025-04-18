import { Command } from "@cliffy/command";
export default new Command()
  .description("Update nik cli")
  .action(async () => {
    const url =
      "https://raw.githubusercontent.com/T-Kisaku/nikki-cli/main/install.sh";
    // sh -c "curl -fsSL URL | sh" を実行
    const cmd = new Deno.Command("sh", {
      args: ["-c", `curl -fsSL ${url} | sh`],
      stdout: "inherit", // ターミナルへ出力をそのまま流す
      stderr: "inherit",
    });
    const { success, code } = await cmd.spawn().output(); // 新しい子プロセスを生成&#8203;:contentReference[oaicite:0]{index=0}
    // const status = await process.status();
    if (!success) Deno.exit(code);
  });
