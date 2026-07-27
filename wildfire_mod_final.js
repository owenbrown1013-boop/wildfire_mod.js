runAfterLoad(function () {

  console.log("🔥 Wildfire mod loading...");

  // Only ever creates a pixel into truly empty space. Prevents:
  // (a) accidentally overwriting/destroying an existing pixel
  //     (like wood or fire) that happens to already be there
  // (b) errors from trying to create outside the grid
  function safeCreatePixel(id, x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    if (pixelExists(x, y)) return false;
    createPixel(id, x, y);
    return true;
  }

  // Searches a small area around a target point for the nearest empty
  // spot and creates there instead - used so firefighting elements
  // spray water/retardant NEXT TO fire rather than trying (and failing)
  // to spray directly on top of it, since the fire pixel itself isn't
  // empty space.
  function sprayNear(id, x, y, radius) {
    for (let r = 0; r <= radius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (safeCreatePixel(id, x + dx, y + dy)) return true;
        }
      }
    }
    return false;
  }

  // Scans outward from (px,py) for the nearest pixel of element `id`
  // within `radius`. Steps by 2 to keep the search affordable at
  // large radii. Returns {x,y} or null if nothing found.
  function findNearestElement(px, py, id, radius) {
    let best = null;
    let bestDist = Infinity;
    for (let x = -radius; x <= radius; x += 2) {
      for (let y = -radius; y <= radius; y += 2) {
        let tx = px + x;
        let ty = py + y;
        if (pixelExists(tx, ty) && getPixel(tx, ty).element === id) {
          let d = x * x + y * y;
          if (d < bestDist) {
            bestDist = d;
            best = { x: tx, y: ty };
          }
        }
      }
    }
    return best;
  }

  // Moves pixel.x/pixel.y toward (tx,ty) by up to `speed` per axis,
  // per tick - used so vehicles glide smoothly toward a target
  // instead of teleporting.
  function stepToward(pixel, tx, ty, speed) {
    let dx = tx - pixel.x;
    let dy = ty - pixel.y;
    if (Math.abs(dx) > speed) {
      pixel.x += Math.sign(dx) * speed;
    } else {
      pixel.x = tx;
    }
    if (Math.abs(dy) > speed) {
      pixel.y += Math.sign(dy) * speed;
    } else {
      pixel.y = ty;
    }
  }

  // ---------- Liquids ----------

  elements.hose_water = {
    name: "Hose Water",
    color: "#3399ff",
    behavior: behaviors.LIQUID,
    category: "liquids",
    density: 1000,
    state: "liquid",
    desc: "High-pressure firefighting water.",
    tick: function (pixel) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            let p = getPixel(pixel.x + x, pixel.y + y);
            if (p.element === "fire") {
              deletePixel(p.x, p.y);
            }
          }
        }
      }
    },
  };

  elements.red_retardant = {
    name: "Fire Retardant",
    color: "#cc2222",
    behavior: behaviors.LIQUID,
    category: "liquids",
    density: 1200,
    state: "liquid",
    desc: "Red retardant dropped by aircraft to smother fires.",
    tick: function (pixel) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            let p = getPixel(pixel.x + x, pixel.y + y);
            if (p.element === "fire") {
              deletePixel(p.x, p.y);
            }
          }
        }
      }
    },
  };

  elements.fire_foam = {
    name: "Fire Foam",
    color: "#eeeeee",
    behavior: behaviors.LIQUID,
    category: "liquids",
    density: 300,
    viscosity: 3,
    state: "liquid",
    desc: "Firefighting foam.",
    tick: function (pixel) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            let p = getPixel(pixel.x + x, pixel.y + y);
            if (p.element === "fire") {
              deletePixel(p.x, p.y);
            }
          }
        }
      }
    },
  };

  console.log("🔥 Liquids added");

  // ---------- Fuels ----------

  elements.dry_vegetation = {
    name: "Dry Vegetation",
    color: "#aa8833",
    behavior: behaviors.POWDER,
    category: "powders",
    state: "solid",
    burn: 30,
    burnTime: 120,
    burnInto: ["ash", "smoke"],
    desc: "Dry wildfire fuel that ignites easily.",
  };

  elements.jet_fuel = {
    name: "Jet Fuel",
    color: "#dddddd",
    behavior: behaviors.LIQUID,
    category: "liquids",
    density: 800,
    viscosity: 0.2,
    state: "liquid",
    burn: 95,
    burnTime: 150,
    burnInto: ["fire", "smoke"],
    desc: "Extremely flammable aviation fuel.",
  };

  console.log("🔥 Fuels added");

  // ---------- Firefighters ----------

  elements.firefighter = {
    name: "Firefighter",
    color: "#cc0000",
    behavior: behaviors.POWDER,
    category: "life",
    state: "solid",
    density: 1500,
    desc: "Walks toward fire and sprays water on it.",
    tick: function (pixel) {
      let target = null;
      for (let x = -8; x <= 8; x++) {
        for (let y = -5; y <= 5; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            let p = getPixel(pixel.x + x, pixel.y + y);
            if (p.element === "fire") target = p;
          }
        }
      }
      if (target) {
        let dir = Math.sign(target.x - pixel.x);
        if (dir !== 0 && !pixelExists(pixel.x + dir, pixel.y)) {
          pixel.x += dir;
        }
        if (Math.random() < 0.5) {
          sprayNear("hose_water", pixel.x + dir, pixel.y, 2);
        }
      }
    },
  };

  elements.wildland_firefighter = {
    name: "Wildland Firefighter",
    color: "#ffaa00",
    behavior: behaviors.POWDER,
    category: "life",
    state: "solid",
    density: 1500,
    desc: "Cuts firebreaks and sets controlled backburns.",
    tick: function (pixel) {
      if (!pixel.dir) pixel.dir = Math.random() < 0.5 ? -1 : 1;
      if (!pixelExists(pixel.x + pixel.dir, pixel.y)) {
        pixel.x += pixel.dir;
      }
      for (let x = -2; x <= 2; x++) {
        if (pixelExists(pixel.x + x, pixel.y + 1)) {
          let p = getPixel(pixel.x + x, pixel.y + 1);
          if (
            p.element === "grass" ||
            p.element === "plant" ||
            p.element === "leaves" ||
            p.element === "dry_vegetation"
          ) {
            p.element = "dirt";
          }
        }
      }
      if (Math.random() < 0.01) {
        let bx = pixel.x + pixel.dir * 10;
        if (pixelExists(bx, pixel.y)) {
          let p = getPixel(bx, pixel.y);
          if (p.element === "grass" || p.element === "dry_vegetation") {
            p.element = "fire";
          }
        }
      }
    },
  };

  elements.hazmat_firefighter = {
    name: "Hazmat Firefighter",
    color: "#ffff00",
    behavior: behaviors.POWDER,
    category: "life",
    state: "solid",
    density: 1500,
    desc: "Deploys foam on dangerous chemical fires.",
    tick: function (pixel) {
      for (let x = -5; x <= 5; x++) {
        for (let y = -5; y <= 5; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            let p = getPixel(pixel.x + x, pixel.y + y);
            if (p.element === "fire" && Math.random() < 0.3) {
              sprayNear("fire_foam", pixel.x + x, pixel.y + y, 1);
            }
          }
        }
      }
    },
  };

  console.log("🔥 Firefighters added");

  // ---------- Machines ----------

  elements.fire_truck = {
    name: "Fire Truck",
    color: "#b30000",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Drives toward fire and pumps water on it.",
    tick: function (pixel) {
      let found = false;
      for (let x = -20; x <= 20; x++) {
        for (let y = -5; y <= 5; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            if (getPixel(pixel.x + x, pixel.y + y).element === "fire") {
              found = true;
            }
          }
        }
      }
      if (found && Math.random() < 0.5) {
        sprayNear("hose_water", pixel.x + 2, pixel.y - 1, 2);
      }
    },
  };

  elements.sprinkler_system = {
    name: "Sprinkler System",
    color: "#888888",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Sprays water automatically when fire gets close.",
    tick: function (pixel) {
      for (let x = -3; x <= 3; x++) {
        for (let y = -3; y <= 3; y++) {
          if (pixelExists(pixel.x + x, pixel.y + y)) {
            if (getPixel(pixel.x + x, pixel.y + y).element === "fire") {
              for (let i = 0; i < 4; i++) {
                safeCreatePixel(
                  "hose_water",
                  pixel.x + Math.floor(Math.random() * 5) - 2,
                  pixel.y + 1
                );
              }
            }
          }
        }
      }
    },
  };

  elements.firefighting_helicopter = {
    name: "Firefighting Helicopter",
    color: "#cc0000",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Flies to fire, drops water, returns to refill, repeats. Flies off when the fire is out.",
    tick: function (pixel) {
      if (!pixel.state) pixel.state = "seeking_fire";
      if (pixel.tank === undefined) pixel.tank = 20;

      if (pixel.state === "seeking_fire") {
        if (!pixel.targetX || pixel.retarget) {
          if (pixel.searchCooldown > 0) {
            pixel.searchCooldown--;
            return;
          }
          pixel.searchCooldown = 15;
          let t = findNearestElement(pixel.x, pixel.y, "fire", 70);
          pixel.retarget = false;
          if (!t) {
            pixel.state = "leaving";
            return;
          }
          pixel.targetX = t.x;
          pixel.targetY = t.y - 3;
        }
        stepToward(pixel, pixel.targetX, pixel.targetY, 2);
        if (pixel.x === pixel.targetX && pixel.y === pixel.targetY) {
          pixel.state = "dropping";
          pixel.targetX = null;
        }
      } else if (pixel.state === "dropping") {
        if (pixel.tank > 0) {
          sprayNear("hose_water", pixel.x, pixel.y + 2, 3);
          pixel.tank--;
        } else {
          pixel.state = "seeking_water";
        }
      } else if (pixel.state === "seeking_water") {
        if (!pixel.targetX) {
          if (pixel.searchCooldown > 0) {
            pixel.searchCooldown--;
            return;
          }
          pixel.searchCooldown = 15;
          let t = findNearestElement(pixel.x, pixel.y, "water", 90);
          if (!t) {
            // no water source anywhere nearby - refill anyway so it
            // isn't stranded forever
            pixel.tank = 20;
            pixel.state = "seeking_fire";
            pixel.retarget = true;
            return;
          }
          pixel.targetX = t.x;
          pixel.targetY = t.y - 3;
        }
        stepToward(pixel, pixel.targetX, pixel.targetY, 2);
        if (pixel.x === pixel.targetX && pixel.y === pixel.targetY) {
          pixel.state = "refilling";
          pixel.refillTimer = 15;
          pixel.targetX = null;
        }
      } else if (pixel.state === "refilling") {
        pixel.refillTimer--;
        if (pixel.refillTimer <= 0) {
          pixel.tank = 20;
          pixel.state = "seeking_fire";
          pixel.retarget = true;
        }
      } else if (pixel.state === "leaving") {
        pixel.y -= 2;
        if (pixel.y <= 1) {
          deletePixel(pixel.x, pixel.y);
        }
      }
    },
  };

  elements.water_tanker_plane = {
    name: "Water Tanker Plane",
    color: "#eeeeee",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Flies to fire, drops water, returns to refill, repeats. Flies off when the fire is out.",
    tick: function (pixel) {
      if (!pixel.state) pixel.state = "seeking_fire";
      if (pixel.tank === undefined) pixel.tank = 25;

      if (pixel.state === "seeking_fire") {
        if (!pixel.targetX || pixel.retarget) {
          if (pixel.searchCooldown > 0) {
            pixel.searchCooldown--;
            return;
          }
          pixel.searchCooldown = 15;
          let t = findNearestElement(pixel.x, pixel.y, "fire", 90);
          pixel.retarget = false;
          if (!t) {
            pixel.state = "leaving";
            return;
          }
          pixel.targetX = t.x;
          pixel.targetY = t.y - 4;
        }
        stepToward(pixel, pixel.targetX, pixel.targetY, 3);
        if (pixel.x === pixel.targetX && pixel.y === pixel.targetY) {
          pixel.state = "dropping";
          pixel.targetX = null;
        }
      } else if (pixel.state === "dropping") {
        if (pixel.tank > 0) {
          sprayNear("hose_water", pixel.x, pixel.y + 2, 3);
          pixel.tank--;
        } else {
          pixel.state = "seeking_water";
        }
      } else if (pixel.state === "seeking_water") {
        if (!pixel.targetX) {
          if (pixel.searchCooldown > 0) {
            pixel.searchCooldown--;
            return;
          }
          pixel.searchCooldown = 15;
          let t = findNearestElement(pixel.x, pixel.y, "water", 110);
          if (!t) {
            pixel.tank = 25;
            pixel.state = "seeking_fire";
            pixel.retarget = true;
            return;
          }
          pixel.targetX = t.x;
          pixel.targetY = t.y - 4;
        }
        stepToward(pixel, pixel.targetX, pixel.targetY, 3);
        if (pixel.x === pixel.targetX && pixel.y === pixel.targetY) {
          pixel.state = "refilling";
          pixel.refillTimer = 15;
          pixel.targetX = null;
        }
      } else if (pixel.state === "refilling") {
        pixel.refillTimer--;
        if (pixel.refillTimer <= 0) {
          pixel.tank = 25;
          pixel.state = "seeking_fire";
          pixel.retarget = true;
        }
      } else if (pixel.state === "leaving") {
        pixel.y -= 2;
        if (pixel.y <= 1) {
          deletePixel(pixel.x, pixel.y);
        }
      }
    },
  };

  elements.red_retardant_tanker = {
    name: "Retardant Tanker Plane",
    color: "#ffffff",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Flies to fire and drops retardant. Never runs out, stays on the map.",
    tick: function (pixel) {
      if (!pixel.state) pixel.state = "seeking_fire";

      if (pixel.state === "seeking_fire") {
        if (!pixel.targetX || pixel.retarget) {
          if (pixel.searchCooldown > 0) {
            pixel.searchCooldown--;
            return;
          }
          pixel.searchCooldown = 20;
          let t = findNearestElement(pixel.x, pixel.y, "fire", 90);
          pixel.retarget = false;
          if (!t) {
            // no fire right now - wait a bit before checking again,
            // instead of scanning every single tick
            return;
          }
          pixel.targetX = t.x;
          pixel.targetY = t.y - 4;
        }
        stepToward(pixel, pixel.targetX, pixel.targetY, 3);
        if (pixel.x === pixel.targetX && pixel.y === pixel.targetY) {
          pixel.state = "dropping";
          pixel.dropTimer = 20;
          pixel.targetX = null;
        }
      } else if (pixel.state === "dropping") {
        sprayNear("red_retardant", pixel.x, pixel.y + 2, 3);
        pixel.dropTimer--;
        if (pixel.dropTimer <= 0) {
          pixel.state = "seeking_fire";
          pixel.retarget = true;
        }
      }
    },
  };

  console.log("🔥 Machines added");

  // ---------- Realistic fire behavior ----------

  if (elements.fire) {
    let baseFireTick = elements.fire.tick;
    elements.fire.tick = function (pixel) {
      try {
        if (!pixel.intensity) pixel.intensity = 1;
        pixel.intensity++;

        if (pixel.intensity > 80) {
          pixel.color = "#fff2aa";
        } else if (pixel.intensity > 30) {
          pixel.color = "#ff7700";
        } else {
          pixel.color = "#ff2200";
        }

        for (let x = -4; x <= 4; x++) {
          for (let y = -3; y <= 3; y++) {
            if (pixelExists(pixel.x + x, pixel.y + y)) {
              let near = getPixel(pixel.x + x, pixel.y + y);
              if (
                near.element === "grass" ||
                near.element === "leaves" ||
                near.element === "plant" ||
                near.element === "dry_vegetation"
              ) {
                if (Math.random() < 0.03) near.element = "fire";
              }
            }
          }
        }

        if (Math.random() < 0.4) {
          safeCreatePixel("smoke", pixel.x, pixel.y - 1);
        }

        if (pixel.intensity > 50 && Math.random() < 0.05) {
          let ex = pixel.x + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 15);
          let ey = pixel.y - Math.floor(Math.random() * 5);
          if (pixelExists(ex, ey)) {
            if (getPixel(ex, ey).element === "grass") {
              getPixel(ex, ey).element = "fire";
            }
          }
        }
      } catch (e) {
        console.log("Wildfire mod: fire effect skipped a tick (" + e.message + ")");
      }

      // This always runs, even if something above failed, so fire
      // never stops behaving like normal fire
      if (baseFireTick) baseFireTick.call(elements.fire, pixel);
    };
  }

  // ---------- Structural damage & collapse ----------

  function heatDamage(pixel, amount) {
    if (!pixel.damage) pixel.damage = 0;
    pixel.damage += amount;
    if (pixel.damage > 100) {
      pixel.element = pixel.element === "steel" ? "molten_slag" : "dust";
    }
  }

  ["concrete", "steel"].forEach(function (mat) {
    if (elements[mat]) {
      let baseTick = elements[mat].tick;
      elements[mat].tick = function (pixel) {
        let collapsed = false;
        try {
          if (pixel.temp && pixel.temp > 250) {
            heatDamage(pixel, 1);
          }
          if (!pixel.damage) pixel.damage = 0;
          if (
            pixel.damage > 60 &&
            !pixelExists(pixel.x, pixel.y + 1) &&
            Math.random() < 0.25
          ) {
            pixel.element = "dust";
            collapsed = true;
          }
        } catch (e) {
          console.log("Wildfire mod: structural damage skipped a tick (" + e.message + ")");
        }
        if (!collapsed && baseTick) baseTick.call(elements[mat], pixel);
      };
    }
  });

  // ---------- Water pressure ----------

  if (elements.water) {
    let baseWaterTick = elements.water.tick;
    elements.water.tick = function (pixel) {
      try {
        let depth = 0;
        for (let d = 1; d <= 15; d++) {
          if (
            pixelExists(pixel.x, pixel.y - d) &&
            getPixel(pixel.x, pixel.y - d).element === "water"
          ) {
            depth++;
          } else {
            break;
          }
        }
        if (depth > 3) {
          let dir = Math.random() < 0.5 ? -1 : 1;
          if (
            pixelExists(pixel.x + dir, pixel.y) &&
            getPixel(pixel.x + dir, pixel.y).element === "air" &&
            Math.random() < 0.3
          ) {
            pixel.x += dir;
          }
        }
      } catch (e) {
        console.log("Wildfire mod: water pressure skipped a tick (" + e.message + ")");
      }
      if (baseWaterTick) baseWaterTick.call(elements.water, pixel);
    };
  }

  console.log("🔥 Fire realism, structural damage, and water pressure added");

  // ---------- Realistic gradual burning (no instant charcoal) ----------
  // Real wood chars slowly from the outside in while it's still on fire,
  // darkening over time, and only fully breaks down to charcoal (then
  // ash) after sustained burning - not the instant the timer runs out.

  function applyGradualCharring(id, baseColor, charTicks) {
    if (!elements[id]) return;
    let baseTick = elements[id].tick;

    elements[id].tick = function (pixel) {
      let converted = false;
      try {
        let nearFire = false;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (pixelExists(pixel.x + x, pixel.y + y)) {
              if (getPixel(pixel.x + x, pixel.y + y).element === "fire") {
                nearFire = true;
              }
            }
          }
        }

        if (nearFire || pixel.charProgress) {
          if (!pixel.charProgress) pixel.charProgress = 0;
          pixel.charProgress += 1;

          // Darken the color gradually from its normal shade toward black
          // as charProgress climbs, so it visibly chars over time instead
          // of flipping the instant it's "done"
          let percent = Math.min(1, pixel.charProgress / charTicks);
          let r = parseInt(baseColor.substr(1, 2), 16);
          let g = parseInt(baseColor.substr(3, 2), 16);
          let b = parseInt(baseColor.substr(5, 2), 16);
          r = Math.round(r * (1 - percent));
          g = Math.round(g * (1 - percent));
          b = Math.round(b * (1 - percent));
          pixel.color =
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0");

          // Fully charred: becomes charcoal (if it exists), otherwise ash
          if (pixel.charProgress >= charTicks) {
            if (elements.charcoal) {
              pixel.element = "charcoal";
              converted = true;
            } else if (elements.ash) {
              pixel.element = "ash";
              converted = true;
            }
          }
        }
      } catch (e) {
        console.log("Wildfire mod: charring skipped a tick (" + e.message + ")");
      }

      if (!converted && baseTick) baseTick.call(elements[id], pixel);
    };
  }

  // Roughly 4x longer than a typical short burn, so wood visibly chars
  // and smolders instead of vanishing almost immediately
  applyGradualCharring("hickory", "#8b5a2b", 400);
  applyGradualCharring("dry_vegetation", "#aa8833", 250);

  console.log("🔥 Gradual charring added");

  // ---------- Test button (placeable in-game, no console needed) ----------

  elements.wildfire_test_button = {
    name: "Wildfire Test Button",
    color: "#ff6600",
    behavior: behaviors.WALL,
    category: "special",
    state: "solid",
    desc: "Place this to spawn a full wildfire response test scene.",
    tick: function (pixel) {
      if (!pixel.fired) {
        pixel.fired = true;
        for (let x = -5; x <= 5; x++) {
          safeCreatePixel("fire", pixel.x + x, pixel.y - 1);
        }
        safeCreatePixel("firefighter", pixel.x + 6, pixel.y);
        safeCreatePixel("wildland_firefighter", pixel.x - 6, pixel.y);
        safeCreatePixel("fire_truck", pixel.x, pixel.y);
        safeCreatePixel("firefighting_helicopter", pixel.x, pixel.y - 20);
        safeCreatePixel("water_tanker_plane", pixel.x + 15, pixel.y - 25);
        safeCreatePixel("red_retardant_tanker", pixel.x - 15, pixel.y - 25);
      }
    },
  };

  console.log("🔥 REALISTIC WILDFIRE MOD READY - place 'Wildfire Test Button' to test everything at once");

});

