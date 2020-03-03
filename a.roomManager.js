//Runs room specific tasks: manage population, sources, etc
var populationControl = require('s.population');

//operating mode key: 1 = prestorage, 2 = storage, 3 = eco
var roomManager = {
    operateRoom: function(room){
        
        if(!room.memory.localSources)
            initRoom(room);
        
        if(!room.memory.sourceAccessPoints)
            initSourceAccessPoints(room);
        
        checkOperatingMode(room);
        
        switch(room.operatingMode){
            case DIST_MODE:
                
                if(room.terminal)
                    manageTerminal(room);
                
                checkContingencies(room);
                if(room.find(FIND_MY_STRUCTURES, {filter: s => {return s.structureType == STRUCTURE_LINK;}})[0])
                    operateLinks(room);
                
                if(room.memory.remoteMining)
                    checkMiners(room);
                
                driveTowers(room);
                if(room.find(FIND_DROPPED_RESOURCES).length)
                    room.memory.droppedResources = true;
                else
                    room.memory.droppedResources = false;
                break;
            
            
            
            case HARV_MODE:
                
                checkContingencies(room);
                driveTowers(room);
                if(room.find(FIND_DROPPED_RESOURCES).length)
                    room.memory.droppedResources = true;
                else
                    room.memory.droppedResources = false;
                break;
            
            
            case ECO_MODE:
                
                checkContingencies(room);
                driveTowers(room);
                break;
        }
    }
};

function checkContingencies(room){

}

function checkMiners(room){
    for(let r in room.memory.remoteMining){
        for(let c in room.memory.remoteMining[r].sources){
            if((room.memory.remoteMining[r].sources[c] != "spawning" && room.memory.remoteMining[r].sources[c] != "SOS" ) && !Game.getObjectById(room.memory.remoteMining[r].sources[c]))
                room.memory.remoteMining[r].sources[c] = null;
        }
    }    
}

function manageTerminal(room){
    
    let myRooms = _.filter(Game.rooms, function (r) {return r.controller && r.controller.my && r.terminal && r.terminal.my;});
    let targetRoom = _.min(myRooms, function(r) {return r.storage.store[RESOURCE_ENERGY];});
    
    if(room.terminal.store[RESOURCE_ENERGY] > 25000 && !room.terminal.cooldown && room.terminal.store[room.mineral.mineralType] >= 30000 && Game.time%100 === 0){
        tradeOnMarket(room);
    }
    
    if(targetRoom.terminal.store[RESOURCE_ENERGY] < 200000 && targetRoom.storage.store[RESOURCE_ENERGY] < 500000 && room.economyStatus > ECON_SURPLUS && !room.terminal.cooldown && room.terminal.store[RESOURCE_ENERGY] >= 50000){
        console.log(room.name + ": sending energy to " + targetRoom.name + " = " + room.terminal.send(RESOURCE_ENERGY, 25000, targetRoom.name));
    }
    
}

function manageRemoteMining(room){
    checkDistressSignals(room);
    checkReservations(room);
}

function initRoom(room){
    let stuff = room.find(FIND_STRUCTURES);
    for(let i = 0; i < stuff.length; i++)
        if( !((stuff[i].structureType === STRUCTURE_STORAGE || stuff[i].structureType === STRUCTURE_TERMINAL) && _.sum(stuff[i].store)) && stuff[i].my === false)
            stuff[i].destroy();
    
    
    var sources = room.find(FIND_SOURCES);
    room.memory.localSources = {};
    for(var source in sources)
        room.memory.localSources[sources[source].id] = null;
    
    room.memory.remoteMining = {};
    room.memory.operatingMode = HARV_MODE;
}

function operateLinks(room){
    var receiverLink = room.storage.pos.findInRange(FIND_MY_STRUCTURES, 5, {filter: s => {return s.structureType == STRUCTURE_LINK;}})[0];
    var links = room.find(FIND_MY_STRUCTURES, {filter: s => {return s.structureType == STRUCTURE_LINK && !s.cooldown && s.energy}});
    let link = _.head(links);
    if(link && receiverLink.energy === 0)
        link.transferEnergy(receiverLink);
}

function initSourceAccessPoints(room){
    room.memory.sourceAccessPoints = [];
    let sources = room.find(FIND_SOURCES);
    for(let source in sources){
        for(let x = -1; x < 2; x++){
            for(let y = -1; y < 2; y++){
                if(room.lookForAt(LOOK_TERRAIN, sources[source].pos.x - x, sources[source].pos.y - y) != "wall")
                    room.memory.sourceAccessPoints.push((sources[source].pos.x - x) + "," + (sources[source].pos.y - y) +","+ room.name);
            }
        }
    }
}

function driveTowers(room){
        
    //first focus is enemy creeps: Healers then attackers
    var targets = room.find(FIND_HOSTILE_CREEPS);
    var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    
    if(targets.length){
        var healer = _.filter(targets, creep => creep.getActiveBodyparts(HEAL))[0];
        
        for(var towerID in towers){
            if(healer)
                towers[towerID].attack(healer);
            else
                towers[towerID].attack(targets[0]);
        }
    }
    
    
    //otherwise, repair
    else{
        
        targets = _.sortBy(room.find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 500)
        || (structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_WALL) && structure.hits < structure.hitsMax}}), s => s.hits);
        
        var i = 0;
        for(var towerID in towers){
            if(towers[towerID].energy > 500 && targets[i] && targets[i].hits < targets[i].hitsMax){
                towers[towerID].repair(targets[i]);
                if(targets[i].hitsMax === targets[i].hits)
                    i++;
            }
        }
    }
}

function checkOperatingMode(room){
    switch(room.operatingMode){
        case HARV_MODE:
            if(room.energyCapacityAvailable >= 750 && room.storage && room.storage.my && room.storage.store[RESOURCE_ENERGY] >= 10000)
                room.memory.operatingMode = DIST_MODE;
            break;
        case DIST_MODE:
            if(!room.storage || (room.energyAvailable < 300 && _.filter(Game.creeps, (creep) => (creep.memory.home === room.name)).length < 2))
                room.memory.operatingMode = HARV_MODE;
            break;
    }
}

function tradeOnMarket(room){
    let highestPriceOrder = _.max(Game.market.getAllOrders(order => order.price > RESOURCE_MIN_PRICE[room.mineral.mineralType] && order.resourceType === room.mineral.mineralType && order.type == ORDER_BUY && order.remainingAmount && Game.market.calcTransactionCost(Math.min(room.terminal.store[room.mineral.mineralType], order.remainingAmount), room.name, order.roomName) < room.terminal.store[RESOURCE_ENERGY]), function(order){return order.price});
    if(highestPriceOrder){
        console.log(room.name + ": Attempting to complete market order for " +  Math.min(room.terminal.store[room.mineral.mineralType], highestPriceOrder.remainingAmount) + " units of " + highestPriceOrder.resourceType + " at " +  (highestPriceOrder.price) + " per unit");
        let output = Game.market.deal(highestPriceOrder.id, Math.min(room.terminal.store[room.mineral.mineralType], highestPriceOrder.remainingAmount), room.name);
        if(output === 0)
            console.log("Total credits recieved: " + (Math.min(room.terminal.store[room.mineral.mineralType], highestPriceOrder.remainingAmount) * highestPriceOrder.price));
        else(output !== 0)
            console.log(output);
    }
}

module.exports = roomManager;
