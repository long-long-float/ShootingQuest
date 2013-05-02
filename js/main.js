// Generated by CoffeeScript 1.6.2
(function() {
  var ASSETS, AimBullet, AimStraightMover, AimStraightShooter, BULLET_IMG, Bullet, Enemy, Gauge, MAP_IMG, Material, Mover, PLAYER_IMG, Player, Shooter, ShotShooter, StraightMover, StraightShooter, add, bind_new, enemies, enemy_bullets, exp, game, intoWindow, isInWindow, normalize, player, player_bullets, players, puts, rand, remove, to_angle, to_angle_material, to_vec, var_dump, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  enchant();

  ASSETS = [PLAYER_IMG = 'player.png', BULLET_IMG = 'icon0.png', MAP_IMG = 'map1.png'];

  game = null;

  exp = null;

  player = null;

  players = null;

  enemies = null;

  player_bullets = null;

  enemy_bullets = null;

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  bind_new = function() {
    var args, klass;

    klass = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function() {
      var first_args;

      first_args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(klass, __slice.call(first_args).concat(__slice.call(args)), function(){});
    };
  };

  var_dump = function(obj, max_length) {
    var key, val;

    if (max_length == null) {
      max_length = 20;
    }
    return ((function() {
      var _results;

      _results = [];
      for (key in obj) {
        val = obj[key];
        _results.push("" + key + " : " + val);
      }
      return _results;
    })()).filter(function(e) {
      return !(typeof e === 'string' || e instanceof String) || e.length <= max_length;
    });
  };

  puts = function() {
    var ret, v, _i, _len;

    ret = [];
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      v = arguments[_i];
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
    var e, r, sum, _i, _j, _len, _len1;

    sum = 0;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      e = this[_i];
      sum += e.p;
    }
    r = rand(sum) + 1;
    sum = 0;
    for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
      e = this[_j];
      sum += e.p;
      if (r <= sum) {
        return e;
      }
    }
    return null;
  };

  normalize = function(x, y) {
    var len;

    len = Math.sqrt(x * x + y * y);
    return [x / len, y / len];
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

  Material = (function(_super) {
    __extends(Material, _super);

    function Material(img_name, frame, width, height, rradius, group) {
      this.rradius = rradius;
      this.group = group;
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

  Player = (function(_super) {
    __extends(Player, _super);

    function Player() {
      Player.__super__.constructor.call(this, PLAYER_IMG, 27, 32, 32, 1, players);
      this.scale(2, 2);
      this.rx = game.width / 2;
      this.ry = game.height / 3 * 2;
      this.core = new Material(BULLET_IMG, 20, 16, 16, 0, game.currentScene);
      this.core.scale(this.rradius * 8 / this.core.width, this.rradius * 8 / this.core.height);
      this.core.rx = this.rx;
      this.core.ry = this.ry;
    }

    Player.prototype.onenterframe = function() {
      var i, _i, _results;

      Player.__super__.onenterframe.apply(this, arguments);
      this.core.rx = this.rx;
      this.core.ry = this.ry;
      if (game.frame % (game.fps / 15) === 0) {
        _results = [];
        for (i = _i = -3; _i <= 3; i = ++_i) {
          _results.push(new Bullet(this.rx + (this.width / 4) * i, this.ry - this.height / 2, 0, -1, player_bullets, 15, 48));
        }
        return _results;
      }
    };

    Player.prototype.ondying = function() {
      return remove(this.core);
    };

    return Player;

  })(Material);

  Enemy = (function(_super) {
    __extends(Enemy, _super);

    function Enemy(x, y) {
      Enemy.__super__.constructor.call(this, PLAYER_IMG, 0, 32, 32, 16, enemies);
      this.scale(2, -2);
      this.rx = x;
      this.ry = y;
      this.hp = 10;
      this.mover = new Mover;
      this.shooter = new Shooter;
      this.update_rotation();
    }

    Enemy.prototype.onenterframe = function() {
      Enemy.__super__.onenterframe.apply(this, arguments);
      this.update_rotation();
      if (game.frame % (game.fps / 5) === 0) {
        this.shooter["do"]();
      }
      return this.mover["do"]();
    };

    return Enemy;

  })(Material);

  Mover = (function() {
    function Mover() {}

    Mover.prototype["do"] = function() {};

    return Mover;

  })();

  StraightMover = (function(_super) {
    __extends(StraightMover, _super);

    function StraightMover(parent, vx, vy) {
      this.parent = parent;
      this.parent.vx = vx;
      this.parent.vy = vy;
    }

    StraightMover.prototype["do"] = function() {};

    return StraightMover;

  })(Mover);

  AimStraightMover = (function(_super) {
    __extends(AimStraightMover, _super);

    function AimStraightMover(parent, v, fixed) {
      this.parent = parent;
      this.v = v;
      this.fixed = fixed;
      if (this.fixed) {
        this.set_velocity();
      }
    }

    AimStraightMover.prototype["do"] = function() {
      if (!this.fixed) {
        return this.set_velocity();
      }
    };

    AimStraightMover.prototype.set_velocity = function() {
      var _ref,
        _this = this;

      return _ref = normalize(player.rx - this.parent.rx, player.ry - this.parent.ry).map(function(v) {
        return v * _this.v;
      }), this.parent.vx = _ref[0], this.parent.vy = _ref[1], _ref;
    };

    return AimStraightMover;

  })(Mover);

  Shooter = (function() {
    function Shooter() {}

    Shooter.prototype["do"] = function() {};

    return Shooter;

  })();

  StraightShooter = (function(_super) {
    __extends(StraightShooter, _super);

    function StraightShooter(parent, level, bullet_klass, odd_way, vx, vy) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
      this.odd_way = odd_way;
      this.vx = vx;
      this.vy = vy;
    }

    StraightShooter.prototype["do"] = function() {
      var angle, i, space, vx, vy, way, _i, _ref, _ref1, _results;

      way = ((_ref = this.odd_way) != null ? _ref : {
        1: 0
      }) + this.level * 2;
      space = Math.PI / this.level;
      angle = to_angle(this.xv, this.vy) + (way % 2 === 0 ? space / 2 : space) * Math.floor(way / 2);
      _results = [];
      for (i = _i = 1; 1 <= way ? _i <= way : _i >= way; i = 1 <= way ? ++_i : --_i) {
        _ref1 = to_vec(angle), vx = _ref1[0], vy = _ref1[1];
        this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets);
        _results.push(angle -= space);
      }
      return _results;
    };

    return StraightShooter;

  })(Shooter);

  AimStraightShooter = (function(_super) {
    __extends(AimStraightShooter, _super);

    function AimStraightShooter(parent, level, bullet_klass, odd_way, fixed) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
      this.odd_way = odd_way;
      this.fixed = fixed;
      this.px = player.rx;
      this.py = player.ry;
      if (this.fixed) {
        this.fixed_angle = this.make_init_angle();
      }
    }

    AimStraightShooter.prototype["do"] = function() {
      var angle, i, vx, vy, _i, _ref, _ref1, _results;

      angle = this.fixed ? this.fixed_angle : this.make_init_angle();
      _results = [];
      for (i = _i = 1, _ref = this.way; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _ref1 = to_vec(angle), vx = _ref1[0], vy = _ref1[1];
        this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets);
        _results.push(angle -= this.space);
      }
      return _results;
    };

    AimStraightShooter.prototype.make_init_angle = function() {
      var _ref;

      this.way = ((_ref = this.odd_way) != null ? _ref : {
        1: 0
      }) + this.level * 2;
      this.space = Math.PI / this.level;
      return to_angle(this.px - this.parent.rx, this.py - this.parent.ry) + (this.way % 2 === 0 ? this.space / 2 : this.space) * Math.floor(this.way / 2);
    };

    return AimStraightShooter;

  })(Shooter);

  ShotShooter = (function(_super) {
    __extends(ShotShooter, _super);

    function ShotShooter(parent, level, bullet_klass) {
      this.parent = parent;
      this.level = level;
      this.bullet_klass = bullet_klass;
    }

    ShotShooter.prototype["do"] = function() {
      var angle, i, space, vx, vy, _i, _ref, _ref1, _results;

      angle = 0;
      space = Math.PI / this.level;
      _results = [];
      for (i = _i = 1, _ref = Math.PI * 2 / space; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _ref1 = to_vec(angle), vx = _ref1[0], vy = _ref1[1];
        this.bullet_klass(this.parent.rx, this.parent.ry, vx, vy, enemy_bullets);
        _results.push(angle -= space * Math.random() * 2);
      }
      return _results;
    };

    return ShotShooter;

  })(Shooter);

  Bullet = (function(_super) {
    __extends(Bullet, _super);

    function Bullet(x, y, vx, vy, group, v, frame) {
      var _ref;

      Bullet.__super__.constructor.call(this, BULLET_IMG, frame, 16, 16, 1, group);
      this.rx = x;
      this.ry = y;
      _ref = normalize(vx, vy).map(function(e) {
        return e * v;
      }), this.vx = _ref[0], this.vy = _ref[1];
      this.update_rotation();
    }

    Bullet.prototype.onenterframe = function() {
      Bullet.__super__.onenterframe.apply(this, arguments);
      if (!isInWindow(this)) {
        return this.kill();
      }
    };

    return Bullet;

  })(Material);

  AimBullet = (function(_super) {
    __extends(AimBullet, _super);

    function AimBullet() {
      _ref = AimBullet.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AimBullet.prototype.onenterframe = function() {
      var _ref1,
        _this = this;

      AimBullet.__super__.onenterframe.apply(this, arguments);
      if (this.age === game.fps) {
        _ref1 = normalize(player.rx - this.rx, player.ry - this.ry).map(function(v) {
          return v * Math.sqrt(_this.vx * _this.vx + _this.vy * _this.vy) * 2;
        }), this.vx = _ref1[0], this.vy = _ref1[1];
        return this.update_rotation();
      }
    };

    return AimBullet;

  })(Bullet);

  Gauge = (function(_super) {
    __extends(Gauge, _super);

    function Gauge(x, y, width, height, _value) {
      this._value = _value;
      this.x = x;
      this.y = y;
      this.width = width;
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
        return this.width = this._value / this.max_value;
      }
    });

    return Gauge;

  })(Entity);

  window.onload = function() {
    game = new Game(400, 600);
    game.fps = 60;
    game.preload(ASSETS);
    game.onload = function() {
      var MOVE_VEROCITY, bex, bey, floor, h, movers, positions, scene, shooters, size, w, x, y, _i, _j, _ref1, _ref2;

      scene = game.rootScene;
      scene.backgroundColor = '#ffffff';
      MOVE_VEROCITY = 4;
      size = 32;
      for (y = _i = -1, _ref1 = game.height / size; -1 <= _ref1 ? _i <= _ref1 : _i >= _ref1; y = -1 <= _ref1 ? ++_i : --_i) {
        for (x = _j = 0, _ref2 = game.width / size + 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; x = 0 <= _ref2 ? ++_j : --_j) {
          floor = new Sprite(size / 2, size / 2);
          floor.image = game.assets[MAP_IMG];
          floor.frame = 64;
          floor.scale(2, 2);
          floor.x = x * size;
          floor.y = y * size;
          floor.onenterframe = function() {
            this.y += MOVE_VEROCITY;
            if (this.y >= (Math.floor(game.height / size) + 1) * size) {
              return this.y = -size;
            }
          };
          add(floor);
        }
      }
      players = new Group;
      add(players);
      enemies = new Group;
      add(enemies);
      player_bullets = new Group;
      add(player_bullets);
      enemy_bullets = new Group;
      add(enemy_bullets);
      exp = new Gauge(0, 0, game.width, 30);
      add(exp);
      player = new Player;
      w = game.width;
      h = game.height;
      positions = __slice.call((function() {
          var _k, _results;

          _results = [];
          for (x = _k = 0; _k <= 5; x = ++_k) {
            _results.push({
              p: 2,
              pos: [x * w / 5, -50]
            });
          }
          return _results;
        })()).concat([{
          p: 1,
          pos: [-50, h / 4],
          mover: bind_new(StraightMover, 4, 0)
        }], [{
          p: 1,
          pos: [w + 50, h / 4],
          mover: bind_new(StraightMover, -4, 0)
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
          mover: bind_new(AimStraightMover, 4, false)
        }
      ];
      shooters = [
        {
          p: 1,
          shooter: bind_new(StraightShooter, bind_new(Bullet, 4, 56), true, 0, 1)
        }, {
          p: 1,
          shooter: bind_new(StraightShooter, bind_new(Bullet, 4, 56), false, 0, 1)
        }, {
          p: 1,
          shooter: bind_new(AimStraightShooter, bind_new(Bullet, 4, 56), true, true)
        }, {
          p: 1,
          shooter: bind_new(AimStraightShooter, bind_new(Bullet, 4, 56), false, true)
        }, {
          p: 1,
          shooter: bind_new(ShotShooter, bind_new(AimBullet, 4, 65))
        }
      ];
      scene.onenterframe = function() {
        var e, first, group, group_set, group_sets, i, m, mover, p, pos, second, v, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _o, _p, _ref3, _ref4, _ref5, _ref6, _ref7;

        _ref3 = [players, enemies, player_bullets, enemy_bullets];
        for (_k = 0, _len = _ref3.length; _k < _len; _k++) {
          group = _ref3[_k];
          _ref4 = group.childNodes;
          for (_l = 0, _len1 = _ref4.length; _l < _len1; _l++) {
            m = _ref4[_l];
            if (m != null ? m._died : void 0) {
              m.group.removeChild(m);
            }
            if ((m != null) && (m instanceof Enemy)) {
              m.y += MOVE_VEROCITY;
            }
          }
        }
        group_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]];
        for (_m = 0, _len2 = group_sets.length; _m < _len2; _m++) {
          group_set = group_sets[_m];
          _ref5 = group_set[0].childNodes;
          for (_n = 0, _len3 = _ref5.length; _n < _len3; _n++) {
            first = _ref5[_n];
            _ref6 = group_set[1].childNodes;
            for (_o = 0, _len4 = _ref6.length; _o < _len4; _o++) {
              second = _ref6[_o];
              if (first.hit_check(second)) {
                first.attack(second);
              }
            }
          }
        }
        if (game.frame % (game.fps * rand(1, 3)) === 0) {
          for (i = _p = 0, _ref7 = rand(1, 2); 0 <= _ref7 ? _p <= _ref7 : _p >= _ref7; i = 0 <= _ref7 ? ++_p : --_p) {
            pos = positions.probability_choise();
            p = pos.pos;
            e = new Enemy(p[0], p[1]);
            mover = pos.mover;
            if (mover != null) {
              e.mover = mover(e);
            } else {
              e.mover = movers.probability_choise().mover(e);
            }
            e.shooter = shooters.probability_choise().shooter(e, 3);
          }
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
