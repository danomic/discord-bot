const Discord = require('discord.js');
const fs = require("fs");
const bot = new Discord.Client();

const token = 'NTc0Mjc0NTc0MzM0Njg5Mjgw.XM6mew.IK7lxDqsyuM-dzRMJRZoHjQcOic';

const PREFIX = '=';

bot.on('ready', () =>{
    console.log('This bot is online!');
});

bot.on('message', message => {

    let args = message.content.substring(PREFIX.length).split(" ");

    if(message.content[0] === PREFIX) {
        switch (args[0]) {
            case 'inventory':
            case 'i':
                show(message.member.toString());
                break;
            case 'add':
            case 'a':
                let itemAdd = args[1];

                if (itemAdd != null) {
                    addItem(message.member.toString(), itemAdd);
                    message.channel.sendMessage("```"+itemAdd + " was added to your inventory"+"```");
                } else {
                    message.channel.sendMessage("```"+"nothing to add: 'add <item>'"+"```");
                }

                break;
            case 'remove':
            case 'r':
                let itemRemove = args[1];
                if (itemRemove != null) {
                    message.channel.sendMessage("```"+removeItem(message.member.toString(), itemRemove)+"```");
                } else {
                    message.channel.sendMessage("```"+"nothing to remove: 'remove <item>'"+"```");
                }
                break;
            case 'clear':
                clearInventory(message.member.toString());
                break;
            case 'create':
                create(message.member.toString());
                break;
        }
    }

    function create(user){
        fs.readFile('botUsers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                let users = JSON.parse(data);
                let found = false;
                for( let i = 0; i < users.users.length; i++){
                    if (users.users[i].id === user) {
                        found = true;
                        message.channel.sendMessage("```"+"inventory already exists"+"```");
                    }
                }
                if(!found){
                    users.users.push({id: user, inventory:[]});
                    message.channel.sendMessage("```"+"created inventory"+"```");
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
                            items += inventar[i] + '\n';
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
