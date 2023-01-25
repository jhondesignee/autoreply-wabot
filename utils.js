import fs from "fs"
import lodash from "lodash"

export class Storage {
  constructor(filePath, indent=0) {
    this.filePath = filePath
  }
  
  #writeJson(json) {
    fs.writeFileSync(this.filePath, JSON.stringify(json, null, this.indent))
  }
  
  #readJson() {
    if (!fs.existsSync(this.filePath)) {
      this.#writeJson({})
      return {}
    }
    return JSON.parse(fs.readFileSync(this.filePath))
  }
  
  setItem(key, value) {
    const file = this.#readJson()
    if (lodash.isArray(value) && lodash.isArray(file[key])) {
      file[key] = lodash.union(file[key], value)
    } else if (lodash.isObject(value) && lodash.isObject(file[key])) {
      file[key] = lodash.merge(file[key], value)
    } else {
      file[key] = value
    }
    this.#writeJson(file)
  }
  
  getItem(key, value=null, create=false) {
    const file = this.#readJson()
    if (create && !(file[key])) {
      this.setItem(key, value)
      return this.#readJson()[key]
    }
    return file[key] ?? value
  }
  
  getFull() {
    return this.#readJson()
  }
}

export function createFrame(arrayOfStrings, config) {
  const defaultConfig = {
    top: "-",
    bottom: "-",
    index: "•",
    gap: 1,
    pad: 1,
    rept: 10
  }
  arrayOfStrings = lodash.isArray(arrayOfStrings) ? arrayOfStrings : [String(arrayOfStrings)]
  config = lodash.merge(defaultConfig, config)
  let text = config.top.repeat(config.rept) + "\n"
  for (let string of arrayOfStrings) {
    const lineBreak = arrayOfStrings.slice(-1) === string ? "" : "\n"
    string = `${" ".repeat(config.pad)}${config.index}${" ".repeat(config.gap)}${string}${lineBreak}`
    text += string
  }
  text += config.bottom.repeat(config.rept)
  return text 
}

export function splitCommand(command) {
  const parts = command.split(" ")
  return [parts[0], parts.slice(1).join(" ")]
}
