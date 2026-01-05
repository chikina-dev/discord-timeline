import { styleText } from "util";

export function logMessage(content: string | null) {
  console.log(styleText('bgWhiteBright', styleText('black', '----- Get Log -----')));
  console.log(styleText('yellow', `日付: ${new Date().toLocaleString()}`));
  console.log(styleText('white', `データ: ${content}\n`));
}
