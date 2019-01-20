/*


Decrease CPU usage overall:
    *Rework tower code: targets should only need to be calculated once per room
    Look through creep code for unnecessary recalculation of targets/tasks/paths : distributor/transporter/upgrader
    Run Spawn code only when necessary: ie, when creep dies 
    
    
    Rather than having creeps decide their own targets, have them assigned by the room AI. This will ultimately allow for more efficient independent rooms
    

























































*/