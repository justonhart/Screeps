Creep.prototype.getHome = function () {
    return this.memory.home;
};

/* This will look through the access point list and pull whichever is closest, and remove it from the list */
Creep.prototype.claimSourceAccessPoint  = function(){
    let sourceAccessPoints = this.room.memory.sourceAccessPoints;
    
    if(sourceAccessPoints.length){
        let bestDistance = 99;
        let closest;
        let index;
        for(let i = 0; i < sourceAccessPoints.length; i++){
            let posString = sourceAccessPoints[i];
            let miningPos = new RoomPosition(posString.split(",")[0], posString.split(",")[1], posString.split(",")[2]);
            let distance = this.pos.getRangeTo(miningPos);
            if((miningPos.lookFor(LOOK_CREEPS).length === 0 || miningPos.lookFor(LOOK_CREEPS)[0].id === this.id) && miningPos.findInRange(FIND_SOURCES_ACTIVE, 1).length && distance < bestDistance){
                closest = sourceAccessPoints[i];
                bestDistance = distance;
                index = i;
            }
        }
        
        if(closest){
            this.memory.miningPos = closest;
            this.room.memory.sourceAccessPoints.splice(index, 1);
        }
        else
            return -1;
    }
    else
        return -1;
    
}

//This releases the access point the creep claimed back to the room
Creep.prototype.releaseSourceAccessPoint = function(){
    let creepMiningPos = this.memory.miningPos;
    if(this.memory.miningPos && !_.find(this.room.memory.sourceAccessPoints, function(p){return p === creepMiningPos;})){
        this.room.memory.sourceAccessPoints.push(this.memory.miningPos);
    }
    
    delete this.memory.miningPos;
}

//This is the function that manages creep mining logic for operating mode 1, and pickup logic for operating mode 2
Creep.prototype.gatherEnergy = function(){
    
    if(!this.memory.gathering)
        this.memory.gathering = true;

    if(this.carry.energy === this.carryCapacity){
        this.memory.gathering = false;
        this.releaseSourceAccessPoint();
    }
    
    else{
        switch(this.room.operatingMode){
            case ECO_MODE:
            case HARV_MODE:
                
                if(this.room.storage && !this.room.storage.my && this.room.storage.store[RESOURCE_ENERGY]){
                    switch(this.withdraw(this.room.storage, RESOURCE_ENERGY)){
                        case ERR_NOT_IN_RANGE:
                            this.moveTo(this.room.storage);
                            break;
                        case 0:
                            this.memory.gathering = false;
                            break;
                    }
                }
                
                else if(this.room.operatingMode !== ECO_MODE && this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY]){
                    switch(this.withdraw(this.room.terminal, RESOURCE_ENERGY)){
                        case ERR_NOT_IN_RANGE:
                            this.moveTo(this.room.terminal);
                            break;
                        case 0:
                            this.memory.gathering = false;
                            break;
                    }
                }
                
                else{
                    if(!this.memory.miningPos)
                        this.claimSourceAccessPoint();
                    
                    if(this.memory.miningPos){
                        let miningPos = new RoomPosition(this.memory.miningPos.split(",")[0], this.memory.miningPos.split(",")[1], this.memory.miningPos.split(",")[2]);
                        if(this.pos.isEqualTo(miningPos)){
                            let miningResult = this.harvest(this.pos.findClosestByRange(FIND_SOURCES));
                            
                            //this tidbit makes creeps that are sitting at an empty source go work with whatever energy they may have OR if the source they have pulled is empty, stop gathering
                            if(miningResult === ERR_NOT_ENOUGH_RESOURCES && this.carry.energy > 0 || !miningPos.findInRange(FIND_SOURCES_ACTIVE, 1).length){
                                this.memory.gathering = false;
                                this.releaseSourceAccessPoint();
                            }
                        }
                        else
                            this.moveTo(miningPos, {reusePath: 15});
                    }
                }
                break;
            
            case DIST_MODE:
                if(!this.memory.supply){
                    	        
                    //check to see if room has storage
                    if(this.room.storage && this.room.storage.store[RESOURCE_ENERGY])
                        this.memory.supply = Game.rooms[this.memory.home].storage.id;
                    
                    //check to see if room has containers
                    else{
                        let container = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: structure => {return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0}});
                        if(container)
                            this.memory.supply = container.id;
                    }
                }
                	        
                let supply = Game.getObjectById(this.memory.supply);
                
                if(supply){
                    switch(this.withdraw(supply, RESOURCE_ENERGY)){
                        case ERR_NOT_IN_RANGE:
                            this.moveTo(supply);
                            break;
                        case 0:
                            this.memory.gathering = false;
                            this.memory.supply = null;
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            this.memory.supply = null;
                            break;
                    }
                }
                break;
        }
    }
}

Creep.prototype.onEdge = function(){
    if(this.pos.x === 0 || this.pos.x === 49 || this.pos.y === 0 || this.pos.y === 49)
        return true;
    return false;
}

Creep.prototype.travelTo = function(target){
    
}

//for pathfinding, this method will ask creeps that are blocking the path to move out of the way
Creep.prototype.shove = function(creep){
    switch(creep.memory.role){
        case "upgrader":
            creep.moveTo(creep.room.controller, {ignoreRoads: true, swampCost: 1});
    }
}