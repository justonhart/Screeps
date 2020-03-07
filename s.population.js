/*  This module contains the code to automagically spawn creeps to replace expired ones*/
var popControl = {
    
    run: function(spawn){
        
        if(!spawn.spawning){
            switch(spawn.room.operatingMode){
                case HARV_MODE:
                    preStorageSpawning(spawn);
                    break;
                case DIST_MODE:
                    storageSpawning(spawn);
                    break;
                case ECO_MODE:
                    ecoSpawning(spawn);
                    break;
            }
        }   
    }
};



function preStorageSpawning(spawn){
    
    const NUM_HARVESTERS = 3;
    const NUM_UPGRADERS = calculateUpgraders(spawn);
    const NUM_MASONS = 1;
    const NUM_BUILDERS = calculateBuilders(spawn);
    
    //highest number of body part sets for auto creeps
    var creepLevelCap = 5;
    
    //Calculate which role we need to spawn
    var roleString;
    
    if(_.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.home === spawn.room.name).length < NUM_HARVESTERS)
        roleString = 'harvester';
    
    else if(_.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader'  && creep.memory.home === spawn.room.name).length < NUM_UPGRADERS){
        roleString = 'upgrader';
        if(spawn.room.controller.level === 8){
            creepLevelCap = 10;
            upgraderNum = 1;
        }
    }
    
    else if(spawn.room.find(FIND_STRUCTURES, {filter: structure => {return structure.structureType === STRUCTURE_TOWER}}).length == 0
    && !(_.filter(Game.creeps, (creep) => creep.memory.role === 'maintenance' && creep.memory.home === spawn.room.name).length))
        roleString = 'maintenance';
    
    else if(spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL}}).length && (_.filter(Game.creeps, (creep) => (creep.memory.role === 'builder' && creep.memory.home === spawn.room.name)).length < NUM_BUILDERS))
        roleString = 'builder';
    
    else if((_.filter(Game.creeps, (creep) => (creep.memory.role === 'mason' && creep.memory.home === spawn.room.name)).length < NUM_MASONS)
    && (spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}}).length || spawn.room.find(FIND_STRUCTURES, {filter: s => {return (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < spawn.room.getDefHP()}}).length))
        roleString = 'mason';
    
    else if(spawn.room.controller.sign && !_.filter(Game.creeps, (creep) => creep.memory.role === 'signer' && creep.memory.home === spawn.room.name).length)
        spawn.spawnCreep([MOVE], "signer "+ spawn.room.name, {memory: {role: 'signer', home: spawn.room.name}});
    
    if(roleString){
        //calculate parts to use for creeps
        let partsArray = [];
        let partsBlock = [WORK, CARRY, MOVE];
        
       /*Since the cost of WORK, CARRY, MOVE is 200, find the number of those sets that can be put onto one creep*/
        for(let i = 0; i < Math.floor(spawn.room.energyCapacityAvailable / 200) && i < creepLevelCap; i++)
            partsArray = partsArray.concat(partsBlock);
        
        //spawn the creep
        let result = spawn.spawnCreep(partsArray, "Creep "+Game.time, {memory: {role: roleString, home:spawn.room.name}}); 
        
        
        //if there are no harvesters, and there is not enough energy to spawn one
        if(result === ERR_NOT_ENOUGH_ENERGY && roleString === "harvester"){
            let roomCreeps = _.filter(Game.creeps, creep => creep.memory.home === spawn.room.name && creep.memory.role !== "harvester" && creep.getActiveBodyparts(WORK));
            if(roomCreeps.length){
                let creepToConvert = _.max(roomCreeps, function(c){return c.getActiveBodyparts(WORK);});
                console.log(spawn.room.name+ ": converting creep "+creepToConvert.name+" to harvester");
                creepToConvert.memory.role = "harvester";
                creepToConvert.memory.target = null;
            }
            else if(!_.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.home === spawn.room.name).length){
                //spawn first available harvester
                partsArray = [];
                for(let i = 0; i < Math.floor(spawn.room.energyAvailable / 200) && i < creepLevelCap; i++)
                    partsArray = partsArray.concat(partsBlock);
                spawn.spawnCreep(partsArray, "EMERGENCY HARVESTER" + Game.time + " " + spawn.room.name, {memory: {role: "harvester", home:spawn.room.name}});
            }
        }
    }
}

