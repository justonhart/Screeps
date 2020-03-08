var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintenance = require('role.maintenance');
var roleDistributor = require('role.distributor');
var roleDemo = require('role.demo');
var roleTransporter = require('role.transporter');
var roleMiner = require('role.miner');
var roleClaimer = require('role.claimer');
var roleMobileBuilder = require('role.mobileBuilder');
var roleLooter = require('role.looter');
var roleInvader = require('role.invader');
var roleMineralMiner = require('role.minerMineral');
var roleRemoteMiner = require('role.minerRemote');
var roleCounterTerrorist = require('role.counterTerrorist');
var roleReserver = require('role.reserver');
var roleRemoteTransporter = require('role.transporterRemote');
var roleManager = require('role.manager');
var roleMason = require('role.mason');
var roleColonizer = require('role.colonizer');
var roleInvasionHealer = require('role.invasionHealer');
var roleInvasionTank = require('role.invasionTank');
var roleHarasser = require('role.harasser');
var roleSigner = require('role.signer');
var roleExterminator = require('role.exterminator');

var driveCreep = {
    run: function(creep){
        
        try{
            if(!creep.spawning){
                var start = Game.cpu.getUsed();
                var end;
            
                if(creep.memory.role == "harvester"){
                    roleHarvester.run(creep); 
                }
                
                //if there are no distributors, the transporter will temporarily take over distribution duties
                else if(creep.memory.role=="distributor" || (creep.memory.role == 'transporter' &&  _.filter(Game.creeps, (creepA) => creepA.memory.role == 'distributor' && creepA.memory.home == creep.memory.home).length == 0)){
                    roleDistributor.run(creep);
                }
                
                else if(creep.memory.role == "transporter"){
                    roleTransporter.run(creep);
                    
                }
               
                //Currently these roles check the total of energy available to the spawner before taking from containers
                switch(creep.memory.role){
                    
                    case "upgrader":
                        if(creep.room.economyStatus > ECON_STARVING)
                            roleUpgrader.run(creep);
                        break;
                    case "builder":
                        roleBuilder.run(creep);
                        break;
                    case "mobileBuilder":
                        roleMobileBuilder.run(creep);
                        break;
                    case "maintenance":
                        roleMaintenance.run(creep);
                        break;
                    case "miner":
                        roleMiner.run(creep);
                        break;
                    case "mineralMiner":
                        roleMineralMiner.run(creep);
                        break;
                    case "remoteMiner":
                        roleRemoteMiner.run(creep);
                        break;
                    case "demo":
                        roleDemo.run(creep);
                        break;
                    case "claimer":
                        roleClaimer.run(creep);
                        break;
                    case "counterTerrorist":
                        roleCounterTerrorist.run(creep);
                        break;
                    case "reserver":
                        roleReserver.run(creep);
                        break;
                    case "remoteTransporter":
                        roleRemoteTransporter.run(creep);
                        break;
                    case "manager":
                        roleManager.run(creep);
                        break;
                    case "looter":
                        roleLooter.run(creep);
                        break;
                    case "mason":
                        roleMason.run(creep);
                        break;
                    case "colonizer":
                        roleColonizer.run(creep);
                        break;
                    
                    case "invader":
                        roleInvader.run(creep);
                        break;
                    case "invasionHealer":
                        roleInvasionHealer.run(creep);
                        break;
                    case "invasionTank":
                        roleInvasionTank.run(creep);
                        break;
                    case "harasser":
                        roleHarasser.run(creep);
                        break;
                    case "mouse":
                        roleMouse.run(creep);
                        break;
                    case "signer":
                        roleSigner.run(creep);
                        break;
                    case "exterminator":
                        roleExterminator.run(creep);
                        break;
                }
            end = Game.cpu.getUsed() - start;
            if(end > 10)
                console.log("CPU used for " + creep.name + ": " + end);
            }
        }catch(error){console.log("Error caught running creep: " + creep.name + " : " + error);}
    }
};

module.exports = driveCreep;
