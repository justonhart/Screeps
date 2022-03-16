var roleMason = {
    run: function(creep){
        if(creep.memory.gathering === false){
            
            if(!creep.memory.target)
                findTarget(creep);
            
            let target = Game.getObjectById(creep.memory.target);
            if(target){
                if(creep.pos.getRangeTo(target) > 3 || creep.onEdge())
                    creep.moveTo(target);
                else
                    if(target instanceof Structure)
                        creep.repair(target);
                    else if(target instanceof ConstructionSite)
                        creep.build(target);
                
                if(creep.carry.energy === 0){
                    creep.memory.gathering = true;
                    creep.memory.target = null;
                }
            }
            else{
                let newStructures = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: s => s.hits == 1});
                if(newStructures.length){
                    creep.memory.target = newStructures[0].id;
                }
            }
        }
        else{
            creep.gatherEnergy();
        }
    }
};

function findTarget(creep){
    
    if(creep.room.find(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}}).length)
        creep.memory.target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: s => {return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}}).id;
    
    else{
        let defenses = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {filter: (defense) => {return defense.structureType === STRUCTURE_WALL || defense.structureType === STRUCTURE_RAMPART}});
        creep.memory.target =  _.min(defenses, function(defense) {return defense.hits}).id;
    }
}

module.exports = roleMason;