require('prototype.room');
require('prototype.creep');
require('constants');

var flagCommands = require('x.flagCommands');
var driveCreep = require('s.creepDriver');
var empireManager = require('a.empireManager');
var roomManager = require('a.roomManager');
var popControl = require('s.population');

//const profiler = require('screeps-profiler');

//profiler.enable();
module.exports.loop = function () {
    //profiler.wrap(function(){
        
        
        try{tempCode();}catch(error){console.log("Error caught in temp code: " + error);}
        
        try{flagCommands.run();}catch(error){console.log("Error caught in flag commands : " + error);}
        try{empireManager.run();}catch(error){console.log("Error caught in empireManager : " + error);}
        
        //functions for rooms
        for(var roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(room.my){
                try{roomManager.operateRoom(room);}catch(error){console.log("Error caught in roomManager : " + error);}
            }
        }
        
        //creep control
        for(var name in Game.creeps){
           driveCreep.run(Game.creeps[name]);
        }
        
        //consoleCommands
        Game.consoleCommands = require('x.consoleCommands');
    //});
}

function tempCode(){
}