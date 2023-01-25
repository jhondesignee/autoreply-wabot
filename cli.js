#!/usr/bin/env node
import { program } from "commander"
import { spawn } from "child_process"
import path from "path"
import { URL } from "url"

const dirname = new URL(".", import.meta.url).pathname

function startBot(mode) {
  const bot = spawn(`cd ${dirname} && yarn ${mode}`, { shell: true })
  bot.stdout.on("data", (data) => {
    console.log(String(data))
  })
  bot.stderr.on("data", (data) => {
    console.error(String(data))
  })
}

program
  .command("start", null, { isDefault: true })
  .action(() => {
    startBot("start")
  })
program
  .command("dev")
  .action(() => {
    startBot("dev")
  })
program.parse(process.argv)