function storageSpawning(spawn){
    
    const NUM_UPGRADERS = calculateUpgraders(spawn);
    const NUM_MASONS = calculateMasons(spawn);
    
    const NUM_BUILDERS = calculateBuilders(spawn);
    
    //highest number of body part sets for auto creeps, set this way to reduce chances of starving by making creeps too large
    var creepLevelCap = 8 * Math.min(_.size(spawn.room.memory.localSources) + _.size(spawn.room.memory.remoteMining), 2);
    
    //Calculate which role we need to spawn
    var roleString;
    
    if(!_.filter(Game.creeps, (creep) => creep.memory.role === 'distributor' && creep.memory.home === spawn.room.name).length){
        roleString = 'distributor';
        creepLevelCap = 10;
    }
    
    else if( _.filter(Game.creeps, (creep) => creep.memory.role === 'miner' && creep.memory.home === spawn.room.name).length < _.size(spawn.room.memory.localSources))
       spawnMiner(spawn);
    
    else if(!_.filter(Game.creeps, (creep) => creep.memory.role === 'transporter' && creep.memory.home === spawn.room.name).length){
        roleString = 'transporter';
        creepLevelCap = 10;
    }
    
    else if(spawn.room.name === Memory.empire.colonyLaunchRoom && Memory.empire.colonyRoomUnclaimed && !_.filter(Game.creeps, (creep) => creep.memory.role === 'claimer').length)
        spawn.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM], 'CLAIMER',{memory: {role: 'claimer', waypoint: 1}});
    
    else if(spawn.room.name === Memory.empire.colonyLaunchRoom && _.filter(Game.creeps, (creep) => creep.memory.role === 'colonizer').length < 2)
        spawn.spawnCreep([WORK, CARRY,  MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        'colonizer'+Game.time,{memory: {role: 'colonizer', waypoint: 1}});
    
    else if(_.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader'  && creep.memory.home === spawn.room.name).length < NUM_UPGRADERS){
        roleString = 'upgrader';
        if(spawn.room.controller.level === 8 ){
            creepLevelCap = 15;
        }
    }
    
    else if(spawn.room.name === Memory.empire.demoSpawnRoom && !_.filter(Game.creeps, (creep) => creep.memory.role === 'demo').length)
        roleString = 'demo';//spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK,WORK, WORK, WORK, WORK, MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], "demo"+Game.time, {memory: {role: 'demo'}});
    
    else if(spawn.room.find(FIND_STRUCTURES, {filter: structure => {return structure.structureType === STRUCTURE_TOWER}}).length == 0
    && !(_.filter(Game.creeps, (creep) => creep.memory.role === 'maintenance' && creep.memory.home === spawn.room.name).length))
        roleString = 'maintenance';
    
    else if(spawn.room.economyStatus >= ECON_RECOVERING && spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL}}).length && (_.filter(Game.creeps, (creep) => (creep.memory.role === 'builder' && creep.memory.home === spawn.room.name)).length < NUM_BUILDERS))
        roleString = 'builder';
        
    else if((_.filter(Game.creeps, (creep) => (creep.memory.role === 'mason' && creep.memory.home === spawn.room.name)).length < NUM_MASONS)
    && (spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}}).length || spawn.room.find(FIND_STRUCTURES, {filter: s => {return (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < spawn.room.getDefHP()}}).length))
        roleString = 'mason';
    
    else if(spawn.room.economyStatus >= ECON_STABLE && spawn.room.find(FIND_STRUCTURES, {filter: s => {return s.structureType == STRUCTURE_EXTRACTOR}}).length && spawn.room.find(FIND_MINERALS)[0].mineralAmount > 0
            && !_.filter(Game.creeps, (creep) => creep.memory.role == 'mineralMiner' && creep.memory.home == spawn.room.name).length && (!spawn.room.storage.store[spawn.room.mineral.mineralType] || spawn.room.storage.store[spawn.room.mineral.mineralType] < 100000))
        roleString = 'mineralMiner';
    
    
    else if(spawn.room.economyStatus > ECON_STARVING && _.findKey(spawn.room.memory.remoteMining, function(r){return r.distressSignal === "SOS";}))
        spawnCounterterrorist(spawn);
    
    else if(spawn.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}}).length && !_.filter(Game.creeps, (creep) => creep.memory.role === 'manager' && creep.memory.home === spawn.room.name).length)
        roleString = 'manager';
    
    else if(remoteMinerCheck(spawn))
       spawnRemoteMiner(spawn);
    
    else if(spawn.room.economyStatus > ECON_STARVING && checkReservers(spawn))
        spawnReserver(spawn);
    
    else if(spawn.room.economyStatus < ECON_OVERPRODUCING && remoteTransporterCheck(spawn))
        spawnRemoteTransporter(spawn);
    
    else if(spawn.room.controller.sign && !_.filter(Game.creeps, (creep) => creep.memory.role === 'signer' && creep.memory.home === spawn.room.name).length)
        spawn.spawnCreep([MOVE], "signer "+ spawn.room.name, {memory: {role: 'signer', home: spawn.room.name}});
    
    if(roleString){

      //calculate parts to use for creeps
      let partsArray = [];
      let partsBlock;
      
      switch(roleString){
          
          case 'mineralMiner':
            console.log(spawn.room.name + ": spawning mineral miner");
            partsBlock = [WORK, WORK, MOVE];
            break;
          case 'distributor':
          case 'transporter':
            partsBlock = [CARRY, CARRY, MOVE];
            break;
          case 'demo':
            partsBlock = [WORK, MOVE];
            break;
          case 'manager':
            spawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], roleString+Game.time, {memory: {role: roleString, home:spawn.room.name}});
            return;
          default:
            partsBlock = [WORK, CARRY, MOVE];
      }
      
      //calculate cost of parts block
      let partsBlockCost = 0;
      for(let p in partsBlock){
        switch(partsBlock[p]){
          case WORK:
            partsBlockCost += 100;
            break;
          case CARRY:
          case MOVE:
            partsBlockCost += 50;
            break;
          case ATTACK:
            partsBlockCost += 80;
            break;
          case RANGED_ATTACK:
            partsBlockCost += 150;
            break;
          case HEAL:
            partsBlockCost += 250;
            break;
          case CLAIM:
            partsBlockCost += 600;
            break;
          case TOUGH:
            partsBlockCost += 10;
            break;
        }
      }

      //construct creep parts based on energy capacity available
      for(let i = 0; i < Math.floor(spawn.room.energyCapacityAvailable / partsBlockCost) && i < creepLevelCap; i++)
          partsArray = partsArray.concat(partsBlock);
      
      
      let result = spawn.spawnCreep(partsArray, roleString+Game.time, {memory: {role: roleString, home:spawn.room.name}});
      console.log(spawn.room.name + ":  " + roleString + " cost : " + partsBlockCost + ": "+ result);
      
      if(result === ERR_NOT_ENOUGH_ENERGY && roleString === "distributor" && !_.filter(Game.creeps, (creep) => creep.memory.role === 'transporter' && creep.memory.home === spawn.room.name).length){
          
          partsArray = [];
          for(let i = 0; i < Math.floor(spawn.room.energyAvailable / 200) && i < creepLevelCap; i++)
              partsArray = partsArray.concat(partsBlock);
          
          spawn.spawnCreep(partsArray, roleString+Game.time, {memory: {role: roleString, home:spawn.room.name}});
      }
    }
}

