import { ApplicationCommandOptionTypes, ApplicationCommandTypes, InteractionResponseTypes } from "../../deps.ts";
import { createCommand } from "./mod.ts";
import { $ } from "https://deno.land/x/dax@0.12.0/mod.ts";
import { humanizeMilliseconds } from "../utils/helpers.ts";

const denoEval = (cmd: string) => {
  const result = $`deno eval ${cmd}`.stdout("piped");
  return result.stdout
}

createCommand({
  name: "eval",
  description: "Denoコードを実行します",
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: "実行するDenoコードを指定します。",
      description: "サンプル",
      required: true,
    },
  ],
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  execute: async (bot, interaction) => {
    // メッセージからコンテンツの取得
    const msgs = interaction.data?.options?.values()

    for (const msg of msgs) {
      console.log(msg.value)

      const bftime = Date.now()
      const result = await $`deno eval ${msg.value}`.stdout("piped");
      const exec_time = Date.now() - bftime

      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: `🦕 Deno Eval\n\nYour Code:\`\`\`js\n${msg.value}\`\`\`\nResult: ${result.stdout}\nExecution time: ${exec_time}ms (${humanizeMilliseconds(exec_time)})`,
          },
        },
      );
    }
  },
});
