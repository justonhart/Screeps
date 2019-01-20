var roleUpgrader = require('role.upgrader');
var roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.gathering === false) {
            var targets =  _.sortBy(creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100)
            || (structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_WALL) && structure.hits < structure.hitsMax}}), s => s.hits);
            
            if(targets.length != 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) 
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else
                roleUpgrader.run(creep);
        }
	    else {
            creep.gatherEnergy();
        }
    }
};

module.exports = roleMaintenance;