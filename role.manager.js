/*
 * This creep will maintain Terminal and Nuker inventories, and empty the adjacent link when necessary
 */

var roleManager = {
    run: function(creep){
        if(!creep.memory.link)
            init(creep);
        
        if(!creep.pos.isEqualTo(findManagerPos(creep))){
            creep.moveTo(findManagerPos(creep));
        }
        
        else{
            if(!creep.memory.task)
                findTask(creep);
            
            switch(creep.memory.task){
                case "manage link":
                    manageLink(creep);
                    break;
                case "manage terminal":
                    manageTerminal(creep);
                    break;
                case "manage nuker":
                    manageNuker(creep);
                    break;
            }
        }
    }
}

function init(creep){
    let linkSearch = creep.room.storage.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: s =>{return s.structureType == STRUCTURE_LINK;}});
    if(linkSearch.length)
        creep.memory.link = linkSearch[0].id;
}

function findManagerPos(creep){
    return new RoomPosition(
        (Game.getObjectById(creep.memory.link).pos.x + creep.room.storage.pos.x)/2,
        (Game.getObjectById(creep.memory.link).pos.y + creep.room.storage.pos.y)/2,
        creep.room.name
    );
}

function findTask(creep){
    if(Game.getObjectById(creep.memory.link).energy){
        creep.memory.task = "manage link";
        return;
    }
    
    if(creep.room.terminal && terminalCheck(creep)){
        creep.memory.task = "manage terminal"
        return;
    }
    
    if(creep.room.nuker && nukerCheck(creep)){
        creep.memory.task = "manage nuker";
        return;
    }
}

function manageLink(creep){
    
    let link = Game.getObjectById(creep.memory.link);
    
    if(creep.carry[RESOURCE_ENERGY]){
        creep.transfer(creep.room.storage, RESOURCE_ENERGY);
        delete creep.memory.task;
    }
    
    else if(link.energy)
        creep.withdraw(link, RESOURCE_ENERGY);
    
    else
        delete creep.memory.task;
}

function manageTerminal(creep){
    
    let terminal = creep.room.terminal;
    let storage = creep.room.storage;
    
    switch(terminalCheck(creep)){
        case "terminal needs mineral":
            if(creep.carry[creep.room.mineral.mineralType]){
                creep.transfer(terminal, creep.room.mineral.mineralType);
                delete creep.memory.task;
            }
            else
                creep.withdraw(storage, creep.room.mineral.mineralType);
            break;
        case "terminal needs energy":
            if(creep.carry[RESOURCE_ENERGY]){
                creep.transfer(terminal, RESOURCE_ENERGY);
                delete creep.memory.task;
            }
            else
                creep.withdraw(storage, RESOURCE_ENERGY, Math.min(50000 - terminal.store[RESOURCE_ENERGY], creep.carryCapacity));
            break;
        case "terminal has extra energy":
            if(creep.carry[RESOURCE_ENERGY]){
                creep.transfer(storage, RESOURCE_ENERGY);
                delete creep.memory.task;
            }
            else
                creep.withdraw(terminal, RESOURCE_ENERGY, Math.min(terminal.store[RESOURCE_ENERGY] - 50000, creep.carryCapacity));
            break;
        default:
            delete creep.memory.task;
    }
}

function manageNuker(creep){
    
    let nuker = creep.room.nuker;
    let storage = creep.room.storage;
    let terminal = creep.room.terminal;
    
    switch(nukerCheck(creep)){
        case "nuker needs energy":
            if(creep.carry[RESOURCE_ENERGY]){
                creep.transfer(nuker, RESOURCE_ENERGY);
                delete creep.memory.task;
            }
            else
                creep.withdraw(storage, RESOURCE_ENERGY, Math.min(nuker.energyCapacity - nuker.energy, creep.carryCapacity));
            break;
        case "nuker needs ghodium":
            if(creep.carry[RESOURCE_GHODIUM]){
                creep.transfer(nuker,RESOURCE_GHODIUM);
                delete creep.memory.task;
            }
            else
                creep.withdraw(terminal, RESOURCE_GHODIUM,Math.min(nuker.ghodiumCapacity - nuker.ghodium, creep.carryCapacity));
            break;
        default:
            delete creep.memory.task;
    }
}


function terminalCheck(creep){
    let terminal = creep.room.terminal;
    
    let terminalNeedsMineral = (!terminal.store[creep.room.mineral.mineralType] || terminal.store[creep.room.mineral.mineralType] < 100000);
    let terminalNeedsEnergy = terminal.store[RESOURCE_ENERGY] < 50000;
    let terminalHasExtraEnergy = terminal.store[RESOURCE_ENERGY] > 50000;
    
    let roomHasMineral = creep.room.storage.store[creep.room.mineral.mineralType] || creep.carry[creep.room.mineral.mineralType];
    let roomHasEnergy = creep.room.economyStatus >= ECON_STABLE;
    let roomNeedsEnergy = creep.room.economyStatus <= ECON_STABLE;
    
    if(_.sum(terminal.store) < 250000 && roomHasMineral && terminalNeedsMineral)
        return "terminal needs mineral";
    
    else if(_.sum(terminal.store) < 250000 && (roomHasEnergy && terminalNeedsEnergy))
        return "terminal needs energy"
    
    else if(terminalHasExtraEnergy && roomNeedsEnergy)
        return "terminal has extra energy"
    
    else
        return false;
}

function nukerCheck(creep){
    let nuker = creep.room.nuker;
    let terminal = creep.room.terminal;
    
    let nukerNeedsEnergy = nuker.energy < nuker.energyCapacity;
    let nukerNeedsGhodium = nuker.ghodium < nuker.ghodiumCapacity;
    
    let roomHasEnergy = creep.room.economyStatus >= ECON_STABLE;
    let terminalHasGhodium = terminal.store[RESOURCE_GHODIUM] || creep.carry[RESOURCE_GHODIUM];
    
    if(nukerNeedsEnergy && roomHasEnergy)
        return "nuker needs energy";
    
    else if(nukerNeedsGhodium && terminalHasGhodium)
        return "nuker needs ghodium";
    
    else 
        return false;
}

module.exports = roleManager;

