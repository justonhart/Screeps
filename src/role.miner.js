//The miner stands on a container and mines from the source it is adjacent to

var roleMiner = {
    run: function(creep){
        
        //causes room memory issues if run before the creep spawns
        if(!creep.memory.destination){
            calculateDestination(creep);
        }
        
        var destination = Game.getObjectById(creep.memory.destination);
        var source = Game.getObjectById(creep.memory.assignment);
        if(destination){
            if(destination.structureType == STRUCTURE_CONTAINER && !creep.pos.isEqualTo(destination.pos))
                creep.moveTo(destination);
            else if(!creep.pos.isNearTo(source)){
                creep.moveTo(source);
            }
            else if(source.energy){
                switch(creep.harvest(source)){
                    case 0:
                        if(destination.structureType != STRUCTURE_CONTAINER){
                            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                        }
                        break;
                }
            }
        }
        else
            creep.memory.destination = null;
    }
};

function calculateDestination(creep){
   Game.rooms[creep.memory.home].memory.localSources[creep.memory.assignment] = creep.id;
   
    //look for container near source and move there; if none, move to source and drop container site
    var source = Game.getObjectById(creep.memory.assignment);
    var container = _.find(creep.room.lookForAtArea(LOOK_STRUCTURES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true), s=> {return s.structure.structureType == STRUCTURE_CONTAINER});
    if(container)
        creep.memory.destination = container.structure.id;
    else if(_.find(creep.room.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true), s=> {return s.constructionSite.structureType == STRUCTURE_CONTAINER}))
        creep.memory.destination = _.find(creep.room.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true), s=> {return s.constructionSite.structureType == STRUCTURE_CONTAINER}).constructionSite.id;
    
    else
        creep.memory.destination = creep.memory.assignment; 
}

module.exports = roleMiner;