function ecoSpawning(spawn){
    
    var NUM_HARVESTERS;
    if(spawn.room.controller.level === 8)
        NUM_HARVESTERS = 1;
    else
        NUM_HARVESTERS = 2;

    const NUM_BUILDERS = 1;
    const NUM_MASONS = 1;
    const creepLevelCap = 15;
    
    let roleString;
    
    if(_.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.home === spawn.room.name).length < NUM_HARVESTERS)
        roleString = 'harvester';
    
    else if(spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL}}).length && (_.filter(Game.creeps, (creep) => (creep.memory.role === 'builder' && creep.memory.home === spawn.room.name)).length < NUM_BUILDERS))
        roleString = 'builder';
    
    else if((_.filter(Game.creeps, (creep) => (creep.memory.role === 'mason' && creep.memory.home === spawn.room.name)).length < NUM_MASONS)
    && (spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}}).length || spawn.room.find(FIND_STRUCTURES, {filter: s => {return (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < spawn.room.getDefHP()}}).length))
        roleString = 'mason';
    
    else if(spawn.room.find(FIND_STRUCTURES, {filter: structure => {return structure.structureType === STRUCTURE_TOWER}}).length == 0
    && !(_.filter(Game.creeps, (creep) => creep.memory.role === 'maintenance' && creep.memory.home === spawn.room.name).length))
        roleString = 'maintenance';
    
    if(roleString){
        //calculate parts to use for creeps
        let partsArray = [];
        let partsBlock = [WORK, CARRY, MOVE];
        
        if(spawn.room.memory.emergencySpawning){
            /*Since the cost of WORK, CARRY, MOVE is 200, find the number of those sets that can be put onto one creep*/
            for(let i = 0; i < Math.floor(spawn.room.energyAvailable / 200) && i < creepLevelCap; i++)
                partsArray = partsArray.concat(partsBlock);
        }
        else{
            /*Since the cost of WORK, CARRY, MOVE is 200, find the number of those sets that can be put onto one creep*/
            for(let i = 0; i < Math.floor(spawn.room.energyCapacityAvailable / 200) && i < creepLevelCap; i++)
                partsArray = partsArray.concat(partsBlock);
        }
        
        //spawn the creep
        let result = spawn.spawnCreep(partsArray, "Creep "+Game.time, {memory: {role: roleString, home:spawn.room.name}}); 

        
        //if there are no harvesters, and there is not enough energy to spawn one
        if(result === ERR_NOT_ENOUGH_ENERGY && roleString === "harvester"){
            let roomCreeps = _.filter(Game.creeps, creep => creep.memory.home === spawn.room.name && creep.memory.role !== "harvester");
            let creepToConvert = _.max(roomCreeps, function(c){return c.getActiveBodyparts(WORK);});
            if(creepToConvert !== -Infinity){
                console.log(spawn.room.name+ ": converting creep "+creepToConvert.name+" to harvester");
                creepToConvert.memory.role = "harvester";
                creepToConvert.memory.target = null;
            }
            else{
                //spawn first available harvester
                for(let i = 0; i < Math.floor(spawn.room.energyAvailable / 200) && i < creepLevelCap; i++)
                    partsArray = partsArray.concat(partsBlock);
                spawn.spawnCreep(partsArray, "EMERGENCY HARVESTER", {memory: {role: "harvester", home:spawn.room.name}});
                spawn.room.memory.emergencySpawning = true;
            }
        }
    }
    
}

