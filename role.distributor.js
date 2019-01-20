/*The function of the distributor is to take energy stored in containers (by harvesters) and distribute it to structures that need it as needed: spawns, spawn extensions, and towers*/

var roleTransporter = require('role.transporter');
var roleDistributor = {
    
    //tasks: 1 = distributing, 2 = picking up, 3 = storing
    run: function(creep){
        if(!creep.memory.task)
            findTask(creep);
        
        //creep.say(creep.memory.task);
        
        switch(creep.memory.task){
            //distribution
            case "distribute":
                distribute(creep);    
                break;
            case "store":
                storeLeftovers(creep);
                break;
            case "pickup":
                pickUp(creep);
                break;
            default:
                delete creep.memory.task;
        }
    }
};

function findTask(creep){
    //creep.say("finding Task");
    
    //if creep is carrying nonenergy resources, store them before doing primary task
    if(_.sum(creep.carry) && !creep.carry.energy){
        creep.memory.task = "store";
        return;
    }
        
    
    var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => {return (((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy < s.energyCapacity) || s.structureType == STRUCTURE_TOWER && s.energy < 700)}});
    if(target){
        creep.memory.target = target.id;
        creep.memory.task = "distribute";
        return;
    }
    
    //if the creep is carrying anything at all after distribution, store it before doing secondary tasks
    if(_.sum(creep.carry)){
        creep.memory.task = "store";
        return;
    }
    
    if(creep.room.memory.droppedResources && creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY;}})){
        creep.memory.target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY;}}).id;
        creep.memory.task = "pickup";
        return;
    }
}

function distribute(creep){
    
    var target = Game.getObjectById(creep.memory.target);
    if(creep.carry.energy){
        if(!creep.pos.isNearTo(target))
            creep.moveTo(target);
        else{
            creep.transfer(target, RESOURCE_ENERGY);
            creep.memory.task = null;
        }
    }
    else{
        
        if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY]){
            if(!creep.pos.isNearTo(creep.room.storage))
                creep.moveTo(creep.room.storage);
            
            else{
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                creep.moveTo(target);
            }
        }
        
        else if(creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY]){
            if(!creep.pos.isNearTo(creep.room.terminal))
                creep.moveTo(creep.room.terminal);
            
            else{
                creep.withdraw(creep.room.terminal, RESOURCE_ENERGY);
                creep.moveTo(target);
            }
        }
    }
}

function storeLeftovers(creep){
    if(!creep.pos.isNearTo(creep.room.storage))
        creep.moveTo(creep.room.storage);
    else{
        creep.transfer(creep.room.storage, _.findKey(creep.carry, function(resource){return resource > 0}));
    }
    if(!_.sum(creep.carry))
        creep.memory.task = null;
}

function pickUp(creep){
    let resource = Game.getObjectById(creep.memory.target);
    if(creep.pickup(resource) === ERR_NOT_IN_RANGE){
        creep.moveTo(resource);
    }
    else{
        delete creep.memory.target;
        delete creep.memory.task;
    }
}

module.exports = roleDistributor;