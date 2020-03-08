//Game.spawns.Spawn1.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],"invader"+Game.time, {memory: {role: 'invader', home: Game.spawns.Spawn.room.name}})
//Game.spawns.Spawn1.spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],"turtle"+Game.time, {memory: {role: 'invader', home: Game.spawns.Spawn.room.name}})
var roleInvader = {
    run: function(creep){
        
        var flag = Game.flags.attackFlag;
        
        if(!creep.memory.healer){
            let searchCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: s => {return s.memory.role === "invasionHealer";}});
            if(searchCreep)
                creep.memory.healer = searchCreep.id;
        }
        
        let healer = Game.getObjectById(creep.memory.healer);
        
        //if there is a healer, stay near the healer
        if(flag && (creep.pos.isNearTo(healer) || creep.onEdge())){
            
            //move to targeted room
            if(creep.room.name != flag.pos.roomName){
                    creep.moveTo(flag.pos, {reusePath: 50 , visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000});
                    //creep.say("marching");
            }
            
            //attack
            else{
                
                
                var flagStructs = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
                if(flagStructs.length){
                    if (creep.attack(flagStructs[0]) == ERR_NOT_IN_RANGE) 
                        creep.moveTo(flagStructs[0]);
                }
                
                else{
                    //creep.say("I'm sorry", true);
                    var target = findTarget(creep);
                    if(target){
                        creep.attack(target);
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#e62712'}});
                    }
                    
                    else{
                        creep.moveTo(flag);
                        //if(Game.flags.attackFlag)
                          //  Game.flags.attackFlag.remove();
                        //if(Game.flags.tankFlag)
                            //Game.flags.tankFlag.remove();
                    }
                }
            }
        }
        else{
            //creep.moveTo(creep.room.controller);
            //if(creep.pos.isNearTo(creep.room.controller))
                //creep.signController(creep.room.controller, "Room cleared by jhart22's champion " + creep.name);
        }
    }
}

function findTarget(creep){
    let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS,  {filter: function(object) {return object.getActiveBodyparts(ATTACK) + object.getActiveBodyparts(HEAL) && !object.onEdge();}});
    if(target)
        return target;
    
    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES,  {filter: function(object) {return object.structureType == STRUCTURE_TOWER;}});
    if(target)
        return target;
    
    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES,  {filter: function(object) {return object.structureType == STRUCTURE_SPAWN;}});
    if(target)
        return target;
    
    target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target)
        return target;
    
    return false;
}
module.exports = roleInvader;