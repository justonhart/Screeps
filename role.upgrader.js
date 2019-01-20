var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        //if we have energy, do work
	    if(creep.memory.gathering === false) {
	        if(creep.pos.getRangeTo(creep.room.controller) > 3)
                creep.moveTo(creep.room.controller);
            else
                creep.upgradeController(creep.room.controller);
            
            if(!creep.carry.energy)
                creep.memory.gathering = true;
	    }
	    
	    //if not
	    else {
	        creep.gatherEnergy();
	    }
	}
};


module.exports = roleUpgrader;