var consoleCommands = {
    
    addSource: function(roomName, sourceString){
        
        var room = Game.rooms[roomName];
        
        var sourceRoom = sourceString.split("/")[0];
        var source = sourceString.split("/")[1];
        if(!room.memory.remoteMining[sourceRoom]){
            room.memory.remoteMining[sourceRoom] = {};
            room.memory.remoteMining[sourceRoom].sources = {};
            room.memory.remoteMining[sourceRoom].transporter = "no container";
        }
        
        room.memory.remoteMining[sourceRoom].sources[source] = null;
    }
}

global.clearFlags = function(){
    for(let name in Game.flags){
        console.log("Removing "+ name);
        Game.flags[name].remove();
    }
    return _.size(Game.flags) + " remaining";
}
;

global.mineralReport = function(){
  for(var roomName in Game.rooms){
    let room = Game.rooms[roomName];
    if(room.my){
        console.log(roomName + ": " + Game.rooms[roomName].mineral.mineralType);
    }
  }

  return 0;
}

global.flagReport = function(){
  for(var flag in Game.flags){
    console.log(flag)
  }

  return 0;
}

global.econReport = function(){
  for(var roomName in Game.rooms){
    let room = Game.rooms[roomName];
    if(room.my){
        console.log(roomName + ": " + Game.rooms[roomName].economyStatus);
    }
  }

  return 0;
}

global.clearEmpireMemory = function(){
  for(let m in Memory.empire){
    delete Memory.empire[m];
  }

  return 0;
}

global.setInvasionSpawn = function(name){
  Memory.empire.invasionSpawnRoom = name;

  return name;
}
module.exports = consoleCommands;