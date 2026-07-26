runAfterLoad(function () {

  console.log("🔥 Wildfire mod loading...");

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
          createPixel("hose_water", pixel.x + dir, pixel.y);
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
              createPixel("fire_foam", pixel.x + x, pixel.y + y);
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
        createPixel("hose_water", pixel.x + 2, pixel.y - 1);
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
                createPixel(
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
    desc: "Flies over fire and drops water.",
    tick: function (pixel) {
      if (!pixel.dir) pixel.dir = 1;
      pixel.x += pixel.dir;
      if (pixel.x <= 2 || pixel.x >= width - 2) pixel.dir *= -1;
      let found = false;
      for (let y = pixel.y + 1; y < height; y++) {
        if (pixelExists(pixel.x, y)) {
          if (getPixel(pixel.x, y).element === "fire") {
            found = true;
            break;
          }
        }
      }
      if (found && Math.random() < 0.3) {
        for (let i = 0; i < 15; i++) {
          createPixel(
            "hose_water",
            pixel.x + Math.floor(Math.random() * 7) - 3,
            pixel.y + 2
          );
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
    desc: "Drops water on fires from above.",
    tick: function (pixel) {
      if (!pixel.dir) pixel.dir = 1;
      pixel.x += pixel.dir;
      if (pixel.x <= 2 || pixel.x >= width - 2) pixel.dir *= -1;
      let found = false;
      for (let y = pixel.y; y < height; y++) {
        if (pixelExists(pixel.x, y)) {
          if (getPixel(pixel.x, y).element === "fire") {
            found = true;
            break;
          }
        }
      }
      if (found && Math.random() < 0.2) {
        for (let i = 0; i < 25; i++) {
          createPixel(
            "hose_water",
            pixel.x + Math.floor(Math.random() * 15) - 7,
            pixel.y + 2
          );
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
    desc: "Drops fire retardant on fires from above.",
    tick: function (pixel) {
      if (!pixel.dir) pixel.dir = 1;
      pixel.x += pixel.dir;
      if (pixel.x <= 2 || pixel.x >= width - 2) pixel.dir *= -1;
      let found = false;
      for (let y = pixel.y; y < height; y++) {
        if (pixelExists(pixel.x, y)) {
          if (getPixel(pixel.x, y).element === "fire") {
            found = true;
            break;
          }
        }
      }
      if (found && Math.random() < 0.2) {
        for (let i = 0; i < 20; i++) {
          createPixel(
            "red_retardant",
            pixel.x + Math.floor(Math.random() * 13) - 6,
            pixel.y + 2
          );
        }
      }
    },
  };

  console.log("🔥 Machines added");

  // ---------- Realistic fire behavior ----------

  if (elements.fire) {
    let baseFireTick = elements.fire.tick;
    elements.fire.tick = function (pixel) {
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
        createPixel("smoke", pixel.x, pixel.y - 1);
      }

      if (pixel.intensity > 50 && Math.random() < 0.05) {
        let ex = pixel.x + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 15);
        let ey = pixel.y - Math.floor(Math.random() * 5);
        if (pixelExists(ex, ey)) {
          if (getPixel(ex, ey).element === "grass") {
            createPixel("fire", ex, ey);
          }
        }
      }

      if (baseFireTick) baseFireTick(pixel);
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
          return;
        }
        if (baseTick) baseTick(pixel);
      };
    }
  });

  // ---------- Water pressure ----------

  if (elements.water) {
    let baseWaterTick = elements.water.tick;
    elements.water.tick = function (pixel) {
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
      if (baseWaterTick) baseWaterTick(pixel);
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
          } else if (elements.ash) {
            pixel.element = "ash";
          }
          return;
        }
      }

      if (baseTick) baseTick(pixel);
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
          createPixel("fire", pixel.x + x, pixel.y - 1);
        }
        createPixel("firefighter", pixel.x + 6, pixel.y);
        createPixel("wildland_firefighter", pixel.x - 6, pixel.y);
        createPixel("fire_truck", pixel.x, pixel.y);
        createPixel("firefighting_helicopter", pixel.x, pixel.y - 20);
        createPixel("water_tanker_plane", pixel.x + 15, pixel.y - 25);
        createPixel("red_retardant_tanker", pixel.x - 15, pixel.y - 25);
      }
    },
  };

  console.log("🔥 REALISTIC WILDFIRE MOD READY - place 'Wildfire Test Button' to test everything at once");

});
