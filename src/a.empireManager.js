/*
 * Manages empire; potential features include central distribution of energy using terminals?
 */
var popControl = require('s.population');

var empireManager = {

    run: function(){

        manageCreepMemoryClearing();

        //creep spawning mechanism
        for(let spawnName in Game.spawns){
            popControl.run(Game.spawns[spawnName]);
        }
        
        if(Game.flags.claimFlag && !Memory.empire.colonyLaunchRoom)
            chooseRoomForColonyLaunch();
        
        if(Game.flags.demoFlag1 && !Memory.empire.demoSpawnRoom)
            chooseDemoSpawn();

        if(Game.cpu.bucket === 10000){
            Game.cpu.generatePixel();
        }
    }
}

function manageCreepMemoryClearing(){
    //memory management
    for(var name in Memory.creeps) {

        var deadCreepMemory = Memory.creeps[name];

        if(!Game.creeps[name]) {

            console.log('Clearing non-existing creep memory:', name);
            if(deadCreepMemory.role)
                try{clearCreepAssignments(deadCreepMemory);}catch(error){console.log(name + ": error clearing assignment")}

            if(deadCreepMemory.miningPos)
                Game.rooms[deadCreepMemory.home].memory.sourceAccessPoints.push(deadCreepMemory.miningPos);

            delete Memory.creeps[name];
        }
    }
}

function clearCreepAssignments(deadCreepMemory){
    switch(deadCreepMemory.role){
        case 'miner':
            Game.rooms[deadCreepMemory.home].memory.localSources[deadCreepMemory.assignment] = null;
            break;
        case 'remoteMiner':
            if(!deadCreepMemory.suicide && Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment.split(",")[2]].sources[deadCreepMemory.assignment.split(",")[0]+","+deadCreepMemory.assignment.split(",")[1]])
                Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment.split(",")[2]].sources[deadCreepMemory.assignment.split(",")[0]+","+deadCreepMemory.assignment.split(",")[1]] = null;
            break;
        case 'reserver':
            Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment].reserver = null;
            break;
        case 'remoteTransporter':
            Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment].transporter = null;
            break;
        case 'counterTerrorist':
            if(deadCreepMemory.suicide)
                Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment].distressSignal = null;
            else
                Game.rooms[deadCreepMemory.home].memory.remoteMining[deadCreepMemory.assignment].distressSignal = "SOS";
            break;
    }
}

//this function will spawn creeps at the correct room to
function chooseRoomForColonyLaunch(){
    let flag = Game.flags.claimFlag;

    let possibleSpawnRooms = _.filter(Game.rooms, function(r){return r.controller && r.controller.my && r.economyStatus >= ECON_STABLE;});

    let minDistance = 11;
    let spawnRoom;
    for(let i in possibleSpawnRooms){
        let distance = Game.map.getRoomLinearDistance(possibleSpawnRooms[i].name, flag.pos.roomName);
        if(distance < minDistance){
            minDistance = distance;
            spawnRoom = possibleSpawnRooms[i].name;
        }
    }

    if(spawnRoom){
        Memory.empire.colonyLaunchRoom = spawnRoom;
        Memory.empire.colonyRoomUnclaimed = true;
    }
    else
        console.log("No suitable spawn room for claimer");

}

function chooseDemoSpawn(){
    let flag = Game.flags.demoFlag1;

    let possibleSpawnRooms = _.filter(Game.rooms, function(r){return r.controller && r.controller.my && r.economyStatus >= ECON_STABLE;});

    let minDistance = 11;
    let spawnRoom;
    for(let i in possibleSpawnRooms){
        let distance = Game.map.getRoomLinearDistance(possibleSpawnRooms[i].name, flag.pos.roomName);
        if(distance < minDistance){
            minDistance = distance;
            spawnRoom = possibleSpawnRooms[i].name;
        }
    }
    if(spawnRoom)
        Memory.empire.demoSpawnRoom = spawnRoom;
    else
        console.log("No suitable spawn rooms for demo");
}

module.exports = empireManager;
