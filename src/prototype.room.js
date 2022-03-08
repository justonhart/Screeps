/*
 * Defines a .mineral property for rooms that caches and gives you the mineral object for a room
 * original author @helam
 * original source https://screeps.slack.com/files/U1PCE23QF/F3ZUNES6A/Room_mineral.js
 */
Object.defineProperty(Room.prototype, 'mineral', {
  get: function() {
    // undefined on the first request each tick, mineral object or null after
    if (this._mineral === undefined) {
      // undefined on the first request, mineral id or null after
      if (this.memory.mineralId === undefined) {
        const [mineral] = this.find(FIND_MINERALS);
        if (mineral) {
          this._mineral = mineral;
          this.memory.mineralId = mineral.id;
        } else {
          this._mineral = this.memory.mineralId = null;
        }
      } else {
        this._mineral = Game.getObjectById(this.memory.mineralId);
      }
    }
    return this._mineral;
  },
  enumerable: false,
  configurable: true,
});

Object.defineProperty(Room.prototype, 'operatingMode', {
  get: function() {
    return this.memory.operatingMode;
  },
  enumerable: false,
  configurable: true,
});

Room.prototype.getDefHP = function(){
    if(this.controller.level === 8 && this.storage && this.economyStatus > ECON_STABLE)
        return MAX_DEFENSE_HP;
    return this.controller.level * 100000 * 5/8;
}

Room.prototype.initSourceAccessPoints = function(){
    this.memory.sourceAccessPoints = [];
    let sources = this.find(FIND_SOURCES);
    for(let source in sources){
        for(let x = -1; x < 2; x++){
            for(let y = -1; y < 2; y++){
                if(this.lookForAt(LOOK_TERRAIN, sources[source].pos.x - x, sources[source].pos.y - y) != "wall")
                    this.memory.sourceAccessPoints.push((sources[source].pos.x - x) + "," + (sources[source].pos.y - y) +","+ this.name);
            }
        }
    }
}

Object.defineProperty(Room.prototype, 'economyStatus', {
  get: function() {
    if(this.storage){
        if(this.storage.store[RESOURCE_ENERGY] > 800000)
            return ECON_OVERPRODUCING;
        if(this.storage.store[RESOURCE_ENERGY] > 500000)
            return ECON_SURPLUS;
        if(this.storage.store[RESOURCE_ENERGY] > this.energyCapacityAvailable * 10)
            return ECON_STABLE;
        if(this.storage.store[RESOURCE_ENERGY] > this.energyCapacityAvailable * 3)
            return ECON_RECOVERING;
        else
            return ECON_STARVING;
    }
    
    else
        return null;
  },
  enumerable: false,
  configurable: true,
});

Object.defineProperty(Room.prototype, 'nuker', {
  get: function() {
    let nuker = this.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType === STRUCTURE_NUKER}})[0];
    return nuker;
  },
  enumerable: false,
  configurable: true,
});

Object.defineProperty(Room.prototype, 'my', {
  get: function() {
    return this && this.controller && this.controller.my;
  },
  enumerable: false,
  configurable: true,
});
