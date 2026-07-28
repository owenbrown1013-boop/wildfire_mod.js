runAfterLoad(function () {

console.log("🔥 Optimized Wildfire Mod Loading...");

function safeCreatePixel(id,x,y){
    if(x<0||y<0||x>=width||y>=height)return false;
    if(pixelExists(x,y))return false;
    createPixel(id,x,y);
    return true;
}

function extinguishArea(x,y,radius){
    for(let dx=-radius;dx<=radius;dx++){
        for(let dy=-radius;dy<=radius;dy++){
            if(pixelExists(x+dx,y+dy)){
                let p=getPixel(x+dx,y+dy);
                if(p.element==="fire"){
                    deletePixel(p.x,p.y);
                }
            }
        }
    }
}


// =====================
// LIQUIDS
// =====================

elements.hose_water={
    name:"Hose Water",
    color:"#3399ff",
    behavior:behaviors.LIQUID,
    category:"liquids",
    density:1000,
    state:"liquid",
    desc:"High pressure firefighting water.",
    tick:function(pixel){
        extinguishArea(pixel.x,pixel.y,2);
    }
};


elements.red_retardant={
    name:"Fire Retardant",
    color:"#cc2222",
    behavior:behaviors.LIQUID,
    category:"liquids",
    density:1200,
    state:"liquid",
    desc:"Aircraft dropped wildfire retardant.",
    tick:function(pixel){
        extinguishArea(pixel.x,pixel.y,3);
    }
};


elements.fire_foam={
    name:"Fire Foam",
    color:"#eeeeee",
    behavior:behaviors.LIQUID,
    category:"liquids",
    density:300,
    viscosity:4,
    state:"liquid",
    desc:"Foam for structural fires.",
    tick:function(pixel){
        extinguishArea(pixel.x,pixel.y,2);
    }
};


console.log("🔥 Liquids loaded");


// =====================
// FUELS
// =====================

elements.dry_vegetation={
    name:"Dry Vegetation",
    color:"#aa8833",
    behavior:behaviors.POWDER,
    category:"powders",
    state:"solid",
    burn:30,
    burn