function spawnMiner(spawn){
    let source = _.findKey(spawn.room.memory.localSources, s => {return s == null});
    if(source){
        if(spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], 'miner '+source, {memory: {role: 'miner', home:spawn.room.name, assignment: source}}) === 0){
            console.log(spawn.room.name + ": spawning miner for " + source);
            spawn.room.memory.localSources[source] = 'spawning';
        }
    }
}

function spawnRemoteMiner(spawn){
    let sourceString = findRemoteMinerAssignment(spawn);
    if(sourceString){
        if(spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'remoteMiner' + sourceString, {memory: {role: 'remoteMiner', home:spawn.room.name, assignment: sourceString}}) === 0){
            console.log(spawn.room.name + ": spawning miner for remote source at " + sourceString);
            spawn.room.memory.remoteMining[sourceString.split(",")[2]].sources[sourceString.split(",")[0]+","+sourceString.split(",")[1]] = 'spawning';
        }
    }
}

//in form: roomName/sourceId
function findRemoteMinerAssignment(spawn){
    
    //look through list of mining rooms for unassigned source
    for(let roomName in spawn.room.memory.remoteMining){
        for(let sourcePos in spawn.room.memory.remoteMining[roomName].sources){
            if(spawn.room.memory.remoteMining[roomName].sources[sourcePos] == null)
                return sourcePos+","+roomName;
        }
    }
    
    //if none found, return null
    return null;
}

function spawnRemoteTransporter(spawn){
    var roomAssignment =  _.findKey(spawn.room.memory.remoteMining, function(room) {return !room.transporter && !room.distressSignal && _.size(room.sources)});
    if(roomAssignment){
        
        //this is intended to serve as a way to increase the amount of sources we can have in a room, however we are capped by links
        let levelMod = 1;
        
        if(spawn.room.energyCapacityAvailable >= 2550)
            levelMod = Math.min(_.size(spawn.room.memory.remoteMining[roomAssignment].sources), 2);
        
        if(spawn.room.memory.remoteMining[roomAssignment].transporterLevel)
            levelMod = spawn.room.memory.remoteMining[roomAssignment].transporterLevel;
        
        //find appropriate size for transporter
        let creepLevelCap = 8 * levelMod;
        
        let numSources = _.size(spawn.room.memory.remoteMining[roomAssignment].sources);
        let parts = [WORK, MOVE];
        for(let i = 0; i < Math.floor(spawn.room.energyCapacityAvailable/150) && i < creepLevelCap; i++)
            parts = parts.concat([CARRY, CARRY, MOVE]);
        
        if(spawn.spawnCreep(parts , 'remoteTransporter ' + roomAssignment, {memory: {role: 'remoteTransporter', home:spawn.room.name, assignment: roomAssignment}}) === 0){
            console.log(spawn.room.name + ": spawning transporter for remote room: " + roomAssignment);
            spawn.room.memory.remoteMining[roomAssignment].transporter = 'alive';
        }
    }
}

