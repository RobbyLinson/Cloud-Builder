import chalk from 'chalk';

export function drawLogo(){
  console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
  console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
  console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
  console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
  console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));
};

export function drawActionCancelledByUser(){
  console.log(chalk.gray('------------------------------------------------'));
  console.log(chalk.red('Action cancelled by user.'));
  console.log(chalk.gray('------------------------------------------------'));
}

export function drawResourcesMatch(){
  console.log(chalk.gray('------------------------------------------------'));
  console.log(chalk.green('This infrastructure is currently up.\n\tDo you want to reinitialize it?'));
  console.log(chalk.gray('------------------------------------------------'));
}

export function drawResourcesDoesNotMatch(){
  console.log(chalk.gray('------------------------------------------------'));
  console.log(chalk.yellow('Current infrastructure differs from new one.\n\tPerforming update'));
  console.log(chalk.gray('------------------------------------------------'));
}