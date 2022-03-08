var roleColonizer = {
    run: function(creep){
        if(!creep.memory.claimed)
            voyage(creep);
        
        else{
            if(!creep.room.find(FIND_STRUCTURES, {filter: s => {return s.structureType === STRUCTURE_SPAWN}}).length)
                establishSpawn(creep);
            else{
                delete Memory.empire.colonyLaunchRoom;
                Game.flags.colonizeFlag.remove();
                creep.memory.role = 'harvester';
            }
        }
    }
};

function voyage(creep){
    let flag;
        
    let waypoint = "waypoint"+creep.memory.waypoint
    
    if(Game.flags[waypoint])
        flag = Game.flags[waypoint]
    else if(Game.flags.claimFlag)
        flag = Game.flags.claimFlag;
    else if(Game.flags.colonizeFlag)
        flag = Game.flags.colonizeFlag;
    
    
    if(flag){
        if(creep.room.name != flag.pos.roomName || flag == Game.flags[waypoint]){
            creep.moveTo(flag, {reusePath: 50, visualizePathStyle: {stroke: '#3BFF2B', opacity: 1}, maxOps: 10000});
            if(creep.pos.isNearTo(flag) && flag == Game.flags[waypoint])
                creep.memory.waypoint++;
        }
        
        else{
            if(creep.room.controller.my || creep.onEdge()){
                creep.moveTo(creep.room.controller);
                creep.memory.claimed = true;
                creep.memory.home = creep.room.name;
            }
        }
    }
}

function establishSpawn(creep){
    if(creep.memory.gathering === false) {
        if(!creep.memory.target){
            let site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            creep.memory.target = site.id;
        }
        
        var target = Game.getObjectById(creep.memory.target);
        if(target) {
            switch(creep.build(target)){
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                case ERR_INVALID_TARGET:
                    creep.memory.target = null;
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.memory.gathering = true;
                    break;
            }
        }
        else{
            creep.memory.target = null;
        }
    }
    
    else {
        gatherSupplies(creep);
    }
}

function gatherSupplies(creep){
    
    
    if(creep.room.memory.droppedResources && creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY && resource.amount >= creep.carryCapacity / 2 }})){
        let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY && resource.amount >= creep.carryCapacity / 2 }});
        if(creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE)
            creep.moveTo(droppedEnergy);
        else
            creep.memory.gathering = false;
    }
    
    else if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY]){
        switch(creep.withdraw(creep.room.storage, RESOURCE_ENERGY)){
            case ERR_NOT_IN_RANGE:
                creep.moveTo(creep.room.storage);
                break;
            case 0:
                creep.memory.gathering = false;
                break;
        }
    }
    
    else{
        if(!creep.memory.miningPos)
            creep.claimSourceAccessPoint();
        
        let miningPos = new RoomPosition(creep.memory.miningPos.split(",")[0], creep.memory.miningPos.split(",")[1], creep.memory.miningPos.split(",")[2]);
        if(creep.memory.miningPos){
            if(creep.pos.isEqualTo(miningPos))
                creep.harvest(creep.pos.findClosestByRange(FIND_SOURCES))
            else
                creep.moveTo(miningPos);
            
            if(creep.carry.energy === creep.carryCapacity || miningPos.findClosestByRange(FIND_SOURCES).energy === 0){
                creep.memory.gathering = false;
                creep.releaseSourceAccessPoint();
            }
        }
    }
}
module.exports = roleColonizer;