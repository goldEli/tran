#!/usr/bin/env node
const { Command } = require("commander"); // add this line
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
//add the following line
const program = new Command();

console.log(figlet.textSync("IFUN Translate Tool"));

program
  .version("1.0.0")
  .description("An Translate Tool")
  .option("-u, --url  [value]", "translate api")
  .parse(process.argv);

const options = program.opts();

const translateToEn = async (content: string) => {
  try {
    const response = await axios({
      url: options.url,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        source_lang: "zh",
        target_lang: "en",
        content,
      },
    });

    return response.data.content ?? "";
  } catch (error) {
    console.error(error);
  }
};

const capitalize = (str: string) => {
  let ret = "";
  try {
    ret = str.charAt(0).toUpperCase() + str.slice(1);
  } catch (error) {
    console.log("ret:", str, error);
  }
  return ret;
};

const getCamelCaseString = (arr: string[]) => {
  // 使用正则表达式模式进行匹配
  const pattern = /^[A-Za-z]+$/;

  const str = arr
    .filter((item) => pattern.test(item))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  return str.charAt(0).toLowerCase() + str.slice(1);
};

function checkFileExists(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (err: any) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function readFileAsync(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(file, "utf8", (err: any, data: string) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    } catch (error) {
      console.log("error");
    }
  });
}

function printRed(text: string): void {
  console.log("\x1b[31m%s\x1b[0m", text);
}

const createResult = async (array: string[]) => {
  const objZh: Record<string, string> = {};
  const objEn: Record<string, string> = {};
  for (let i = 0; i < array.length; i++) {
    try {
      const en = await translateToEn(array[i]);
      const key = getCamelCaseString(en.split(" "));
      objZh[key] = array[i];
      objEn[key] = capitalize(en);
    } catch (error) {
      console.log("error", error);
    }
  }
  return {
    objZh,
    objEn,
  };
};

const getChineseArr = async (fileName: string) => {
  const txt = await readFileAsync(fileName);
  const arr = txt
    .split("\n")
    ?.map((item) => item.trim())
    .filter((item) => !!item);
  return arr;
};

const getFileName = async () => {
  const currentPath = process.cwd();
  const fileName = path.join(currentPath, "i18n.txt") as string;
  const isExists = await checkFileExists(fileName);
  if (!isExists) {
    printRed("请在当前项目中创建 i18n.txt 文件。（内容用回车进行分隔）");
    return Promise.reject();
  }
  return fileName;
};

async function main() {
  const fileName = await getFileName();
  const arr = await getChineseArr(fileName);
  const result = await createResult(arr);
  console.log(result);
}

if (options.url) {
  main();
}
