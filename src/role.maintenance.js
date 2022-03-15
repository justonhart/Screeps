var roleUpgrader = require('role.upgrader');
var roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.gathering === false) {

            if(creep.store[RESOURCE_ENERGY] === 0){
                creep.memory.gathering = true;
                creep.gatherEnergy();
            }

            else{
                if(!creep.memory.targetId || Game.getObjectById(creep.memory.targetId).hits === Game.getObjectById(creep.memory.targetId).hitsMax){
                    creep.memory.targetId = findTarget(creep);
                }

                let target = Game.getObjectById(creep.memory.targetId);

                switch(creep.repair(target)){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff9900', opacity: .5}});
                        break;
                    case ERR_INVALID_TARGET:
                        delete creep.memory.targetId;
                        break;
                }
            }
        }
	    else {
            creep.gatherEnergy();
        }
    }
};

/** @param {Creep} creep **/
function findTarget(creep){
    let myStructures = creep.room.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax && !(s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
    
    if(myStructures.length){
        //sort ascending by health ratio
        myStructures.sort((a,b) => (a.hits/a.hitsMax) - (b.hits/b.hitsMax));

        //take only the lowest ratio and find the closest target among them
        let slice = myStructures.filter(s => (s.hits / s.hitsMax) === (myStructures[0].hits / myStructures[0].hitsMax) )
        return creep.pos.findClosestByPath(slice).id;
    }

    let walls = creep.room.find(FIND_STRUCTURES).filter(s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < creep.room.getDefHP())
    if(walls.length){
        //sort by lowest hits
        walls.sort((a,b) => a.hits - b.hits);

        //take only the lowest ratio and find the closest target among them
        let slice = walls.filter(s => s.hits === walls[0].hits);
        return creep.pos.findClosestByPath(slice).id;
    }
}

module.exports = roleMaintenance;