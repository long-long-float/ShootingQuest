enchant()

ASSETS = [
  PLAYER_IMG = 'player.png',
  ENEMY_IMG  = 'enemy.png',
  DRAGON_IMG = 'dragon.png',
  EXPLODE_IMG= 'explode.png',
  BULLET_IMG = 'icon0.png',
  MAP_IMG    = 'map1.png',
  FLOOR_IMG  = 'floor.png'
]

MATERIAL_STATES = {
  LIVING: 0
  DYING:  1
}

game = null

exp_gauge = null

player = null

players = null
enemies = null

player_bullets = null
enemy_bullets = null

level_label = null

exp = 0

MOVE_VEROCITY = 1

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

bind_new = (klass, args...) ->
  (first_args...) ->
    new klass(first_args..., args...)

var_dump = (obj, max_length = 20) ->
  ("#{key} : #{val}" for key, val of obj).filter (e) ->
    !(typeof e == 'string' || e instanceof String) or e.length <= max_length

puts = ->
  ret = []
  for v in arguments
    console.log v
    ret.push(v)
  if ret.length == 1 then ret[0] else ret

rand = (min, max) ->
  unless max?
    max = min
    min = 0
  min = Math.floor(min)
  max = Math.floor(max)
  d = max - min
  unless d == 0 then min + Math.floor(Math.random() * d) % d else min

Array::choise = ->
  @[Math.floor(Math.random() * @length) % @length]

Array::probability_choise = ->
  sum = 0
  sum += e.p for e in @
  r = rand(sum) + 1
  sum = 0
  for e in @
    sum += e.p
    if r <= sum
      return e
  null

normalize = ->
  sum = 0
  sum += i * i for i in arguments
  len = Math.sqrt(sum)
  (i / len for i in arguments)

to_angle = (x, y) ->
  ret = Math.atan2(y, x) + Math.PI / 2
  if !isNaN(ret)
    ret
  else
    if y >= 0 then Math.PI else 0

to_angle_material = (mat1, mat2) ->
  to_angle((mat2.x + mat2.width / 2) - (mat1.x + mat1.width / 2), (mat2.y + mat2.height / 2) - (mat1.y + mat1.height / 2))

to_vec = (angle) ->
  [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)]

add = (node) ->
  game.currentScene.addChild(node)

remove = (node) ->
  game.currentScene.removeChild(node)

isInWindow = (material) ->
  x = material.x + material.width / 2
  y = material.y + material.height / 2
  0 <= x < game.width and 0 <= y < game.height

intoWindow = (material) ->
  material.rx = 0 if material.rx < 0
  t = game.width - 1
  material.rx = t if material.rx > t

  material.ry = 0 if material.ry < 0
  t = game.height - 1
  material.ry = t if material.ry > t

class Material extends Sprite
  constructor: (img_name, frame, width, height, @rradius, @group) ->
    super(width, height)
    @image = game.assets[img_name]
    @frame = frame
    #@scale(2, 2)

    @group.addChild(@)

    @hp = 1
    @power = 1

    @vx = 0
    @vy = 0

    @_died = false

  damage: (material) ->
    @hp -= material.power
    if @hp <= 0
      @hp = 0
      @kill()

  attack: (material) ->
    material.damage(@)
    @damage(material)

  @property 'rx',
    get: -> @x + @width / 2
    set: (x) -> @x = x - @width / 2

  @property 'ry',
    get: -> @y + @height / 2
    set: (y) -> @y = y - @height / 2

  kill: ->
    @_died = true
    @ondying()

  ondying: ->

  hit_check: (material) ->
    dx = (@x + @width / 2) - (material.x + material.width / 2)
    dy = (@y + @height / 2) - (material.y + material.height / 2)
    rdist = dx * dx + dy * dy
    dr = @rradius + material.rradius
    dist = dr * dr
    (rdist <= dist)

  onenterframe: ->
    @x += @vx
    @y += @vy

  update_rotation: ->
    @rotation = if @vx == 0 and @vy == 0
      180
    else
      to_angle(@vx, @vy) / Math.PI * 180

class Player extends Material
  constructor: ->
    super(PLAYER_IMG, 27, 32, 32, 1, players)
    @rx = game.width / 2
    @ry = game.height / 3 * 2

    @core = new Material(BULLET_IMG, 20, 16, 16, 0, game.currentScene)
    @core.scale(@rradius * 8 / @core.width, @rradius * 8 / @core.height)
    @core.rx = @rx
    @core.ry = @ry

    @level = 1

  level_up: ->
    @level++

  onenterframe: ->
    super

    @core.rx = @rx
    @core.ry = @ry

    if game.frame % (game.fps / 15) == 0
      way = Math.min(10, @level * 2 - 1)
      space = (Math.PI / 3) / (way - 1)
      angle = if way == 1 then 0 else -(Math.PI / 3) / 2
      for i in [1..way]
        [vx, vy] = to_vec(angle)
        new Bullet(@rx, @ry - @height / 2, vx, vy, player_bullets, 10, 48)
        angle += space

  ondying: ->
    remove(@core)
    #game.end(exp, "経験値:#{exp} レベル:#{level}")
    alert("経験値:#{exp} レベル:#{@level}")
    location.reload()

