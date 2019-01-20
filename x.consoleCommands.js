var consoleCommands = {
    
    addSource: function(roomName, sourceString){
        
        var room = Game.rooms[roomName];
        
        var sourceRoom = sourceString.split("/")[0];
        var source = sourceString.split("/")[1];
        if(!room.memory.remoteMining[sourceRoom]){
            room.memory.remoteMining[sourceRoom] = {};
            room.memory.remoteMining[sourceRoom].sources = {};
            room.memory.remoteMining[sourceRoom].transporter = "no container";
        }
        
        room.memory.remoteMining[sourceRoom].sources[source] = null;
    },
    
    clearFlags: function()
    {
        for(let name in Game.flags){
            console.log("Removing "+ name);
            Game.flags[name].remove();
        }
        
        return _.size(Game.flags) + " remaining";
    }
}
module.exports = consoleCommands;