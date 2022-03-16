var reserver = {
    run: function(creep){
        
        if(creep.hits < creep.hitsMax)
            sendDistressSignal(creep);
        
        if(creep.pos.isNearTo(Game.rooms[creep.memory.assignment].controller)){
            creep.reserveController(Game.rooms[creep.memory.assignment].controller);
            creep.signController(Game.rooms[creep.memory.assignment].controller, "Protected mining territory");
        }
        
        else{
          if(Game.rooms[creep.memory.assignment]){
            creep.moveTo(Game.rooms[creep.memory.assignment].controller, {reusePath: 50});
          }

          else{
            let x = _.findKey(Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment].sources, function(src){return true;}).split(",")[0];
            let y = _.findKey(Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment].sources, function(src){return true;}).split(",")[1];
  
            let roomPos = new RoomPosition(x,y,creep.memory.assignment);

            creep.moveTo(roomPos);
          }
        }
            
    }
};

function sendDistressSignal(creep){
    console.log(creep.name + ": SOS");
    if(!Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal)
        Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal = "SOS";
    creep.suicide();
}

module.exports = reserver;