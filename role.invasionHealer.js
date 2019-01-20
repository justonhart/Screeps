var roleInvasionHealer = {
    run: function(creep){
        
        if(!creep.memory.invader){
            let searchCreep = creep.pos.findClosestByRange(FIND_CREEPS, {filter: s => {return s.memory.role === "invader";}});
            if(searchCreep)
                creep.memory.invader = searchCreep.id;
        }
        
        else{
            let invader = Game.getObjectById(creep.memory.invader);
            
            if(invader){
                if(!creep.pos.isEqualTo(invader.pos))
                    creep.moveTo(invader);
                
                if(invader.hits < invader.hitsMax){
                    if(creep.pos.isNearTo(invader)){
                        creep.heal(invader);
                    }
                    else
                        creep.rangedHeal(invader);
                }
                
                else
                    creep.heal(creep);
            }
            else if(creep.hits < creep.hitsMax)
                creep.heal(creep);
        }
    }
}

module.exports = roleInvasionHealer;