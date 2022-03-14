var remoteMiner = {
    run: function(creep){
        
        if(!Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment.split(",")[2]])
            creep.suicide();
        
        //parse position of assignment from memory
        var sourcePos = new RoomPosition(creep.memory.assignment.split(",")[0], creep.memory.assignment.split(",")[1], creep.memory.assignment.split(",")[2]);
        
        //if creep is not in room of remote source, move there
        if(creep.room.name != creep.memory.assignment.split(",")[2])
            creep.moveTo(sourcePos, {reusePath: 50});
        
        else{
            if(creep.hits < creep.hitsMax)
                sendDistressSignal(creep);

            if(creep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_INVADER_CORE}}).length){
              reportInvaderCore(creep);
            }
            
            let source = sourcePos.lookFor(LOOK_SOURCES)[0];
            
            //destination is calculated twice to fix an issue after a container is constructed; surely a better way, too tired to see it now
            let destination = Game.getObjectById(creep.memory.destination);
            
            //determine whether there is a container to move to or not
            if(!creep.memory.destination || !destination){
                calculateDestination(creep);
                destination = Game.getObjectById(creep.memory.destination);
            }
            
            //if construction site is destination
            if(destination instanceof ConstructionSite){
                
                //if not there, move there
                if(!creep.pos.isEqualTo(destination.pos))
                    creep.moveTo(destination, {reusePath: 50});
                
                //logic if there
                else{
                    //if creep has 50 energy
                    if(creep.carry.energy && creep.carry.energy % 25 == 0)
                        creep.build(destination);
                    else
                        creep.harvest(source);
                }
            }
            
            //if container
            else if(destination instanceof StructureContainer){
                
                if(Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].transporter == "no container")
                    Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].transporter = null;
                
                //if not there, move there
                if(!creep.pos.isEqualTo(destination.pos))
                    creep.moveTo(destination, {reusePath: 50});
                
                //logic if there
                else{
                    //if creep capacity is full
                    if(creep.carry.energy == creep.carryCapacity && destination.hits < destination.hitsMax)
                        creep.repair(destination);
                    else if(source.energy > 0 && _.sum(destination.store) < 2000)
                        creep.harvest(source);
                }
            }
            
            //if there is no container
            else{
                
                //if not there, move there
                if(!creep.pos.isNearTo(destination.pos))
                    creep.moveTo(destination, {reusePath: 50});
                
                //if there, but no construction site, make one    
                else{
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    creep.memory.destination = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0].id;
                }
            }
        }
    }
};

function calculateDestination(creep){
    Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment.split(",")[2]].sources[creep.memory.assignment.split(",")[0]+","+creep.memory.assignment.split(",")[1]] = creep.id;
    
    //look for container near source and move there; if none, move to source and drop container site
    let sourcePos = new RoomPosition(creep.memory.assignment.split(",")[0], creep.memory.assignment.split(",")[1], creep.memory.assignment.split(",")[2]);
    let source = sourcePos.lookFor(LOOK_SOURCES)[0];
    
    let container = _.find(creep.room.lookForAtArea(LOOK_STRUCTURES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true), s=> {return s.structure.structureType == STRUCTURE_CONTAINER});
    
    if(container && !container.structure.pos.lookFor(LOOK_CREEPS).length){
        creep.memory.destination = container.structure.id;
        return;
    }
     
    let site = _.find(creep.room.lookForAtArea(LOOK_CONSTRUCTION_SITES, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true), s=> {return s.constructionSite.structureType == STRUCTURE_CONTAINER});
    if(site && !site.constructionSite.pos.lookFor(LOOK_CREEPS).length){
        creep.memory.destination = site.constructionSite.id;
        return;
    }
    else
        creep.memory.destination = source.id; 
}

function sendDistressSignal(creep){
    console.log(creep.name + ": SOS");
    if(!Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal)
        Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal = "SOS";
    Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].sources[creep.memory.assignment.split(",")[0] +","+ creep.memory.assignment.split(",")[1]] = "SOS";
    creep.memory.suicide = true;
    creep.suicide();
}

function reportInvaderCore(creep){
  if(Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].invaderCore != true)
      Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].invaderCore = true;
}


module.exports = remoteMiner;