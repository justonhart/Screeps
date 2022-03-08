//Game.spawns.Spawn.spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], "mb"+Game.time, {memory: {role: 'mobileBuilder', home: Game.spawns.Spawn.room.name}})

var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleMobileBuilder = {
    run: function(creep){
        
        var flag = Game.flags.buildFlag;
        
        
        if (creep.carry.energy > 0)
        {
            if(flag.room && creep.room.name != flag.room.name)
                creep.moveTo(flag);
            else if(creep.room.find(FIND_CONSTRUCTION_SITES).length != 0)
                    roleBuilder.run(creep);
        }
        
        
        
        else
        {
            if(creep.room.name != creep.memory.home)
                creep.moveTo(Game.rooms[creep.memory.home].storage);
            else
            {
                if((creep.room.energyAvailable > creep.room.energyCapacityAvailable / 2) || creep.room.storage.store[RESOURCE_ENERGY] > creep.room.energyCapacityAvailable){
                    if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        creep.moveTo(creep.room.storage);
                }
            }
        }
    }
}

module.exports = roleMobileBuilder;