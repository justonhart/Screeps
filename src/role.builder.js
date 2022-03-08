var roleMason = require('role.mason');
var roleUpgrader = require('role.upgrader');
var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.gathering === false) {
            if(!creep.memory.target){
                let site = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: s=>{return s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART;}})[0];
                if(site)
                    creep.memory.target = site.id;
            }
            
            var target = Game.getObjectById(creep.memory.target);
            if(target) {
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
            else{
                creep.memory.target = null;
                //roleMason.run(creep);
            }
        }
        
        else {
            creep.gatherEnergy();
        }
    }
};

module.exports = roleBuilder;