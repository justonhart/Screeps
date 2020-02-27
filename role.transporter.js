//The transporter transports energy from containers upon which miners are standing to the room's storage


var roleTransporter = {
    run: function(creep){
        
        //find significant dropped resources or container with highest content
        if(!creep.memory.target){
            findTarget(creep);
        }
        
        var target = Game.getObjectById(creep.memory.target);
        
        
        //pick up resource
        if(target && !creep.memory.storing){
            
            //if not near target, move near target
            if(!creep.pos.isNearTo(target))
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            
            
            //if target is resource, pick it up
            else if(target instanceof Resource){
                switch(creep.pickup(target)){
                    case 0:
                    case ERR_INVALID_TARGET:
                        creep.memory.target = null;
                }
            }
            
            //if target is container, withdraw
            else if(target instanceof Structure || target instanceof Tombstone || target instanceof Ruin){
                switch(creep.withdraw(target, _.findKey(target.store, function(resource){return resource > 0}))){
                    case 0:
                    case ERR_NOT_ENOUGH_RESOURCES:
                    case ERR_INVALID_TARGET:
                        creep.memory.target = null;
                        break;
                }
            }
            
            else{
                creep.memory.target = null;
            }
            
            if(_.sum(creep.carry) > creep.carryCapacity / 2)
                creep.memory.storing = true;
        }
        
        //otherwise, store resource
        else{
            creep.memory.target = null;
            if(_.sum(Game.rooms[creep.memory.home].storage.store) < Game.rooms[creep.memory.home].storage.storeCapacity) {
                if(creep.transfer(Game.rooms[creep.memory.home].storage, _.findKey(creep.carry, function(resource){return resource > 0})) == ERR_NOT_IN_RANGE)
                    creep.moveTo(Game.rooms[creep.memory.home].storage, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            
            if(!_.sum(creep.carry))
                creep.memory.storing = false;
        }
    }
}

//search for loaded containers in room or adjacent to remote mining stations, or loose resources
function findTarget(creep){
    
    var containers = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {filter: (container) => {return container.structureType == STRUCTURE_CONTAINER}});
    
    if(creep.room.find(FIND_TOMBSTONES, {filter: t => {return _.sum(t.store);}}).length)
        creep.memory.target = Game.rooms[creep.memory.home].find(FIND_TOMBSTONES, {filter: t => {return _.sum(t.store);}})[0].id;

    else if(creep.room.find(FIND_RUINS, {filter: t => {return _.sum(t.store);}}).length)
        creep.memory.target = Game.rooms[creep.memory.home].find(FIND_RUINS, {filter: t => {return _.sum(t.store);}})[0].id;

    else if(containers.length)
        creep.memory.target =  _.max(containers, function(c) {return _.sum(c.store)}).id;
    
    else if(creep.room.memory.droppedResources && creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY && resource.amount >= creep.carryCapacity / 2 }})){
        creep.memory.target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: resource => {return resource.resourceType == RESOURCE_ENERGY && resource.amount >= creep.carryCapacity / 2 }}).id;
    }
}
    
module.exports = roleTransporter;