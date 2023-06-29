const program = require("commander");

program
  .version("1.0.0")
  .description("A translate tool")
  .option("-u, --url", "Your translate url")
  .parse(process.argv);

if (program.url) {
  console.log(`Hello${program.name ? ", " + program.name : ""}!`);
} else {
  program.help();
}
