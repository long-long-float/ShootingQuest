(function() {
  var ASSETS, AimBullet, AimStraightMover, AimStraightShooter, BULLET_IMG, Bullet, CountLabel, DRAGON_IMG, Dragon, ENEMY_IMG, EXPLODE_IMG, Enemy, FLOOR_IMG, Gauge, MAP_IMG, MATERIAL_STATES, MOVE_VEROCITY, Material, Mover, PLAYER_IMG, Player, Shooter, ShotShooter, Soldier, StraightMover, StraightShooter, add, bind_new, enemies, enemy_bullets, exp, exp_gauge, floors, game, intoWindow, isInWindow, level_label, normalize, player, player_bullets, players, puts, rand, remove, to_angle, to_angle_material, to_vec, var_dump,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  enchant();

  ASSETS = [PLAYER_IMG = 'player.png', ENEMY_IMG = 'enemy.png', DRAGON_IMG = 'dragon.png', EXPLODE_IMG = 'explode.png', BULLET_IMG = 'icon0.png', MAP_IMG = 'map1.png', FLOOR_IMG = 'floor.png'];

  MATERIAL_STATES = {
    LIVING: 0,
    DYING: 1
  };

  game = null;

  exp_gauge = null;

  player = null;

  players = null;

  enemies = null;

  player_bullets = null;

  enemy_bullets = null;

  floors = null;

  level_label = null;

  exp = 0;

  MOVE_VEROCITY = 1;

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  bind_new = function() {
    var args, klass;
    klass = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return function() {
      var first_args;
      first_args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(klass, slice.call(first_args).concat(slice.call(args)), function(){});
    };
  };

  var_dump = function(obj, max_length) {
    var key, val;
    if (max_length == null) {
      max_length = 20;
    }
    return ((function() {
      var results;
      results = [];
      for (key in obj) {
        val = obj[key];
        results.push(key + " : " + val);
      }
      return results;
    })()).filter(function(e) {
      return !(typeof e === 'string' || e instanceof String) || e.length <= max_length;
    });
  };

  puts = function() {
    var j, len1, ret, v;
    ret = [];
    for (j = 0, len1 = arguments.length; j < len1; j++) {
      v = arguments[j];
      console.log(v);
      ret.push(v);
    }
    if (ret.length === 1) {
      return ret[0];
    } else {
      return ret;
    }
  };

  rand = function(min, max) {
    var d;
    if (max == null) {
      max = min;
      min = 0;
    }
    min = Math.floor(min);
    max = Math.floor(max);
    d = max - min;
    if (d !== 0) {
      return min + Math.floor(Math.random() * d) % d;
    } else {
      return min;
    }
  };

  Array.prototype.choise = function() {
    return this[Math.floor(Math.random() * this.length) % this.length];
  };

  Array.prototype.probability_choise = function() {
    var e, j, k, len1, len2, r, sum;
    sum = 0;
    for (j = 0, len1 = this.length; j < len1; j++) {
      e = this[j];
      sum += e.p;
    }
    r = rand(sum) + 1;
    sum = 0;
    for (k = 0, len2 = this.length; k < len2; k++) {
      e = this[k];
      sum += e.p;
      if (r <= sum) {
        return e;
      }
    }
    return null;
  };

  normalize = function() {
    var i, j, k, len, len1, len2, results, sum;
    sum = 0;
    for (j = 0, len1 = arguments.length; j < len1; j++) {
      i = arguments[j];
      sum += i * i;
    }
    len = Math.sqrt(sum);
    results = [];
    for (k = 0, len2 = arguments.length; k < len2; k++) {
      i = arguments[k];
      results.push(i / len);
    }
    return results;
  };

  to_angle = function(x, y) {
    var ret;
    ret = Math.atan2(y, x) + Math.PI / 2;
    if (!isNaN(ret)) {
      return ret;
    } else {
      if (y >= 0) {
        return Math.PI;
      } else {
        return 0;
      }
    }
  };

  to_angle_material = function(mat1, mat2) {
    return to_angle((mat2.x + mat2.width / 2) - (mat1.x + mat1.width / 2), (mat2.y + mat2.height / 2) - (mat1.y + mat1.height / 2));
  };

  to_vec = function(angle) {
    return [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)];
  };

  enchant.Timeline.prototype.forloop = function(interval, count, fun) {
    var arg, i, j, ref;
    arg = {};
    for (i = j = 1, ref = count; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
      arg[i * interval] = fun;
    }
    this.cue(arg);
    return this;
  };

  add = function(node) {
    return game.currentScene.addChild(node);
  };

  remove = function(node) {
    return game.currentScene.removeChild(node);
  };

  isInWindow = function(material) {
    var x, y;
    x = material.x + material.width / 2;
    y = material.y + material.height / 2;
    return (0 <= x && x < game.width) && (0 <= y && y < game.height);
  };

  intoWindow = function(material) {
    var t;
    if (material.rx < 0) {
      material.rx = 0;
    }
    t = game.width - 1;
    if (material.rx > t) {
      material.rx = t;
    }
    if (material.ry < 0) {
      material.ry = 0;
    }
    t = game.height - 1;
    if (material.ry > t) {
      return material.ry = t;
    }
  };

  Material = (function(superClass) {
    extend(Material, superClass);

    function Material(img_name, frame, width, height, rradius1, group1) {
      this.rradius = rradius1;
      this.group = group1;
      Material.__super__.constructor.call(this, width, height);
      this.image = game.assets[img_name];
      this.frame = frame;
      this.group.addChild(this);
      this.hp = 1;
      this.power = 1;
      this.vx = 0;
      this.vy = 0;
      this._died = false;
    }

    Material.prototype.damage = function(material) {
      this.hp -= material.power;
      if (this.hp <= 0) {
        this.hp = 0;
        return this.kill();
      }
    };

    Material.prototype.attack = function(material) {
      material.damage(this);
      return this.damage(material);
    };

    Material.property('rx', {
      get: function() {
        return this.x + this.width / 2;
      },
      set: function(x) {
        return this.x = x - this.width / 2;
      }
    });

    Material.property('ry', {
      get: function() {
        return this.y + this.height / 2;
      },
      set: function(y) {
        return this.y = y - this.height / 2;
      }
    });

    Material.prototype.kill = function() {
      this._died = true;
      return this.ondying();
    };

    Material.prototype.ondying = function() {};

    Material.prototype.hit_check = function(material) {
      var dist, dr, dx, dy, rdist;
      dx = (this.x + this.width / 2) - (material.x + material.width / 2);
      dy = (this.y + this.height / 2) - (material.y + material.height / 2);
      rdist = dx * dx + dy * dy;
      dr = this.rradius + material.rradius;
      dist = dr * dr;
      return rdist <= dist;
    };

    Material.prototype.onenterframe = function() {
      this.x += this.vx;
      return this.y += this.vy;
    };

    Material.prototype.update_rotation = function() {
      return this.rotation = this.vx === 0 && this.vy === 0 ? 180 : to_angle(this.vx, this.vy) / Math.PI * 180;
    };

    return Material;

  })(Sprite);

  Player = (function(superClass) {
    extend(Player, superClass);

    function Player() {
      Player.__super__.constructor.call(this, PLAYER_IMG, 27, 32, 32, 1, players);
      this.rx = game.width / 2;
      this.ry = game.height / 3 * 2;
      this.core = new Material(BULLET_IMG, 20, 16, 16, 0, game.currentScene);
      this.core.scale(this.rradius * 8 / this.core.width, this.rradius * 8 / this.core.height);
      this.core.rx = this.rx;
      this.core.ry = this.ry;
      this.level = 1;
    }

    Player.prototype.level_up = function() {
      return this.level++;
    };

    Player.prototype.onenterframe = function() {
      var angle, i, j, ref, ref1, results, space, vx, vy, way;
      Player.__super__.onenterframe.apply(this, arguments);
      this.core.rx = this.rx;
      this.core.ry = this.ry;
      if (game.frame % (game.fps / 15) === 0) {
        way = Math.min(10, this.level * 2 - 1);
        space = (Math.PI / 3) / (way - 1);
        angle = way === 1 ? 0 : -(Math.PI / 3) / 2;
        results = [];
        for (i = j = 1, ref = way; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          ref1 = to_vec(angle), vx = ref1[0], vy = ref1[1];
          new Bullet(this.rx, this.ry - this.height / 2, vx, vy, player_bullets, 10, 48);
          results.push(angle += space);
        }
        return results;
      }
    };

    Player.prototype.ondying = function() {
      remove(this.core);
      alert("経験値:" + exp + " レベル:" + this.level);
      return location.reload();
    };

    return Player;

  })(Material);

  Enemy = (function(superClass) {
    extend(Enemy, superClass);

    function Enemy(image, frame, width, height, rradius, x, y) {
      Enemy.__super__.constructor.call(this, image, frame, width, height, rradius, enemies);
      this.rx = x;
      this.ry = y;
      this.hp = 10;
      this.mover = new Mover(this);
      this.shooter = new Shooter;
      this.update_rotation();
      this.state = MATERIAL_STATES.LIVING;
    }

    Enemy.prototype.onenterframe = function() {
      if (this.state !== MATERIAL_STATES.DYING) {
        Enemy.__super__.onenterframe.apply(this, arguments);
        this.update_rotation();
        if (game.frame % (game.fps / 5) === 0) {
          this.shooter["do"]();
        }
        this.mover["do"]();
      }
      if (this.ry > game.height) {
        return enemies.removeChild(this);
      }
    };

    Enemy.prototype.ondying = function() {
      var rx, ry;
      exp_gauge.add(1);
      exp++;
      rx = this.rx;
      ry = this.ry;
      this.state = MATERIAL_STATES.DYING;
      this.width = 16;
      this.height = 16;
      this.scale(this.rradius / (this.width * 2) * 4, this.rradius / (this.height * 2) * 4);
      this.rx = rx;
      this.ry = ry;
      this._died = false;
      this.image = game.assets[EXPLODE_IMG];
      this.frame = 0;
      return this.tl.forloop(10, 5, (function(_this) {
        return function() {
          return _this.frame++;
        };
      })(this)).then((function(_this) {
        return function() {
          return _this._died = true;
        };
      })(this));
    };

    return Enemy;

  })(Material);

  Soldier = (function(superClass) {
    extend(Soldier, superClass);

    function Soldier(x, y) {
      Soldier.__super__.constructor.call(this, ENEMY_IMG, 0, 32, 32, 16, x, y);
    }

    return Soldier;

  })(Enemy);

  Dragon = (function(superClass) {
    extend(Dragon, superClass);

    function Dragon(x, y) {
      Dragon.__super__.constructor.call(this, DRAGON_IMG, 0, 80, 64, 30, x, y);
    }

    Dragon.prototype.ondying = function() {
      var bullet, cues, i, j, k, len1, ref;
      Dragon.__super__.ondying.apply(this, arguments);
      ref = enemy_bullets.childNodes;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        bullet = ref[j];
        bullet._died = true;
      }
      cues = {};
      for (i = k = 1; k < 20; i = k += 2) {
        cues[i * 5] = function() {
          return floors.moveBy(rand(-20, 20), rand(-20, 20));
        };
        cues[i * 5 + 5] = function() {
          return floors.moveTo(0, 0);
        };
      }
      return floors.tl.cue(cues);
    };

    return Dragon;

  })(Enemy);

  Mover = (function() {
    function Mover(parent) {
      this.parent = parent;
    }

    Mover.prototype["do"] = function() {
      return this.parent.ry += MOVE_VEROCITY;
    };

    return Mover;

  })();

  StraightMover = (function(superClass) {
    extend(StraightMover, superClass);

    function StraightMover(parent, vx, vy) {
      this.parent = parent;
      this.parent.vx = vx;
      this.parent.vy = vy;
    }

    return StraightMover;

  })(Mover);

  AimStraightMover = (function(superClass) {
    extend(AimStraightMover, superClass);

    function AimStraightMover(parent, v1, fixed) {
      var ref;
      this.parent = parent;
      this.v = v1;
      this.fixed = fixed;
      if (this.fixed) {
        ref = normalize(player.rx - this.parent.rx, player.ry - this.parent.ry).map((function(_this) {
          return function(v) {
            return v * _this.v;
          };
        })(this)), this.parent.vx = ref[0], this.parent.vy = ref[1];
      } else {
        this.parent.vy = 1;
      }
    }

    AimStraightMover.prototype["do"] = function() {
      var angle, goal_angle, now_angle, ref;
      if (!this.fixed) {
        angle = now_angle = to_angle(this.parent.vx, this.parent.vy);
        goal_angle = to_angle_material(this.parent, player);
        angle += normalize(goal_angle - now_angle) * Math.PI / 300;
        return ref = to_vec(angle).map((function(_this) {
          return function(v) {
            return v * _this.v;
          };
        })(this)), this.parent.vx = ref[0], this.parent.vy = ref[1], ref;
      }
    };

    return AimStraightMover;

  })(Mover);

  Shooter = (function() {
    function Shooter() {}

    Shooter.prototype["do"] = function() {};

    return Shooter;

  })();

  StraightShooter = (function(superClass) {
    extend(StraightShooter, superClass);

    function StraightShooter(parent, level, bullet_klass, odd_way, vx1, vy1) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
      this.odd_way = odd_way;
      this.vx = vx1;
      this.vy = vy1;
    }

    StraightShooter.prototype["do"] = function() {
      var angle, i, j, ref, ref1, results, space, vx, vy, way;
      way = (this.odd_way ? 1 : 0) + this.level;
      space = (Math.PI / 3) / (way - 1);
      angle = to_angle(this.vx, this.vy) + (way === 1 ? 0 : -(Math.PI / 3) / 2);
      results = [];
      for (i = j = 1, ref = way; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        ref1 = to_vec(angle), vx = ref1[0], vy = ref1[1];
        new this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets);
        results.push(angle += space);
      }
      return results;
    };

    return StraightShooter;

  })(Shooter);

  AimStraightShooter = (function(superClass) {
    extend(AimStraightShooter, superClass);

    function AimStraightShooter(parent, level, bullet_klass, odd_way, fixed) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
      this.odd_way = odd_way;
      this.fixed = fixed;
      this.way = (this.odd_way ? 1 : 0) + this.level;
      this.space = (Math.PI / 3) / (this.way - 1);
      if (this.fixed) {
        this.fixed_angle = this.make_init_angle();
      }
    }

    AimStraightShooter.prototype["do"] = function() {
      var angle, i, j, ref, ref1, results, vx, vy;
      angle = this.fixed ? this.fixed_angle : this.make_init_angle();
      results = [];
      for (i = j = 1, ref = this.way; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        ref1 = to_vec(angle), vx = ref1[0], vy = ref1[1];
        new this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets);
        results.push(angle += this.space);
      }
      return results;
    };

    AimStraightShooter.prototype.make_init_angle = function() {
      return to_angle(player.rx - this.parent.rx, player.ry - this.parent.ry) + (this.way === 1 ? 0 : -(Math.PI / 3) / 2);
    };

    return AimStraightShooter;

  })(Shooter);

  ShotShooter = (function(superClass) {
    extend(ShotShooter, superClass);

    function ShotShooter(parent, level, bullet_klass) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
    }

    ShotShooter.prototype["do"] = function() {
      var angle, i, j, ref, ref1, results, space, vx, vy;
      angle = 0;
      space = Math.PI / this.level * 3;
      results = [];
      for (i = j = 1, ref = Math.PI * 2 / space; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        angle -= space * Math.random() * 2;
        ref1 = to_vec(angle), vx = ref1[0], vy = ref1[1];
        results.push(new this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets));
      }
      return results;
    };

    return ShotShooter;

  })(Shooter);

  Bullet = (function(superClass) {
    extend(Bullet, superClass);

    function Bullet(x, y, vx, vy, group, v, frame) {
      var ref;
      Bullet.__super__.constructor.call(this, BULLET_IMG, frame, 16, 16, 1, group);
      this.rx = x;
      this.ry = y;
      ref = normalize(vx, vy).map(function(e) {
        return e * v;
      }), this.vx = ref[0], this.vy = ref[1];
      this.update_rotation();
    }

    Bullet.prototype.onenterframe = function() {
      Bullet.__super__.onenterframe.call(this);
      if (!isInWindow(this)) {
        return this.kill();
      }
    };

    return Bullet;

  })(Material);

  AimBullet = (function(superClass) {
    extend(AimBullet, superClass);

    function AimBullet() {
      return AimBullet.__super__.constructor.apply(this, arguments);
    }

    AimBullet.prototype.onenterframe = function() {
      var ref;
      AimBullet.__super__.onenterframe.apply(this, arguments);
      if (this.age === game.fps) {
        ref = normalize(player.rx - this.rx, player.ry - this.ry).map((function(_this) {
          return function(v) {
            return v * Math.sqrt(_this.vx * _this.vx + _this.vy * _this.vy) * 2;
          };
        })(this)), this.vx = ref[0], this.vy = ref[1];
        return this.update_rotation();
      }
    };

    return AimBullet;

  })(Bullet);

  Gauge = (function(superClass) {
    extend(Gauge, superClass);

    function Gauge(x, y, width, height, _value) {
      this._value = _value;
      Gauge.__super__.constructor.apply(this, arguments);
      this.x = x;
      this.y = y;
      this.width = this.max_width = width;
      this.height = height;
      this.backgroundColor = '#00ff00';
      this.max_value = this._value;
    }

    Gauge.property('value', {
      get: function() {
        return this._value;
      },
      set: function(value) {
        this._value = value;
        return this.width = this.max_width * this._value / this.max_value;
      }
    });

    Gauge.prototype.add = function(value) {
      this.value += value;
      if (this.value >= this.max_value) {
        this.value = 0;
        return this.onmax();
      }
    };

    Gauge.prototype.onmax = function() {};

    return Gauge;

  })(Entity);

  CountLabel = (function(superClass) {
    extend(CountLabel, superClass);

    function CountLabel(x, y) {
      CountLabel.__super__.constructor.apply(this, arguments);
      this.x = x;
      this.y = y;
      this.color = '#ffffff';
      this.font = "bold 20px Arial";
      this._count = 0;
      this.label = '';
    }

    CountLabel.property('count', {
      get: function() {
        return this._count;
      },
      set: function(c) {
        this._count = c;
        return this.text = "" + this.label + this._count;
      }
    });

    return CountLabel;

  })(Label);

  window.onload = function() {
    game = new Game(320, 320);
    game.fps = 60;
    game.preload(ASSETS);
    game.onload = function() {
      var bex, bey, floor, h, j, k, movers, positions, ref, ref1, scene, shooters, size, w, x, y;
      scene = game.rootScene;
      scene.backgroundColor = '#000';
      floors = new Group;
      add(floors);
      size = 320;
      for (y = j = -1, ref = game.height / size; -1 <= ref ? j <= ref : j >= ref; y = -1 <= ref ? ++j : --j) {
        for (x = k = 0, ref1 = game.width / size + 1; 0 <= ref1 ? k <= ref1 : k >= ref1; x = 0 <= ref1 ? ++k : --k) {
          floor = new Sprite(size, size);
          floor.image = game.assets[FLOOR_IMG];
          floor.x = x * size;
          floor.y = y * size;
          floor.onenterframe = function() {
            this.y += MOVE_VEROCITY;
            if (this.y >= (Math.floor(game.height / size) + 1) * size) {
              return this.y = -size;
            }
          };
          floors.addChild(floor);
        }
      }
      players = new Group;
      add(players);
      player = new Player;
      enemies = new Group;
      add(enemies);
      player_bullets = new Group;
      add(player_bullets);
      enemy_bullets = new Group;
      add(enemy_bullets);
      level_label = new CountLabel(0, game.height - 30);
      level_label.label = 'Level : ';
      level_label.count = player.level;
      add(level_label);
      exp_gauge = new Gauge(0, 0, game.width, 10, 10);
      exp_gauge.value = 0;
      exp_gauge.onmax = function() {
        player.level_up();
        level_label.count += 1;
        return this.max_value = Math.floor(this.max_value * 1.3);
      };
      add(exp_gauge);
      w = game.width;
      h = game.height;
      positions = slice.call((function() {
          var l, results;
          results = [];
          for (x = l = 1; l <= 4; x = ++l) {
            results.push({
              p: 2,
              pos: [x * w / 5, -50]
            });
          }
          return results;
        })()).concat([{
          p: 1,
          pos: [-50, h / 4],
          mover: bind_new(StraightMover, 2, 0)
        }], [{
          p: 1,
          pos: [w + 50, h / 4],
          mover: bind_new(StraightMover, -2, 0)
        }]);
      movers = [
        {
          p: 2,
          mover: bind_new(Mover)
        }, {
          p: 1,
          mover: bind_new(AimStraightMover, 4, true)
        }, {
          p: 1,
          mover: bind_new(AimStraightMover, 2, false)
        }
      ];
      shooters = [
        {
          p: 1,
          shooter: bind_new(StraightShooter, bind_new(Bullet, 2, 56), true, 0, 1)
        }, {
          p: 1,
          shooter: bind_new(StraightShooter, bind_new(Bullet, 2, 56), false, 0, 1)
        }, {
          p: 1,
          shooter: bind_new(AimStraightShooter, bind_new(Bullet, 2, 56), true, true)
        }, {
          p: 1,
          shooter: bind_new(AimStraightShooter, bind_new(Bullet, 2, 56), false, true)
        }, {
          p: 1,
          shooter: bind_new(ShotShooter, bind_new(AimBullet, 2, 66))
        }
      ];
      scene.onenterframe = function() {
        var d, dist, dr, dx, dy, e, first, group, group_set, group_sets, i, l, len1, len2, len3, len4, len5, m, mover, n, o, p, pos, q, rdist, ref2, ref3, ref4, ref5, ref6, s, second, u, v;
        ref2 = [players, enemies, player_bullets, enemy_bullets];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          group = ref2[l];
          ref3 = group.childNodes;
          for (n = 0, len2 = ref3.length; n < len2; n++) {
            m = ref3[n];
            if (m != null ? m._died : void 0) {
              m.group.removeChild(m);
            }
          }
        }
        group_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]];
        for (o = 0, len3 = group_sets.length; o < len3; o++) {
          group_set = group_sets[o];
          ref4 = group_set[0].childNodes;
          for (q = 0, len4 = ref4.length; q < len4; q++) {
            first = ref4[q];
            if (first.state === MATERIAL_STATES.DYING) {
              continue;
            }
            ref5 = group_set[1].childNodes;
            for (s = 0, len5 = ref5.length; s < len5; s++) {
              second = ref5[s];
              if (second.state === MATERIAL_STATES.DYING) {
                continue;
              }
              dx = (first.x + first.width / 2) - (second.x + second.width / 2);
              dy = (first.y + first.height / 2) - (second.y + second.height / 2);
              rdist = dx * dx + dy * dy;
              dr = first.rradius + second.rradius;
              dist = dr * dr;
              if (rdist <= dist) {
                first.attack(second);
              }
            }
          }
        }
        if (game.frame % (game.fps * 2) === 0) {
          for (i = u = 1, ref6 = Math.max(player.level, 2); 1 <= ref6 ? u <= ref6 : u >= ref6; i = 1 <= ref6 ? ++u : --u) {
            pos = positions.probability_choise();
            p = pos.pos;
            e = new Soldier(p[0], p[1]);
            mover = pos.mover;
            if (mover != null) {
              e.mover = mover(e);
            } else {
              e.mover = movers.probability_choise().mover(e);
            }
            e.shooter = shooters.probability_choise().shooter(e, player.level);
          }
        }
        if (game.frame % (game.fps * 5) === 0) {
          d = new Dragon(game.width / 2, 0);
          d.shooter = new AimStraightShooter(d, player.level + 3, bind_new(Bullet, 2, 56), true, false);
        }
        v = 2;
        if (game.input.up) {
          player.y -= v;
        }
        if (game.input.down) {
          player.y += v;
        }
        if (game.input.left) {
          player.x -= v;
        }
        if (game.input.right) {
          player.x += v;
        }
        return intoWindow(player);
      };
      bex = bey = 0;
      scene.ontouchstart = function(e) {
        bex = e.x;
        return bey = e.y;
      };
      return scene.ontouchmove = function(e) {
        player.x += e.x - bex;
        player.y += e.y - bey;
        bex = e.x;
        return bey = e.y;
      };
    };
    return game.start();
  };

}).call(this);
