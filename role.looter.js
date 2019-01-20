//Game.spawns.Spawn1.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], "looter"+Game.time, {memory: {role: 'looter', home: Game.spawns.Spawn.room.name}})

var roleLooter = {
    run: function(creep){
        
        var containers = creep.room.find(FIND_STRUCTURES, {filter: (container) => {return container.structureType == STRUCTURE_CONTAINER && _.sum(container.store) > 0}});
        var flag = Game.flags.attackFlag;
        
        //return home and store
        
        if (_.sum(creep.carry) == creep.carryCapacity)
        {
            if(creep.room.name != creep.memory.home)
                creep.moveTo(Game.rooms[creep.memory.home].storage);
            else{
                for(const resourceType in creep.carry) {
                    if(creep.transfer(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE)
                        creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } 
        }
    
        //loot room
        else
        {
            if(creep.room.name != flag.pos.roomName)
                creep.moveTo(flag.pos);
            else
            {
                //first loot terminal
                if(creep.room.terminal && _.sum(creep.room.terminal.store) > 0){
                    for(const resourceType in creep.room.terminal.store) {
                        if(creep.withdraw(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE)
                            creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                
                //else look for dropped resource
                else if(creep.room.find(FIND_DROPPED_RESOURCES).length){
                    var groundResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                    if(creep.pickup(groundResource) == ERR_NOT_IN_RANGE)
                        creep.moveTo(groundResource);
                } 
                
                //then loot storage
                else if( creep.room.storage && _.sum(creep.room.storage.store) > 0){
                    for(const resourceType in creep.room.storage.store) {
                        if(creep.withdraw(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE)
                            creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                
                //then loot containers
                else if(containers.length){
                    for(const resourceType in containers[0].store) {
                        if(creep.withdraw(containers[0], resourceType) == ERR_NOT_IN_RANGE)
                            creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
    }
}

module.exports = roleLooter;