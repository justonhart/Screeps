var roleMouse = {
    run: function(creep){
        
        var flag = Game.flags.mouseFlag;
        
        if(creep.room.name != flag.pos.roomName){
            creep.moveTo(flag.pos, {reusePath: 50 , visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000});
            //creep.say("marching");
        }
        
        //lead
        else{
            
            let closest = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: c => {return c.getActiveBodyparts(ATTACK);}});
            if(creep.pos.getRangeTo(closest) > 5)
                creep.moveTo(closest);
            else
                creep.moveTo(closest,{flee: true});
        }
    }
}

module.exports = roleMouse;