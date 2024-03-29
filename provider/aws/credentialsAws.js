import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import read from 'readline';

const filePath = os.homedir() + (os.type()==='Windows_NT' ? "\\.aws\\" : "/.aws/");

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
        let duplicateArr = ["[default]","aws_access_key_id=","aws_secret_access_key="];
        for(let i =0; i<arr.length; i++)
        {
            duplicateArr[i+1]=duplicateArr[i+1] + arr[i];
        }
        const outputString = duplicateArr.join("\n");
        await writeFileAsync(filePath+"credentials",outputString);
        const stringToConfig="[default]\nregion=eu-west-1";
        await writeFileAsync(filePath+"config",stringToConfig);
    } catch {
        console.error("Error while populating AWS folder.");
    }
}

async function createAwsFolder(){
    fs.mkdir(filePath,(err)=>{
        if(err) return console.error(err);
    });
}

export async function checkAwsFolder(userId)
{ 
	//todo: implement users in this
	if (fs.existsSync(filePath)) {
		const filesInAws = await fsp.readdir(filePath);
		
		let config = false;
		let cred = false;
			
		for await (const val of filesInAws)
		{
			if(val == 'credentials') cred = true;
			else if (val == 'config') config = true;
		}
			
		if(!cred && !config) await populateAwsFolder();
	}
	else {
        await createAwsFolder();
		await populateAwsFolder();
    }
}

export async function getCredentials(userId) {
	var credentials = {};
	var files = ['credentials', 'config'];
	
	const userIdLine = '[' + userId + ']';
	
    for (const val of files)
    {
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