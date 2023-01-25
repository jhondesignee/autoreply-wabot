import express from "express"
import path from "path"
import cors from "cors"
import lodash from "lodash"
import AJV from "ajv"
import * as commands from "./commands.js"
import config from "./config.json" assert { type: "json" }

function regexFormat(pattern) {
  return pattern
    .replaceAll("/", "\\")
    .replaceAll("\\\\", "/")
}

function regexTest(pattern, source, flags) {
  return new RegExp(pattern, flags).test(source)
}

function validateConfig(config) {
  const rules = {
    type: "object",
    additionalProperties: false,
    properties: {
      includeSenders: {
        type: "array",
        items: { type: "string" }
      },
      excludeSenders: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["serverPort"],
    properties: {
      serverPort: {
        type: "number",
        maximum: 9999,
        minimum: 1000
      },
      globalRules: rules,
      events: {
        type: "object",
        additionalProperties: false,
        properties: {
          start: { type: "string" },
          error: { type: "string" }
        }
      },
      options: {
        type: "object",
        additionalProperties: true
      },
      commands: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            received: {
              type: "array",
              items: { type: "string" }
            },
            command: { type: "string" },
            flags: { type: "string" },
            rulesMergeMode: {
              type: "string",
              pattern: "^(add|remove|override)$"
            },
            rules: rules
          },
          required: ["received", "command"]
        }
      }
    }
  }
  const validate = new AJV().compile(schema)
  if (!validate(config)) {
    console.error("Invalid configuration in 'config.json'!\n")
    for (const error of validate.errors) {
      console.error(`Error: ${error.instancePath} ${error.message}`)
    }
    return false
  }
  return true
}

function createMessageData(messages) {
  const data = { data: [] }
  if (!messages) {
    return data
  }
  if (!lodash.isArray(messages)) {
    messages = [String(messages)]
  }
  for (const message of messages) {
    data.data.push({ message: String(message) })
  }
  return data
}

function mergeRules(globalRules, commandRules, mode) {
  const mergeFunctions = {
    add: (object, source) => {
      if (lodash.isArray(object) || lodash.isArray(source)) {
        return lodash.union(object ?? [], source ?? [])
      }
    },
    remove: (object, source) => {
      if (lodash.isArray(object) || lodash.isArray(source)) {
        return lodash.difference(object ?? [], source ?? [])
      }
    },
    override: (object, source) => {
      if (lodash.isArray(object) || lodash.isArray(source)) {
        return source ?? []
      }
    }
  }
  return lodash.mergeWith(globalRules, commandRules, mergeFunctions[mode])
}


async function runCommand(context, command) {
  for (const excludeSender of command.rules?.excludeSenders ?? []) {
    if (regexTest(excludeSender, context.senderName, command.flags ?? "g")) {
      return null
    }
  }
  for (const includeSender of command.rules?.includeSenders ?? []) {
    if (!regexTest(includeSender, context.senderName, command.flags ?? "g")) {
      return null
    }
  }
  try {
    for (const received of command.received) {
      if (regexTest(received, context.senderMessage, command.flags ?? "g")) {
        command.receivedPattern = received
        const messages = await commands[command.command](context, command)
        return createMessageData(messages)
      }
    }
  } catch(error) {
    if (config.events?.error) {
      const messages = await commands[config.events.error](context, command, error)
      return createMessageData(messages)
    } else {
      console.error(error.message)
      return null 
    }
  }
}

async function postHandler(request, response) {
  const data = request.body
  if (!config.commands) {
    response.end()
  } else {
    loop: {
      for (const command of config.commands) {
        const message = await runCommand(data, command)
        if (message) {
          if (!message.data.length) {
            response.end()
            break loop
          }
          response.send(message)
          break loop
        }
      }
      response.end()
    }
  }
}

if (validateConfig(config)) {
  for (const [index, command] of Object.entries(config.commands ?? [])) {
    config.commands[index].rules = mergeRules(
      structuredClone(config.globalRules) ?? {},
      command.rules ?? {},
      command.rulesMergeMode ?? "add"
    )
    for (const [_index, received] of Object.entries(config.commands[index].received)) {
      config.commands[index].received[_index] = regexFormat(received)
    }
    for (const [_index, excludeSenders] of Object.entries(config.commands[index].rules.excludeSenders ?? [])) {
      config.commands[index].rules.excludeSenders[_index] = regexFormat(excludeSenders)
    }
    for (const [_index, includeSenders] of Object.entries(config.commands[index].rules.includeSenders ?? [])) {
      config.commands[index].rules.includeSenders[_index] = regexFormat(includeSenders)
    }
  }
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.post("/", postHandler)
  app.listen(config.serverPort, () => {
    if (config.events?.start) {
      commands[config.events.start]()
    }
  })
}
