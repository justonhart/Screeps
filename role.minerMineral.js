var roleMineralMiner = {
    run: function(creep){
        
        //causes room memory issues if run before the creep spawns
        if(!creep.memory.destination){
            calculateDestination(creep);
        }
        
        var destination = Game.getObjectById(creep.memory.destination);
        if(destination.structureType == STRUCTURE_CONTAINER && _.sum(destination.store) < 2000){
            switch(creep.harvest(Game.getObjectById(creep.memory.assignment))){
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(destination);
                    break;
            }
        }
    }
};

function calculateDestination(creep){
   
    creep.memory.assignment = creep.room.find(FIND_MINERALS)[0].id;
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

module.exports = roleMineralMiner;