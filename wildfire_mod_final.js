runAfterLoad(function () {

console.log("🔥 Wildfire Ultimate V4 Final Clean Build Loading...");


// ================================
// CORE VARIABLES
// ================================

let wildfireV4 = {

    wind: 1,

    maxFireChecks: 300,

    fireCount: 0,

    enabled: true

};



// ================================
// SAFE FUNCTIONS
// ================================


function v4Create(id,x,y){

    if(
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height
    ) return false;


    if(pixelExists(x,y))
        return false;


    createPixel(id,x,y);

    return true;

}



function v4Near(pixel,id,radius){

    for(
        let x=-radius;
        x<=radius;
        x++
    ){

        for(
            let y=-radius;
            y<=radius;
            y++
        ){

            if(
                pixelExists(
                    pixel.x+x,
                    pixel.y+y
                )
            ){

                if(
                    getPixel(
                        pixel.x+x,
                        pixel.y+y
                    ).element===id
                ){

                    return true;

                }

            }

        }

    }


    return false;

}



// ================================
// TREE FUEL SYSTEM
// ================================


function addTreeFireBehavior(id){


if(!elements[id])
return;


let oldTick =
elements[id].tick;



elements[id].tick=function(pixel){



if(!pixel.v4Heat)
pixel.v4Heat=0;



if(
v4Near(pixel,"fire",2)
){

    pixel.v4Heat+=2;

}



if(
pixel.v4Heat>25
){

    pixel.color="#665522";

}



if(
pixel.v4Heat>80
){

    v4Create(
        "smoke",
        pixel.x,
        pixel.y-1
    );

}



if(
pixel.v4Heat>180
){

    pixel.element="fire";

    pixel.intensity=40;

}



if(
pixel.v4Heat>350
){

    if(elements.charcoal){

        pixel.element="charcoal";

    }
    else if(elements.ash){

        pixel.element="ash";

    }

}



if(oldTick)
oldTick.call(
elements[id],
pixel
);



};


}



addTreeFireBehavior("wood");
addTreeFireBehavior("hickory");
addTreeFireBehavior("oak");
addTreeFireBehavior("leaves");
addTreeFireBehavior("plant");
addTreeFireBehavior("grass");




// ================================
// FIRE ENGINE
// ================================


if(elements.fire){


let oldFire =
elements.fire.tick;



elements.fire.tick=function(pixel){



if(!pixel.intensity)
pixel.intensity=1;



pixel.intensity++;



// Heat nearby objects

for(
let x=-2;
x<=2;
x++
){

for(
let y=-2;
y<=2;
y++
){


if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){

let nearby =
getPixel(
pixel.x+x,
pixel.y+y
);



if(!nearby.temperature)
nearby.temperature=0;


nearby.temperature+=2;



}


}

}




// Flame colors

if(
pixel.intensity>100
){

pixel.color="#ffff55";

}
else if(
pixel.intensity>40
){

pixel.color="#ff8800";

}
else{

pixel.color="#ff3300";

}





// Smoke

if(
Math.random()<0.25
){

v4Create(
"smoke",
pixel.x,
pixel.y-1
);

}




// Ember spotting

if(
pixel.intensity>80 &&
Math.random()<0.04
){

v4Create(
"wildfire_ember_v4",
pixel.x,
pixel.y-2
);

}




if(oldFire)
oldFire.call(
elements.fire,
pixel
);



};


}




// ================================
// EMBERS
// ================================


elements.wildfire_ember_v4={


name:"Wildfire Ember",

color:"#ff6600",

behavior:behaviors.GAS,

category:"energy",



tick:function(pixel){



pixel.y--;


pixel.x += wildfireV4.wind;



if(
Math.random()<0.05
){

if(
pixelExists(
pixel.x,
pixel.y
)
){

let p =
getPixel(
pixel.x,
pixel.y
);



if(
p.element==="grass" ||
p.element==="leaves" ||
p.element==="plant"
){

p.element="fire";

p.intensity=20;


}


}


}



if(
Math.random()<0.02
){

deletePixel(
pixel.x,
pixel.y
);

}



}



};




// ================================
// WIND CHANGES
// ================================


setInterval(function(){


wildfireV4.wind =
Math.random()<0.5
? -1
: 1;



},10000);




// ================================
// BASIC FIRE LIMITER
// ================================


setInterval(function(){


let count=0;


for(
let x=0;
x<width;
x+=5
){

for(
let y=0;
y<height;
y+=5
){


if(
pixelExists(x,y)
){

if(
getPixel(x,y).element==="fire"
){

count++;

}


}


}

}



wildfireV4.fireCount=count;



},5000);



console.log(
"🔥 Wildfire Ultimate V4 Part 1 Loaded"
);


});
// ==========================================
// WILDFIRE ULTIMATE V4 FINAL CLEAN BUILD
// PART 2/4 - FIRE DEPARTMENT SYSTEM
// ==========================================



