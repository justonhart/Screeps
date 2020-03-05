var roleClaimer = {
    run: function(creep) {
        
        if(creep.memory.claimed){
            
            if(Game.flags.colonizeFlag.pos.createConstructionSite(STRUCTURE_SPAWN) === 0);
                creep.suicide();
        }
        else{
            let flag;
            
            let waypoint = "waypoint"+creep.memory.waypoint
            
            if(Game.flags[waypoint])
                flag = Game.flags[waypoint]
            else
                flag = Game.flags.claimFlag;
            
            if (flag) {
                
                if (creep.pos.roomName != flag.pos.roomName || flag == Game.flags[waypoint]){
                    creep.moveTo(flag, {reusePath: 50, visualizePathStyle: {stroke: '#3BFF2B', opacity: 1}, maxOps: 10000});
                    if(creep.pos.isNearTo(flag) && flag == Game.flags[waypoint])
                        creep.memory.waypoint++;
                }
                    
                else {
                    var target = creep.room.controller;
                    
                    if(!creep.pos.isNearTo(target)) 
                        creep.moveTo(target);
                    else if(target.owner && !target.my)
                        creep.say(creep.attackController(target));
                    else{
                        creep.claimController(target);
                        var newFlagPos = Game.flags.claimFlag.pos;
                        Memory.rooms[creep.room.name] = {};
                        Game.flags.claimFlag.remove();
                        newFlagPos.createFlag("colonizeFlag");
                        delete Memory.empire.colonyRoomUnclaimed;
                        creep.memory.claimed = true;
                    }
                }
            }
        }
    }
};

module.exports = roleClaimer;