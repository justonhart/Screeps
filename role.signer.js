var roleSigner = {
    run: function(creep){
        
        if(!creep.pos.isNearTo(creep.room.controller))
            creep.moveTo(creep.room.controller);
        else{
            creep.signController(creep.room.controller, "");
            creep.suicide();
        }
    }
}

module.exports = roleSigner;