class Enemy extends Material
  constructor: (x, y) ->
    super(ENEMY_IMG, 0, 32, 32, 16, enemies)
    @rx = x
    @ry = y

    @hp = 10

    @mover = new Mover
    @shooter = new Shooter

    @update_rotation()

    @state = MATERIAL_STATES.LIVING

  onenterframe: ->
    if @state != MATERIAL_STATES.DYING
      super

      @update_rotation()# if @age % (game.fps / 4) == 0

      if game.frame % (game.fps / 5) == 0
        @shooter.do()

      @mover.do()

    enemies.removeChild(@) if @ry > game.height

  ondying: ->
    exp_gauge.add(1)
    exp++

    @state = MATERIAL_STATES.DYING
    @width = 16
    @height = 16
    @_died = false
    @image = game.assets[EXPLODE_IMG]
    @frame = 0
    @tl.cue(
      10: => @frame++
      20: => @frame++
      30: => @frame++
      40: => @frame++
      50: => @_died = true
    )

class Mover
  constructor: (@parent) ->
  do: ->
    @parent.ry += MOVE_VEROCITY

class StraightMover extends Mover
  constructor: (@parent, vx, vy)->
    @parent.vx = vx
    @parent.vy = vy

class AimStraightMover extends Mover
  constructor: (@parent, @v, @fixed) ->
    if @fixed
      [@parent.vx, @parent.vy] = normalize(player.rx - @parent.rx, player.ry - @parent.ry).map (v) => v * @v
    else
      @parent.vy = 1

  do: ->
    unless @fixed
      angle = now_angle = to_angle(@parent.vx, @parent.vy)
      goal_angle = to_angle_material(@parent, player)
      angle += normalize(goal_angle - now_angle) * Math.PI / 300
      [@parent.vx, @parent.vy] = to_vec(angle).map (v) => v * @v

class Shooter
  do: ->

class StraightShooter extends Shooter
  constructor: (@parent, @level, @bullet_klass, @odd_way, @vx, @vy) ->

  do: ->
    way = (@odd_way ? 1 : 0) + @level * 2
    space = Math.PI / @level
    angle = to_angle(@vx, @vy) + (if way % 2 == 0 then space / 2 else space) * Math.floor(way / 2)
    for i in [1..way]
      [vx, vy] = to_vec(angle)
      new @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
      angle -= space

class AimStraightShooter extends Shooter
  constructor: (@parent, @level, @bullet_klass, @odd_way, @fixed) ->
    @px = player.rx
    @py = player.ry
    @fixed_angle = @make_init_angle() if @fixed

  do: ->
    angle = if @fixed then @fixed_angle else @make_init_angle()

    for i in [1..@way]
      [vx, vy] = to_vec(angle)
      new @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
      angle -= @space

  make_init_angle: ->
    @way = (@odd_way ? 1 : 0) + @level * 2
    @space = Math.PI / @level
    to_angle(@px - @parent.rx, @py - @parent.ry) + (if @way % 2 == 0 then @space / 2 else @space) * Math.floor(@way / 2)

class ShotShooter extends Shooter
  constructor: (@parent, @level, @bullet_klass) ->

  do: ->
    angle = 0
    space = Math.PI / @level
    for i in [1..(Math.PI * 2 / space)]
      [vx, vy] = to_vec(angle)
      new @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
      angle -= space * Math.random() * 2

class Bullet extends Material
  constructor: (x, y, vx, vy, group, v, frame) ->
    super(BULLET_IMG, frame, 16, 16, 1, group)
    @rx = x
    @ry = y

    [@vx, @vy] = normalize(vx, vy).map (e) -> e * v

    @update_rotation()

  onenterframe: ->
    super()
    @kill() unless isInWindow(@)

class AimBullet extends Bullet
  onenterframe: ->
    super
    if @age == game.fps
      [@vx, @vy] = normalize(player.rx - @rx, player.ry - @ry).map (v) => v * Math.sqrt(@vx * @vx + @vy * @vy) * 2
      @update_rotation()

