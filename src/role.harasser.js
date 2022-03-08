var roleHarasser = {
    run: function(creep){
        
        var flag = Game.flags.harassFlag;
        
        if(flag){
            
            //move to targeted room
            if(creep.room.name != flag.pos.roomName){
                    creep.moveTo(flag.pos, {reusePath: 50 , visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000});
                    //creep.say("marching");
            }
            
            //attack
            else
                harass(creep);
        }
        else if(creep.room.name !== creep.memory.home)
            harass(creep);
        
    }
}

function findTarget(creep){
    let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: c =>{return !c.onEdge();}});
    if(target)
        return target;
    
    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    if(target)
        return target;
    
    return false;
}

function harass(creep){
    if(!creep.memory.target){
        let t = findTarget(creep);
        creep.memory.target = t.id;
    }
    //creep.say("I'm sorry", true);
    let target = Game.getObjectById(creep.memory.target);
    if(target){
        
        creep.attack(target);
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        
        if(creep.pos.inRangeTo(target, 3))
            creep.rangedAttack(target);
    }
    
    else{
        delete creep.memory.target;
    }
}


module.exports = roleHarasser;