// ------------------------------
// FIRE SUPPRESSION WATER
// ------------------------------

elements.v4_hose_water = {

name:"High Pressure Hose Water",

color:"#3399ff",

behavior:behaviors.LIQUID,

category:"liquids",

density:1000,


tick:function(pixel){


for(
let x=-2;
x<=2;
x++
){

for(
let y=-2;
y<=2;
y++
){


if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){

let p =
getPixel(
pixel.x+x,
pixel.y+y
);



if(
p.element==="fire"
){

deletePixel(
p.x,
p.y
);


}



}



}


}



}

};





// ------------------------------
// FOAM
// ------------------------------


elements.v4_fire_foam={


name:"Fire Foam",

color:"#eeeeee",

behavior:behaviors.LIQUID,

category:"liquids",

viscosity:4,


tick:function(pixel){



for(
let x=-2;
x<=2;
x++
){

for(
let y=-2;
y<=2;
y++
){


if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){

let p =
getPixel(
pixel.x+x,
pixel.y+y
);



if(
p.element==="fire"
){

deletePixel(
p.x,
p.y
);


}


}


}


}



}

};





// ------------------------------
// FIREFIGHTER AI
// ------------------------------


elements.v4_firefighter={


name:"Firefighter",

color:"#cc0000",

behavior:behaviors.POWDER,

category:"life",



tick:function(pixel){



let fire=null;



for(
let x=-12;
x<=12;
x++
){

for(
let y=-8;
y<=8;
y++
){


if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){

let p =
getPixel(
pixel.x+x,
pixel.y+y
);



if(
p.element==="fire"
){

fire=p;

}



}



}


}



if(fire){


let dir =
Math.sign(
fire.x-pixel.x
);



if(
dir!==0 &&
!pixelExists(
pixel.x+dir,
pixel.y
)
){

pixel.x+=dir;

}



if(
Math.random()<0.4
){

v4Create(
"v4_hose_water",
pixel.x+dir*2,
pixel.y
);


}



}


}



};





// ------------------------------
// FIRE TRUCK
// ------------------------------


elements.v4_fire_truck={


name:"Fire Truck",

color:"#aa0000",

behavior:behaviors.WALL,

category:"machines",



tick:function(pixel){



if(
v4Near(
pixel,
"fire",
25
)
){

if(
Math.random()<0.5
){

v4Create(
"v4_hose_water",
pixel.x+2,
pixel.y-1
);


}


}



}


};





// ------------------------------
// WATER PRESSURE BOOST
// ------------------------------


