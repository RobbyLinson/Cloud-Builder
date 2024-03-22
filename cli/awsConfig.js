import fs from 'fs';
import os from 'os';
import read from 'readline';

const filePath = os.homedir();

function readDir(filePath,callback){
    fs.readdir(filePath,(err,file) =>{
        if(err)
        {
            console.error("Error while reading directory: ",err)
            callback([]);
        }
        callback(file);
    });
}

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

function createAwsFolder(){
    const folderPath = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
    fs.mkdir(folderPath,(err)=>{
        if(err)
        {
            return console.error(err);
        }
    });
}

export async function checkAwsFolder()
{ 
    readDir(filePath,function(files){
        let exists = false;
        for(const val of files)
        {
            if(val == '.aws')
            {
                exists = true;
            }
        }
        if(!exists)
        {
            createAwsFolder();
            populateAwsFolder();
        }
        else
        {
            const awsFolderPath = filePath + (os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
            readDir(awsFolderPath, function(filesInAWS){
                let config = false;
                let cred = false;
                for (const val of filesInAWS)
                {
                    if(val == 'credentials')
                    {
                        cred = true;
                    }
                    else if (val == 'config')
                    {
                        config = true;
                    }
                }
                if(!cred && !config)
                {
                    populateAwsFolder();
                }
            });
        }
    });
}