function remoteMinerCheck(spawn){
    let minersCount = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteMiner' && creep.memory.home === spawn.room.name).length;
    let minersNeeded = 0;
    let minerNeeded = false;
    
    for(let roomName in spawn.room.memory.remoteMining){
        
        for(let sourceName in spawn.room.memory.remoteMining[roomName].sources){
            if(spawn.room.memory.remoteMining[roomName].sources[sourceName] === null)
                minerNeeded = true;
        }
    }
    
    return minerNeeded;
}

function remoteTransporterCheck(spawn){
    if(_.find(spawn.room.memory.remoteMining, function(r){return r.transporter === null && r.distressSignal == null;}))
        return true;
    return false;
}

function calculateBuilders(spawn){
    let constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL}});
    let workRemaining = 0;
    for(let i = 0; i < constructionSites.length; i++){
        workRemaining += (constructionSites[i].progressTotal - constructionSites[i].progress);
    }
    
    //find the amount of work needed divided by the total carry capacity of the builders
    //this number is approximately equivalent to the number of trips one builder would have to take to complete all remaining jobs
    let tripsRequired = Math.ceil(workRemaining / (50 * (spawn.room.energyCapacityAvailable / 200)));
    
    //we can divide this number by some X where X will be the number of trips we want per builder maximum
    return Math.min(Math.ceil(tripsRequired / 25), 3);
}

function calculateUpgraders(spawn){
    
    
    
    if(spawn.room.controller.level === 8)
        return 1;
    
    else if(spawn.room.operatingMode === HARV_MODE)
        return 2;
    
    let e = spawn.room.economyStatus;
    
    if(e === ECON_STARVING)
        return 0;
    else
        return e;
}

function calculateMasons(spawn){
    let e = spawn.room.economyStatus;
    
    if(e < ECON_RECOVERING)
        return 0;
    else if(e <= ECON_STABLE)
        return 1;
    else if(e > ECON_STABLE)
        return 2;
}

function spawnCounterterrorist(spawn){
    let miningRoom = _.findKey(spawn.room.memory.remoteMining, function(r){return r.distressSignal === "SOS";});
    
    if(spawn.spawnCreep([TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, HEAL, HEAL], "counterterrorist" + Game.time, {memory: {role: "counterTerrorist", home: spawn.room.name, assignment: miningRoom}}) === 0){
        console.log(spawn.room.name + ": spawning counterterrorist for " + miningRoom);
        spawn.room.memory.remoteMining[miningRoom].distressSignal = "Soldier Deployed";
    }
}

function checkReservers(spawn){
    let room = spawn.room;
    for(let miningRoom in room.memory.remoteMining){
        if(Game.rooms[miningRoom] && (!Game.rooms[miningRoom].controller.reservation || Game.rooms[miningRoom].controller.reservation.ticksToEnd < 500) 
        && !room.memory.remoteMining[miningRoom].distressSignal && !room.memory.remoteMining[miningRoom].reserver){
            return true;
        }
    }
    
    return false;
}

function spawnReserver(spawn){
    let miningRoom;
    
    for(let r in spawn.room.memory.remoteMining){
        if(Game.rooms[r] && ((!Game.rooms[r].controller.owner && !Game.rooms[r].controller.reservation) || Game.rooms[r].controller.reservation.ticksToEnd < 500) 
        && !spawn.room.memory.remoteMining[r].distressSignal && !spawn.room.memory.remoteMining[r].reserver){
            miningRoom = r;
            break;
        }
    }
    
    
    let partsArray = [];
    let partsBlock = [CLAIM, MOVE];
    for(let i = 0; i < Math.floor(spawn.room.energyCapacityAvailable/650) && i < 10; i++){
        partsArray = partsArray.concat(partsBlock);
    }
    
    if(spawn.spawnCreep(partsArray, "reserver " + miningRoom, {memory: {role: "reserver", home: spawn.room.name, assignment: miningRoom}}) === 0){
        console.log(spawn.room.name + ": spawning reserver for room " + miningRoom);
        spawn.room.memory.remoteMining[miningRoom].reserver = "alive";
    }
}

module.exports = popControl;