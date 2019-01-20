var roleDemo = {
    run: function(creep) {
        
        //disabling this for time being bc i don't care about energy
        if(0 && creep.carry.energy == creep.carryCapacity){
            
            if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                creep.moveTo(creep.room.storage);
        }
        
        else{
            let flag = Game.flags.demoFlag1;
            
            if (flag) {
                if (creep.pos.roomName != flag.pos.roomName) 
                    creep.moveTo(flag, {reusePath: 50, maxOps: 10000});
                
                else {
                    var target = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
                    if (creep.dismantle(target[0]) == ERR_NOT_IN_RANGE) 
                        creep.moveTo(target[0]);
                }
            }
            else
                delete Memory.empire.demoSpawnRoom;
        }
	}
}

module.exports = roleDemo;