var flagCommands = {
    run: function(){
        addSourceByFlag();
        removeSourceByFlag();
        destroyStructuresInLine();
        demoFlagManage();
    }
}

function addSourceByFlag(){
    
    //flag for adding source to room
    let sourceFlag = _.find(Game.flags, function(f){return f.name.startsWith("addSource")});
    if(sourceFlag){
        let room = Game.rooms[sourceFlag.name.split("/")[1]];
        let sourceRoom = sourceFlag.pos.roomName;
        let sourcePos = sourceFlag.pos.x+","+sourceFlag.pos.y;
        
        if(!room.memory.remoteMining[sourceRoom]){
            room.memory.remoteMining[sourceRoom] = {};
            room.memory.remoteMining[sourceRoom].sources = {};
            room.memory.remoteMining[sourceRoom].transporter = "no container";
        }
        
        room.memory.remoteMining[sourceRoom].sources[sourcePos] = null;
        sourceFlag.remove();
    }
}

function removeSourceByFlag(){
    let removeFlag = _.find(Game.flags, function(f){return f.name.startsWith("removeSource")});
    if(removeFlag){
        let room = Game.rooms[removeFlag.name.split("/")[1]];
        let sourceRoom = removeFlag.pos.roomName;
        let sourcePos = removeFlag.pos.x+","+removeFlag.pos.y;
        
        if(_.size(room.memory.remoteMining[sourceRoom].sources) === 1)
            delete room.memory.remoteMining[sourceRoom];
        
        else{
            Game.getObjectById(room.memory.remoteMining[sourceRoom].sources[sourcePos]).suicide();
            delete room.memory.remoteMining[sourceRoom].sources[sourcePos];
        }
        
        removeFlag.remove();
    }
}

//this requires that flags be on the same x or y axis, place lower coordinate flag first
function destroyStructuresInLine(){
    let destroyFlags = _.filter(Game.flags, function(f){return f.name.startsWith("destroy")});
    let structuresDestroyed = 0;
    if(destroyFlags.length == 2){
        if(destroyFlags[0].pos.x === destroyFlags[1].pos.x){
            for(let i = 0; i < destroyFlags[0].pos.getRangeTo(destroyFlags[1].pos) + 1; i++){
                let pos = new RoomPosition(destroyFlags[0].pos.x, destroyFlags[0].pos.y + i, destroyFlags[0].pos.roomName);
                let struct = _.head(pos.lookFor(LOOK_STRUCTURES));
                if(struct && struct.destroy() === 0)
                    structuresDestroyed++;
            }
        }
        
        else if(destroyFlags[0].pos.y === destroyFlags[1].pos.y){
            for(let i = 0; i < destroyFlags[0].pos.getRangeTo(destroyFlags[1].pos) + 1; i++){
                let pos = new RoomPosition(destroyFlags[0].pos.x + i, destroyFlags[0].pos.y, destroyFlags[0].pos.roomName);
                let struct = _.head(pos.lookFor(LOOK_STRUCTURES));
                if(struct && struct.destroy() === 0)
                    structuresDestroyed++;
            }
        }
        
        destroyFlags[0].remove();
        destroyFlags[1].remove();
        console.log("Structures destroyed: "+structuresDestroyed);
    }
}

function demoFlagManage(){
    let demoFlags = _.filter(Game.flags, function(f){return f.name.startsWith("demo")});
    if(Game.flags.demoFlag1 && Game.flags.demoFlag1.room && Game.flags.demoFlag1.pos.lookFor(LOOK_STRUCTURES).length === 0){
        if(demoFlags.length > 1){
            demoFlags = _.sortBy(demoFlags, function(f){return f.name;});
            for(let i = 0; i < demoFlags.length; i++){
                if(i < demoFlags.length - 1)
                    demoFlags[i].setPosition(demoFlags[i + 1]);
                else
                    demoFlags[i].remove();
            }
        }
        else
            Game.flags.demoFlag1.remove();
    }
}

module.exports = flagCommands;