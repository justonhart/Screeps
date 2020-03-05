//this creep will move energy from remote miners to the home room

var remoteTransporter = {
    run: function(creep){

        if(creep.hits < creep.hitsMax)
            sendDistressSignal(creep);

        if(creep.pos.lookFor(LOOK_RESOURCES).length && creep.carry[RESOURCE_ENERGY] < creep.carryCapacity)
            creep.pickup(creep.pos.lookFor(LOOK_RESOURCES)[0]);

        if(!creep.memory.delivering){

            if(!creep.memory.target)
                findTarget(creep);

            let target = Game.getObjectById(creep.memory.target);

            if(target){
                if(creep.pos.isNearTo(target)){
                    creep.withdraw(target, RESOURCE_ENERGY);
                    creep.memory.target = null;
                    creep.memory.delivering = true;
                }
                else
                    creep.moveTo(target, {reusePath: 50});
            }
            else{

              //the creep will move fairly close to the a source to wait for a miner
              let x = _.findKey(Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment].sources, function(src){return true;}).split(",")[0];
              let y = _.findKey(Game.rooms[creep.memory.home].memory.remoteMining[creep.memory.assignment].sources, function(src){return true;}).split(",")[1];

              let waitPos = new RoomPosition(x,y,creep.memory.assignment);
              creep.moveTo(waitPos, {range: 2});
            }

        }


        else{

            if(creep.carry.energy === 0)
                creep.memory.delivering = false;

            else{

                if(creep.room.name !== creep.memory.home){
                    if(!roadWork(creep))
                        creep.moveTo(Game.rooms[creep.memory.home].storage, {reusePath: 50, ignoreCreeps: true, plainCost: 2, swampCost: 3});
                }
                else{
                    let link = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: l => {return l.structureType === STRUCTURE_LINK && l.energy < l.energyCapacity}})[0];
                    if(link){
                        creep.transfer(link, RESOURCE_ENERGY);
                        if(creep.carry[RESOURCE_ENERGY] === 0)
                            creep.memory.delivering = false;
                    }
                    else{
                        creep.moveTo(creep.room.storage, {reusePath: 15});

                        if(creep.pos.isNearTo(creep.room.storage)){
                            creep.transfer(creep.room.storage, RESOURCE_ENERGY);
                            creep.memory.delivering = false;
                        }
                    }
                }
            }
        }
    }

}

function findTarget(creep){
    let assignedRoom = Game.rooms[creep.memory.assignment];
    if(assignedRoom){
        let containers = assignedRoom.find(FIND_STRUCTURES, {filter: (container) => {return container.structureType == STRUCTURE_CONTAINER && _.sum(container.store)}});
        let target = _.max(containers, function(c) {return _.sum(c.store)});
        if(target)
            creep.memory.target =  target.id;
    }
}

function sendDistressSignal(creep){
    console.log(creep.name + ": SOS");
    if(!Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal && !creep.room.my)
        Game.rooms[creep.memory.home].memory.remoteMining[creep.room.name].distressSignal = "SOS";
    creep.suicide();
}

function linkCheck(creep){
    let link = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_LINK}});
}

function roadWork(creep){
    if(creep.pos.look().length === 2 && !creep.onEdge() ){
        creep.pos.createConstructionSite(STRUCTURE_ROAD);
        return true;
    }

    else if(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length){
        creep.build(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]);
        return true;
    }

    else if(_.filter(creep.pos.lookFor(LOOK_STRUCTURES), s => {return s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax;}).length){
        creep.repair(_.filter(creep.pos.lookFor(LOOK_STRUCTURES), s => {return s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax;})[0]);
        return true;
    }
}

module.exports =  remoteTransporter;