class Gauge extends Entity
  constructor: (x, y, width, height, @_value) ->
    super
    @x = x
    @y = y
    @width = @max_width = width
    @height = height
    @backgroundColor = '#00ff00'

    @max_value = @_value

  @property 'value',
    get: -> @_value
    set: (value) ->
      @_value = value
      @width = @max_width * @_value / @max_value

  add: (value) ->
    @value += value
    if @value >= @max_value
      @value = 0
      @onmax()

  onmax: ->

class CountLabel extends Label
  constructor: (x, y) ->
    super
    @x = x
    @y = y
    @color = '#ffffff'
    @font = "bold 20px Arial"

    @_count = 0

    @label = ''

  @property 'count',
    get: -> @_count
    set: (c) ->
      @_count = c
      @text = "#{@label}#{@_count}"

window.onload = ->
  game = new Game(320, 320)
  game.fps = 60
  game.preload(ASSETS)

  game.onload = ->
    scene = game.rootScene
    scene.backgroundColor = '#808080'

    size = 320
    for y in [-1..game.height / size]
      for x in [0..game.width / size + 1]
        floor = new Sprite(size, size)
        floor.image = game.assets[FLOOR_IMG]
        floor.x = x * size
        floor.y = y * size
        floor.onenterframe = ->
          @y += MOVE_VEROCITY
          @y =  -size if @y >= (Math.floor(game.height / size) + 1) * size
        add(floor)

    players = new Group
    add(players)

    player = new Player

    enemies = new Group
    add(enemies)

    player_bullets = new Group
    add(player_bullets)
    enemy_bullets = new Group
    add(enemy_bullets)

    level_label = new CountLabel(0, game.height - 30)
    level_label.label = 'Level : '
    level_label.count = player.level
    add(level_label)

    exp_gauge = new Gauge(0, 0, game.width, 10, 10)
    exp_gauge.value = 0
    exp_gauge.onmax = ->
      player.level_up()
      level_label.count += 1
      @max_value = Math.floor(@max_value * 1.3)
    add(exp_gauge)

    #敵が出てくる場所
    w = game.width
    h = game.height
    positions = [
      ({p : 2, pos : [x * w / 5, -50]} for x in [1..4])...
      {p : 1, pos : [-50, h / 4],      mover : bind_new StraightMover, 2, 0}
      {p : 1, pos : [w + 50, h / 4], mover : bind_new StraightMover, -2, 0}
    ]
    #束縛
    movers = [
      {p : 2, mover : bind_new Mover}
      {p : 1, mover : bind_new AimStraightMover, 4, true}
      {p : 1, mover : bind_new AimStraightMover, 2, false}
    ]
    shooters = [
      {p : 1, shooter : bind_new StraightShooter, bind_new(Bullet, 2, 56), true, 0, 1}
      {p : 1, shooter : bind_new StraightShooter, bind_new(Bullet, 2, 56), false, 0, 1}
      {p : 1, shooter : bind_new AimStraightShooter, bind_new(Bullet, 2, 56), true, true}
      {p : 1, shooter : bind_new AimStraightShooter, bind_new(Bullet, 2, 56), false, true}
      {p : 1, shooter : bind_new ShotShooter, bind_new(AimBullet, 2, 66)}
    ]

    scene.onenterframe = ->
      #スイープ
      for group in [players, enemies, player_bullets, enemy_bullets]
        for m in group.childNodes
          if m?._died
            m.group.removeChild(m)

      group_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]]
      for group_set in group_sets
        for first in group_set[0].childNodes
          continue if first.state == MATERIAL_STATES.DYING

          for second in group_set[1].childNodes
            continue if second.state == MATERIAL_STATES.DYING

            dx = (first.x + first.width / 2) - (second.x + second.width / 2)
            dy = (first.y + first.height / 2) - (second.y + second.height / 2)
            rdist = dx * dx + dy * dy
            dr = first.rradius + second.rradius
            dist = dr * dr

            if rdist <= dist
              first.attack(second)

      if game.frame % (game.fps * 2) == 0
        for i in [1..Math.max(player.level, 2)]
          pos = positions.probability_choise()

          p = pos.pos
          e = new Enemy(p[0], p[1])

          mover = pos.mover
          if mover?
            e.mover = mover(e)
          else
            e.mover = movers.probability_choise().mover(e)

          e.shooter = shooters.probability_choise().shooter(e, player.level)

      #十字キーによる移動
      v = 4
      if game.input.up
        player.y -= v
      if game.input.down
        player.y += v
      if game.input.left
        player.x -= v
      if game.input.right
        player.x += v

      intoWindow(player)

    bex = bey = 0
    scene.ontouchstart = (e) ->
      bex = e.x
      bey = e.y

    scene.ontouchmove = (e) ->
      player.x += e.x - bex
      player.y += e.y - bey

      bex = e.x
      bey = e.y

  game.start()
