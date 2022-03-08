var counterTerrorist = {
    run: function(creep){
        
        let posString = _.findKey(Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment].sources, function(c){return c != null});
        let dest = new RoomPosition(posString.split(",")[0], posString.split(",")[1], creep.memory.assignment);
        
        if(creep.room.name != creep.memory.assignment)
            creep.moveTo(dest);
            
        else{
            let target = findTarget(creep);
            if(target){
                if(creep.pos.inRangeTo(target, 3))
                    creep.rangedAttack(target);
                
                if(!creep.pos.inRangeTo(target, 2))
                    creep.moveTo(target);
                
                creep.heal(creep);
            }
            else{
              cleanup(creep);
            }
        } 
    }
}

function findTarget(creep){
  let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if(!target && creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_INVADER_CORE}}).length){
    clearDistressSignal(creep);
    target = creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_INVADER_CORE}})[0];
  }
    

  return target;
}

function clearDistressSignal(creep){
  Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal = null;
  for(let source in Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].sources){
    if(Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].sources[source] === "SOS")
      Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].sources[source] = null;
  }
}

function cleanup(creep){
  clearDistressSignal(creep);
  creep.memory.suicide = true;
  creep.suicide();
}
module.exports = counterTerrorist;