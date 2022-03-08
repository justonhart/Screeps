//Move into an enemy room and starve it
var roleInvasionTank = {
    run: function(creep){
        
        var flag = Game.flags.tankFlag;
        
        //move to targeted room
        if(flag)
            creep.moveTo(flag.pos, {reusePath: 50 , visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000});
        
        //soak energy
        if(creep.hits /*< creep.hitsMax*/)
            creep.heal(creep);
    }
}

module.exports = roleInvasionTank;