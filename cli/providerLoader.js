
import fs from 'fs';
import { pathToFileURL } from 'url'

export class ProviderLoader {
  constructor() {
    return (async () => {
	  await this.loadProviderConfig();
      return this;
    })();
  }
  
  async loadProviderConfig(path=process.cwd() + '/providers.json') {
    const config = JSON.parse(fs.readFileSync(path)).available;
	
	if (config.length <= 0) {
		console.log(`No providers have been installed.`);
		return;
	}
	
    for (let provider in config) {
       await this.loadProvider(config, provider);
    }
  }
 
  async loadProvider(config, provider) {
    const path = pathToFileURL(process.cwd() + '/provider' + config[provider]);
    try {
	  const module = await import(path);
      this[provider] = module.default;
      console.log(`Loaded provider: '${provider}'`);
    } catch (e) {
      console.log(`Failed to load '${provider}'`)
	  console.log(e);
    }
  }
  
  async returnActiveProvider(path=process.cwd() + '/providers.json') {
	  const config = JSON.parse(fs.readFileSync(path));
	  return this[config.active]();
  }
}
 