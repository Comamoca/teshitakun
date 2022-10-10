import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  InteractionResponseTypes,
} from "../../deps.ts";
import { createCommand } from "./mod.ts";
import { $ } from "https://deno.land/x/dax@0.12.0/mod.ts";
import { humanizeMilliseconds } from "../utils/helpers.ts";
import { BOT_TOKEN, customConfig } from "../../configs.ts";
import { logger } from "../utils/logger.ts";

const log = logger({ name: "Eval" });

const denoEval = (cmd: string) => {
  const result = $`deno eval ${cmd}`.stdout("piped");
  return result.stdout;
};

const choice = (args: string) => {
  return {
    name: args,
    value: args,
  };
};

createCommand({
  name: "eval",
  description: "指定の言語のコードを実行します",
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: "code",
      description: "実行するコード",
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: "lang",
      choices: [
        choice("deno"),
      ],
      required: true,
      description: "実行する言語",
    },
  ],
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  execute: async (bot, interaction) => {
    if (!customConfig.allowEvalUser.includes(interaction.user.id.toString())) {
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: "あなたはこのコマンドを実行する権限がありません",
          },
        },
      );
      return;
    }

    // メッセージからコンテンツの取得
    const msgs = interaction.data?.options?.values();

    const interactionData: any = {};

    if (msgs === undefined) {
      return;
    }

    for (const msg of msgs) {
      interactionData[msg.name] = msg.value;
    }

    console.log(interactionData.code);

    if (interactionData.code.toString().includes("BOT_TOKEN")) {
      log.warn(
        `Result include BOT_TOKEN so transmission of result was canceled.`,
      );
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: "⚠️ 結果にこのBotのTokenが含まれてたためメッセージの送信に失敗しました",
          },
        },
      );
    }

    const bftime = Date.now();

    let result;

    try {
      if (interactionData.lang === "deno") {
        result = await $`deno eval ${interactionData.code}`.stdout("piped");
      }     } catch (err) {
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: "指定のコードでエラーが発生しました\n" + "```bash\n" + err + "\n```",
          },
        },
      );
      return;
    }

    const exec_time = Date.now() - bftime;

    if (
      result?.stdout.includes(BOT_TOKEN)
    ) {
      log.warn(
        `Result include BOT_TOKEN so transmission of result was canceled.`,
      );
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: "⚠️ 結果にこのBotのTokenが含まれてたためメッセージの送信に失敗しました",
          },
        },
      );
    } else {
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content:
              `🦕 Deno Eval\n\nYour Code:\`\`\`js\n${interactionData.code}\`\`\`\nResult: ${result?.stdout}\nExecution time: ${exec_time}ms (${
                humanizeMilliseconds(
                  exec_time,
                )
              })`,
          },
        },
      );
    }
  },
});
