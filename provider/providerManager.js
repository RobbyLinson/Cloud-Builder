
import fs from 'fs';
import { pathToFileURL } from 'url'
 
export class ProviderManager {
	 
  async loadProviderConfig(path=process.cwd() + '/providers.json') {
    const config = JSON.parse(fs.readFileSync(path));
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
}
 