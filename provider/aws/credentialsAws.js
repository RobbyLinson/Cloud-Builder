import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import read from 'readline';

const filePath = os.homedir();

async function createObjectForIni (){
    const readLine = read.Interface({
        input:process.stdin,
        output:process.stdout
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


async function writeFileAsync(path,data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(path,data,(err)=>{
            if(err){
                reject(err);
            } else{
                resolve();
            }
        });
    });
}

async function populateAwsFolder(){
    try{
        const arr= await createObjectForIni();
        const awsFilePath =filePath+(os.type()==='Windows_NT' ? "\\.aws\\" : "/.aws/"); //what os type
        let duplicateArr = ["[default]","aws_access_key_id=","aws_secret_access_key="];
        for(let i =0; i<arr.length; i++)
        {
            duplicateArr[i+1]=duplicateArr[i+1] + arr[i];
        }
        const outputString = duplicateArr.join("\n");
        await writeFileAsync(awsFilePath+"credentials",outputString);
        const stringToConfig="[default]\nregion=eu-west-1";
        await writeFileAsync(awsFilePath+"config",stringToConfig);
    } catch {
        console.error("Error while populating AWS folder.");
    }
}

async function createAwsFolder(){
    const folderPath = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
    fs.mkdir(folderPath,(err)=>{
        if(err) return console.error(err);
    });
}

export async function checkAwsFolder()
{ 
		const files = await fsp.readdir(filePath);
        let exists = false;
        for await (const val of files)
        {
            if(val == '.aws') exists = true;
        }
        if(!exists)
        {
            await createAwsFolder();
            await populateAwsFolder();
        }
        else
        {
            const awsFolderPath = filePath + (os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
            const filesInAws = await fsp.readdir(awsFolderPath);
			
            let config = false;
            let cred = false;
			
            for await (const val of filesInAws)
            {
                if(val == 'credentials') cred = true;
                else if (val == 'config') config = true;
            }
			
            if(!cred && !config) await populateAwsFolder();
        }
}

export async function getCredentials() {
    const awsFolderPath = filePath + (os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
	var credentials = {};
	var files = ['credentials', 'config'];
    for (const val of files)
    {
		const stream = await fs.createReadStream(awsFolderPath + '/' + val);
		const rl = await read.createInterface({
			input: stream,
			crlfDelay: Infinity
		});
			
		for await (const line of rl) {
			let keyvalue = line.split('=');
			switch (keyvalue[0]) {
				case 'aws_access_key_id':
					credentials.accessKeyId = keyvalue[1]; 
					break;
				case 'aws_secret_access_key':
					credentials.secretAccessKey = keyvalue[1];
					break;
				case 'region':
					credentials.region = keyvalue[1];
					break;
				default:
					break;
			}
		}
    }
	return credentials;
}