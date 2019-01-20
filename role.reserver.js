var reserver = {
    run: function(creep){
        
        if(creep.hits < creep.hitsMax)
            sendDistressSignal(creep);
        
        if(creep.pos.isNearTo(Game.rooms[creep.memory.assignment].controller)){
            creep.reserveController(Game.rooms[creep.memory.assignment].controller);
            creep.signController(Game.rooms[creep.memory.assignment].controller, "Mining territory of jhart22");
        }
        
        else
            creep.moveTo(Game.rooms[creep.memory.assignment].controller, {reusePath: 50});
    }
};

function sendDistressSignal(creep){
    console.log(creep.name + ": SOS");
    if(!Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal)
        Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal = "SOS";
    creep.suicide();
}

module.exports = reserver;