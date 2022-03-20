var roleMason = require('role.mason');
var roleUpgrader = require('role.upgrader');
var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.gathering === false) {
            if(!creep.memory.target){
                creep.memory.target = findTarget(creep);
            }
            
            var target = Game.getObjectById(creep.memory.target);
            if(target instanceof ConstructionSite) {
                switch(creep.build(target)){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        break;
                    case ERR_INVALID_TARGET:
                        creep.memory.target = null;
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.gathering = true;
                        break;
                }
            }
            else if(target instanceof Structure){
                switch(creep.repair(target)){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff9900', opacity: .5}});
                        break;
                    case ERR_INVALID_TARGET:
                        delete creep.memory.targetId;
                        break;
                }
            }
            else{
                creep.memory.target = null;
            }
        }
        
        else {
            creep.gatherEnergy();
        }
    }
};

function findTarget(creep){
    let sites = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: s=>{return s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART;}});
    if(sites.length){
        sites.sort((a,b) => b.progress - a.progress);
        return sites[0].id;
    }

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

module.exports = roleBuilder;