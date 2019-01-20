var linkManager = {
    run: function(creep){
        if(!creep.memory.link)
            creep.memory.link = creep.room.storage.pos.findInRange(FIND_MY_STRUCTURES, 5, {filter: s =>{return s.structureType == STRUCTURE_LINK;}})[0].id;
            
        if(creep.carry.energy){
            if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) != 0)
                creep.moveTo(creep.room.storage);
        }
        else{
            let link = Game.getObjectById(creep.memory.link);
            if(!creep.pos.isNearTo(link))
                creep.moveTo(link);
            else if(link.energy){
                creep.withdraw(link, RESOURCE_ENERGY);
            }
        }
    }
}

module.exports = linkManager;