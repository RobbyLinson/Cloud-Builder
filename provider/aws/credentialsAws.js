import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import read from 'readline';

const filePath = os.homedir() + (os.type()==='Windows_NT' ? "\\.aws\\" : "/.aws/");

async function createObjectForIni (){
    const readLine = read.Interface({
      input:process.stdin,
      output:process.stdout,
		terminal: false
    });
    let questionArr = [];

    function askQuestion(query)
    {
      return new Promise(resolve =>{
        readLine.question(query,response=>{
          questionArr.push(response);
          resolve();
        });
      });
    }
    await askQuestion('What is your AWS key? ');
    await askQuestion('What is your AWS secret key? ');
    readLine.close();
    return questionArr;
}

async function populateAwsFolder(userId) {
  try{
    const arr= await createObjectForIni();
    let duplicateArr = [`\n\n[${userId}]`, "aws_access_key_id=", "aws_secret_access_key="];
    for(let i =0; i<arr.length; i++){
      duplicateArr[i+1]=duplicateArr[i+1] + arr[i];
    }
    const outputString = duplicateArr.join("\n");
    await fsp.writeFile(filePath + "credentials", outputString + "\n", { flag: 'a' });
    const stringToConfig = `\n\n[${userId}]\nregion=eu-west-1\n`;
    await fsp.writeFile(filePath + "config", stringToConfig, { flag: 'a' });
  } catch {
    console.error("Error while populating AWS folder.");
  }
}

async function createAwsFolder() {
	await fsp.mkdir(filePath).catch(function() {
		console.log('Failed to create AWS credentials directory.'); 
	}); 
	await fsp.writeFile(filePath + '/credentials', "");
	await fsp.writeFile(filePath + '/config', "");
}

async function checkUserExists(userId) {
	const stream = await fs.createReadStream(filePath + '/config');
	const rl = await read.createInterface({
		input: stream,
		crlfDelay: Infinity
	});

	const userIdLine = '[' + userId + ']';
	for await (const line of rl) {
		if (line === userIdLine) return;
	}
	await populateAwsFolder(userId);
}

export async function checkAwsFolder(userId) {
	try{
		await fsp.access(filePath);
	} catch(e){
		await createAwsFolder();
	}
	await checkUserExists(userId);
}

export async function getCredentials(userId) {
	var credentials = {};
	var files = ['credentials', 'config'];
	
	const userIdLine = '[' + userId + ']';
	
    for (const val of files){
			const stream = await fs.createReadStream(filePath + '/' + val);
			const rl = await read.createInterface({
				input: stream,
				crlfDelay: Infinity
			});
		
			var correctUser = false;
			var valsRead = 0;
		
			readloop:
			for await (const line of rl) {
				if (line[0] == '[') {
					if (line === userIdLine) correctUser = true;
				}
				else if (correctUser) {
					let keyvalue = line.split('=');
					switch (keyvalue[0]) {
						case 'aws_access_key_id':
							credentials.accessKeyId = keyvalue[1];
						
							if (valsRead == 1) break readloop;
							valsRead++;
						
							break;
						case 'aws_secret_access_key':
							credentials.secretAccessKey = keyvalue[1];
						
							if (valsRead == 1) break readloop;
							valsRead++;
						
							break;
						case 'region':
							credentials.region = keyvalue[1];
							break readloop;
						default:
							break;
					}
				}
			}
    }
	return credentials;
}