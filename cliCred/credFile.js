const fs = require('node:fs');
const os = require('os');

const filePath = os.homedir();
console.log(filePath + " and the opereating system is "+ os.type());

function readDir(filePath,callback){
    fs.readdir(filePath,(err,file) =>{
        console.log(filePath)
        if(err)
        {
            console.error("error occured",err)
            callback([]);
        }

        console.log("CURRENT FILES");
        callback(file);
    });
}

async function createObjectForIni (){
    const readLine = require('node:readline').Interface({
        input:process.stdin,
        output:process.stdout
    });
    let questionArr = [];

    function askQuestion(query)
    {
        return new Promise(resolve =>{
            readLine.question(query,response=>{
                console.log(response);
                questionArr.push(response);
                resolve();
            });
        });
    }
    await askQuestion('What is your AWS key? ');
    await askQuestion('What is your AWS secret key? ');

    return questionArr;
}

async function main(){
    const arr= await createObjectForIni();
    const awsFilePath =filePath+(os.type()==='Windows_NT' ? "\\.aws\\" : "/.aws/"); //what os type
    console.log(arr);
    console.log(awsFilePath);
    let duplicateArr = ["[default]","aws_access_key_id=","aws_secret_access_key="];
    for(let i =0; i<arr.length; i++)
    {
        duplicateArr[i+1]=duplicateArr[i+1] + arr[i];
    }
    const outputString = duplicateArr.join("\n");
    console.log(outputString);
    fs.writeFile(awsFilePath+"credentials.ini",outputString,(err)=>{
        if(err){
            console.error("something has happend when writing to the file");
        } else {
            console.log("We have printed values onto the file");
        }
    });
    const stringToConfig="[default]\nregion=eu-west-1\noutput=json";
    fs.writeFile(awsFilePath+"config.ini",stringToConfig,(err)=>{
        if(err){
            console.error("something has happend when writing to the file",err);
        } else {
            console.log("We have printed values onto the file");
        }
    });
}

function createAwsFoulder(){
    const creationOfFoldier = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
    fs.mkdir(createAwsFoulder,(err)=>{
        if(err)
        {
            return console.error(err);
        }
        console.log("success created the fouilder");
    });
}

async function checkAndPopulate()
{ 
    readDir(filePath,function(files){
        console.log(files);
        let exists = false;
        for(const val of files)
        {
            if(val == '.aws')
            {
                console.log("found");
                exists = true;
            }
        }
        if(!exists)
        {
            createAwsFoulder();
            main();
        }
        else
        {
            const awsFouilderPath = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
            readDir(awsFouilderPath,function(filesInAWS){
                console.log(filesInAWS);
                let config = false;
                let cred = false;
                for(const val of filesInAWS)
                {
                    if(val == 'credentials.ini')
                    {
                        cred = true;
                    }
                    else if (val == 'config.ini')
                    {
                        config=true;
                    }
                }
                if(!cred && !config)
                {
                    main();
                }
            });
        }
    });
}
checkAndPopulate();