setInterval(function(){


for(
let i=0;
i<20;
i++// ==========================================
// WILDFIRE ULTIMATE V4 FINAL CLEAN BUILD
// PART 3/4 - BUILDING FIRE SYSTEM
// ==========================================


let buildingV4 = {

    flashoverHeat:500,

    collapseHeat:900

};



// ------------------------------
// BUILDING HEAT TRACKING
// ------------------------------


function addBuildingHeat(id){


if(!elements[id])
return;


let oldTick =
elements[id].tick;



elements[id].tick=function(pixel){



if(!pixel.v4BuildingHeat)
pixel.v4BuildingHeat=0;



if(
v4Near(
pixel,
"fire",
3
)
){

pixel.v4BuildingHeat+=3;


}



// Smoke buildup

if(
pixel.v4BuildingHeat>100
){

v4Create(
"smoke",
pixel.x,
pixel.y-1
);


}




// Flashover trigger

if(
pixel.v4BuildingHeat>
buildingV4.flashoverHeat
){


for(
let x=-6;
x<=6;
x++
){

for(
let y=-4;
y<=4;
y++
){


if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){

let p =
getPixel(
pixel.x+x,
pixel.y+y
);



if(

p.element==="wood" ||
p.element==="hickory" ||
p.element==="paper" ||
p.element==="cloth"

){

p.element="fire";

p.intensity=100;


}



}


}


}


}





// Collapse

if(
pixel.v4BuildingHeat>
buildingV4.collapseHeat
){

if(
Math.random()<0.03
){

pixel.element="dust";


}


}





if(oldTick)
oldTick.call(
elements[id],
pixel
);



};



}




addBuildingHeat("wood");
addBuildingHeat("hickory");
addBuildingHeat("brick");
addBuildingHeat("concrete");
addBuildingHeat("steel");




// ------------------------------
// BACKDRAFT SYSTEM
// ------------------------------


elements.v4_backdraft={


name:"Backdraft",

color:"#222222",

behavior:behaviors.WALL,

category:"special",



tick:function(pixel){



if(
v4Near(
pixel,
"fire",
5
)
&&
Math.random()<0.01
){



for(
let x=-4;
x<=4;
x++
){

for(
let y=-3;
y<=3;
y++
){


v4Create(
"fire",
pixel.x+x,
pixel.y+y
);



}



}



}




}


};





// ------------------------------
// ELECTRICAL FIRE
// ------------------------------


elements.v4_electrical_fire={


name:"Electrical Fire",

color:"#33ccff",

behavior:behaviors.WALL,

category:"energy",



tick:function(pixel){



if(
Math.random()<0.05
){

v4Create(
"fire",
pixel.x,
pixel.y-1
);


}



}


};





// ------------------------------
// SMOKE DENSITY IN ROOMS
// ------------------------------


setInterval(function(){



for(
let i=0;
i<20;
i++
){



let x =
Math.floor(
Math.random()*width
);


let y =
Math.floor(
Math.random()*height
);



if(
pixelExists(x,y)
){

let p =
getPixel(x,y);



if(
p.element==="fire"
){


v4Create(
"smoke",
x,
y-2
);


}



}



}



},1500);





console.log(
"🏠 Wildfire Ultimate// ==========================================
// WILDFIRE ULTIMATE V4 FINAL CLEAN BUILD
// PART 4/4 - ENVIRONMENT + OPTIMIZATION
// ==========================================


let environmentV4 = {

    rain:false,

    humidity:0.5,

    wind:1,

    maxFire:3000

};




// ------------------------------
// FUEL MOISTURE
// ------------------------------


function moistureSystem(id){


if(!elements[id])
return;



let oldTick =
elements[id].tick;



elements[id].tick=function(pixel){



if(
pixel.moisture===undefined
){

pixel.moisture=
environmentV4.humidity;

}




if(
v4Near(pixel,"fire",2)
){

pixel.moisture-=0.01;


}




if(
pixel.moisture>0.7
){

// wet fuel burns slower

pixel.wet=true;


}




if(
oldTick
)
oldTick.call(
elements[id],
pixel
);



};


}




moistureSystem("grass");
moistureSystem("plant");
moistureSystem("leaves");
moistureSystem("wood");





// ------------------------------
// STEAM SYSTEM
// ------------------------------


elements.v4_steam={


name:"Fire Steam",

color:"#dddddd",

behavior:behaviors.GAS,

category:"gases",



tick:function(pixel){


pixel.y--;



if(
Math.random()<0.03
){

deletePixel(
pixel.x,
pixel.y
);


}


}


};





// ------------------------------
// WATER + HEAT = STEAM
// ------------------------------


if(elements.v4_hose_water){


let oldWater =
elements.v4_hose_water.tick;



elements.v4_hose_water.tick=function(pixel){



for(
let x=-2;
x<=2;
x++
){

for(
let y=-2;
y<=2;
y++
){



if(
pixelExists(
pixel.x+x,
pixel.y+y
)
){


let p =
getPixel(
pixel.x+x,
pixel.y+y
);



if(
p.temperature &&
p.temperature>300
){


v4Create(
"v4_steam",
p.x,
p.y-1
);



}



}



}



}




if(oldWater)
oldWater.call(
elements.v4_hose_water,
pixel
);



};


}





// ------------------------------
// WEATHER SYSTEM
// ------------------------------


setInterval(function(){



environmentV4.rain =
Math.random()<0.2;



environmentV4.wind =
Math.random()<0.5
?
-1
:
1;



if(
environmentV4.rain
){


environmentV4.humidity+=0.1;



if(
environmentV4.humidity>1
)
environmentV4.humidity=1;



console.log(
"🌧️ Rain increasing fuel moisture"
);


}
else{


environmentV4.humidity-=0.01;



if(
environmentV4.humidity<0
)
environmentV4.humidity=0;


}



},15000);





// ------------------------------
// SMOKE WIND MOVEMENT
// ------------------------------


if(elements.smoke){



let oldSmoke =
elements.smoke.tick;



elements.smoke.tick=function(pixel){



if(
environmentV4.wind!==0
){


pixel.x +=
environmentV4.wind;


}



if(oldSmoke)
oldSmoke.call(
elements.smoke,
pixel
);



};



}





// ------------------------------
// FIRE LIMITER
// ------------------------------


setInterval(function(){



let fires=0;



for(
let x=0;
x<width;
x+=5
){

for(
let y=0;
y<height;
y+=5
){


if(
pixelExists(x,y)
){


if(
getPixel(x,y).element==="fire"
){

fires++;

}


}


}


}




if(
fires>environmentV4.maxFire
){


console.log(
"⚙️ Wildfire optimization active"
);



}



},5000);





console.log(
"🌎 Wildfire Ultimate V4 COMPLETE"
);
