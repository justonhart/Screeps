var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep){
	    
	    if(creep.memory.gathering === false && creep.carry.energy){
            if(!creep.memory.target)
                findTarget(creep);
            
            let target = Game.getObjectById(creep.memory.target);
            if(target instanceof StructureExtension || target instanceof StructureTower || target instanceof StructureSpawn || target instanceof StructureStorage){
                switch(creep.transfer(target, RESOURCE_ENERGY)){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.gathering = true;
                    case 0:
                    case ERR_FULL:
                        creep.memory.target = null;
                        break;
                }
            }
            
            else if(target instanceof StructureController){
                if(creep.pos.getRangeTo(creep.room.controller) > 3)
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                else
                    creep.upgradeController(creep.room.controller);
            }
        }
        else{
            creep.memory.target = null;
            creep.gatherEnergy();
        }
	}
};

function findTarget(creep){
    var targets = creep.room.find(FIND_MY_STRUCTURES, { filter: structure => { return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity 
        || (structure.structureType == STRUCTURE_TOWER && structure.energy < 700)}});
    var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: structure => {return _.find(targets, structure)}});
    
    if(target)
        creep.memory.target = target.id;
    
    else if(creep.room.operatingMode != ECO_MODE && creep.room.storage && creep.room.storage.my)
        creep.memory.target = creep.room.storage.id;
    
    else
        creep.memory.target = creep.room.controller.id;
}
module.exports = roleHarvester;