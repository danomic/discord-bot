const Discord = require('discord.js');
const fs = require("fs");
const bot = new Discord.Client();

const PREFIX = '=';

bot.on('ready', () =>{
    console.log('This bot is online!');
});

bot.on('message', message => {

    let command = message.content.substring(PREFIX.length).split(" ", 1);
    let args = message.content.substring(PREFIX.length + command[0].length + 1).split(" -");

    if(message.content[0] === PREFIX) {
        switch (command[0]) {
            case 'inventory':
            case 'i':
                let user = args[0];
                if(user != null && user.length > 0 && isAdmin(message.member.id)){
                    showUser(user);
                } else {
                    show(message.member.id);
                }            
                break;
            case 'add':
            case 'a':
                let itemAdd = args[0];

                if (itemAdd != null && itemAdd.length > 0) {
                    addItem(message.member.id, itemAdd);
                    message.channel.sendMessage("```"+itemAdd + " was added to your inventory"+"```");
                } else {
                    message.channel.sendMessage("```"+"nothing to add: 'add <item>'"+"```");
                }

                break;
            case 'remove':
            case 'r':
                let itemRemove = args[0];
                if (itemRemove != null && itemRemove.length > 0) {
                    message.channel.sendMessage(removeItem(message.member.id, itemRemove));
                } else {
                    message.channel.sendMessage("```"+"nothing to remove: 'remove <item>'"+"```");
                }
                break;
            case 'clear':
                clearInventory(message.member.id);
                break;
            case 'create':
                create(message.member.id, message.member.displayName);
                break;
            case 'admin':
                let nickname = args[0];
                
                if(nickname != null && nickname.length > 0){
                    if(!isAdmin(message.member.id)){
                        message.channel.sendMessage("```"+"you don't have access to this command"+"```");
                    } else {
                        setAdmin(nickname);
                    }
                } else {
                    message.channel.sendMessage("```"+"no user provided: 'setAdmin <user>'"+"```");
                }
                break;
            case 'send':
                let nicknameM = args[0];

                if(nicknameM != null && nicknameM.length > 0){
                    if(!isAdmin(message.member.id)){
                        message.channel.sendMessage("```"+"you don't have access to this command"+"```");
                    } else {
                        if(args.length>=2){
                            let messageN = args[1];
                            if(nicknameM[0]='#'){
                                id = nicknameM.substring(1);
                                bot.users.get(id).send("```"+messageN+"```");
                            }else{
                                sendMessage(nicknameM, messageN);
                            }
                        } else {
                            message.channel.sendMessage("```"+"no message provided: 'send <user> -<message>'"+"```");
                        }
                    }
                } else {
                    message.channel.sendMessage("```"+"no user provided: 'send <user> -<message>'"+"```");
                }
                break;
            case 'users':
                if(!isAdmin(message.member.id)){
                        message.channel.sendMessage("```"+"you don't have access to this command"+"```");
                    } else {
                        let allUsers = ""; 
                        for (u of bot.users){
                        allUsers += '\n' + u[1].username + " : " + u[1].id;
                        }
                        message.channel.sendMessage("```"+allUsers+"```");
                    }
                break;
        }
    }

    function create(user, nickname){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);
                let found = false;
                let admin = users.users.length === 0;
                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        found = true;
                        message.channel.sendMessage("```"+"inventory already exists"+"```");
                    }
                }
                if(!found){
                    users.users.push({id: user, nickname: nickname, inventory:[], admin: admin});
                    message.channel.sendMessage("```"+"created inventory"+"```");
                    if(admin){
                        message.channel.sendMessage("```"+"you are now admin"+"```");
                    }
                }

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }
    
    function sendMessage(nickname, message){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);
                let found = false;
                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].nickname === nickname) {
                        found = true;
                        bot.users.get(users.users[i].id).send("```"+message+"```");
                    }
                }
                if(!found){
                    message.channel.sendMessage("```"+"could not find user "+nickname+"```");
                }

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }
    
    function setAdmin(nickname){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);
                let found = false;
                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].nickname === nickname) {
                        found = true;
                        users.users[i].admin = true;
                        bot.users.get(users.users[i].id).send("```"+"you are now admin"+"```");
                    }
                }
                if(!found){
                    message.channel.sendMessage("```"+"could not find user "+nickname+"```");
                }

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }

    function addItem(user, item){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);

                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        users.users[i].inventory.push(item);
                    }
                }

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }

    function removeItem(user, item){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);
                let msg = "item" + item + " is not in your inventory";
                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        let inventar = users.users[i].inventory;
                        for(let k = 0; k < inventar.length; k++){
                            if (inventar[k] === item) {
                                inventar.splice(k, 1);
                                msg = "removed " + item + " from your inventory";
                            }
                        }
                    }
                }
                message.channel.sendMessage("```"+msg+"```");

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }

    function show(user){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);

                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        let inventar = users.users[i].inventory;
                        let items = "";

                        for (let i = 0; i < inventar.length; i++) {
                            items += '\n' + inventar[i];
                        }
                        if(items.length > 0){
                            message.channel.sendMessage("```"+items+"```");
                        }else{
                            message.channel.sendMessage("```"+"your inventory is empty"+"```");
                        }
                    }
                }
            }});
    }
    
    function isAdmin(user){
        let rawdata = fs.readFileSync('botUsers.json'); 
        let users = JSON.parse(rawdata); 

        for( let i = 0; i < users.users.length; i++){
            if (users.users[i].id === user) {
                if(users.users[i].admin){
                    return true;
                }
             }
         }
        return false;
    }
    
    function showUser(user){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);

                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].nickname === user) {
                        let inventar = users.users[i].inventory;
                        let items = "";

                        for (let i = 0; i < inventar.length; i++) {
                            items += '\n' + inventar[i];
                        }
                        if(items.length > 0){
                            message.author.send("```"+items+"```");
                        }else{
                            message.author.send("```"+"the inventory is empty"+"```");
                        }
                    }
                }
            }});
    }

    function clearInventory(user){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);

                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        users.users[i].inventory = [];
                        message.channel.sendMessage("```"+"inventory cleared"+"```");
                    }
                }

                fs.writeFile("botUsers.json", JSON.stringify(users, null, 4), err => {
                    if(err) throw err;
                });
            }});
    }
});

bot.login(process.env.BOT_TOKEN);
