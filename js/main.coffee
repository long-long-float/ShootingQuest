enchant()

ASSETS = [
    PLAYER_IMG = 'player.png',
    BULLET_IMG = 'icon0.png'
]

game = null

player = null

players = null
enemies = null

player_bullets = null
enemy_bullets = null

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
    
normalize = (x, y) ->
    len = Math.sqrt(x * x + y * y)
    [x / len, y / len]

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
        @scale(2, 2)
        @rx = game.width / 2
        @ry = game.height / 3 * 2
        
        @core = new Material(BULLET_IMG, 20, 16, 16, 0, game.currentScene)
        @core.scale(@rradius * 8 / @core.width, @rradius * 8 / @core.height)
        @core.rx = @rx
        @core.ry = @ry
        
    onenterframe: ->
        super
        
        @core.rx = @rx
        @core.ry = @ry
        
        if game.frame % (game.fps / 15) == 0
            for i in [-3..3]
                new Bullet(@rx + (@width / 4) * i, @ry - @height / 2, 0, -1, player_bullets, 15, 48)
    
    ondying: ->
        remove(@core)
        
class Enemy extends Material
    constructor: (x, y) ->
        super(PLAYER_IMG, 0, 32, 32, 16, enemies)
        @scale(2, -2)
        @rx = x
        @ry = y
        
        @hp = 10
        
        @mover = new Mover
        @shooter = new Shooter
        
        @update_rotation()
        
    onenterframe: ->
        super
        
        @update_rotation()# if @age % (game.fps / 4) == 0
        
        if game.frame % (game.fps / 5) == 0
            @shooter.do()
        
        @mover.do()
        
class Mover
    do: ->

class StraightMover extends Mover
    constructor: (@parent, vx, vy)->
        @parent.vx = vx
        @parent.vy = vy
    
    do: ->
        #@parent.kill() unless isInWindow(@)

class AimStraightMover extends Mover
    constructor: (@parent, @v, @fixed) ->
        @set_velocity() if @fixed

    do: ->
        @set_velocity() unless @fixed

    set_velocity: ->
        [@parent.vx, @parent.vy] = normalize(player.rx - @parent.rx, player.ry - @parent.ry).map (v) => v * @v
        
class Shooter
    do: ->

class StraightShooter extends Shooter
    constructor: (@parent, @level, @bullet_klass, @odd_way, @vx, @vy) ->
    
    do: ->
        way = (@odd_way ? 1 : 0) + @level * 2
        space = Math.PI / @level
        angle = to_angle(@xv, @vy) + (if way % 2 == 0 then space / 2 else space) * Math.floor(way / 2)
        for i in [1..way]
            [vx, vy] = to_vec(angle)
            @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
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
            @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
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
            @bullet_klass(@parent.rx, @parent.ry, vx, vy, enemy_bullets)
            angle -= space * Math.random() * 2

class Bullet extends Material
    constructor: (x, y, vx, vy, group, v, frame) ->
        super(BULLET_IMG, frame, 16, 16, 1, group)
        @rx = x
        @ry = y
        
        [@vx, @vy] = normalize(vx, vy).map (e) -> e * v
        
        @update_rotation()
        
    onenterframe: ->
        super 
        @kill() unless isInWindow(@)
        
class AimBullet extends Bullet
    onenterframe: ->
        super
        if @age == game.fps
            [@vx, @vy] = normalize(player.rx - @rx, player.ry - @ry).map (v) => v * Math.sqrt(@vx * @vx + @vy * @vy)
            @update_rotation()

window.onload = ->
    game = new Game(400, 600)
    game.fps = 60
    game.preload(ASSETS)
    
    game.onload = ->
        scene = game.rootScene
        scene.backgroundColor = '#ffffff'
        
        players = new Group
        add(players)
        enemies = new Group
        add(enemies)
        
        
        player_bullets = new Group
        add(player_bullets)
        enemy_bullets = new Group
        add(enemy_bullets)
        
        player = new Player
        
        #敵が出てくる場所
        w = game.width
        h = game.height
        positions = [
            ({p : 2, pos : [x * w / 5, -50]} for x in [0..5])...
            {p : 1, pos : [-50, h / 4],      mover : bind_new StraightMover, 4, 0}
            {p : 1, pos : [w + 50, h / 4], mover : bind_new StraightMover, -4, 0}
        ]
        #束縛
        movers = [
            {p : 2, mover : bind_new Mover}
            {p : 1, mover : bind_new AimStraightMover, 4, true}
            {p : 1, mover : bind_new AimStraightMover, 4, false}
        ]
        shooters = [
            {p : 1, shooter : bind_new StraightShooter, bind_new(Bullet, 2, 56), true, 0, 1}
            {p : 1, shooter : bind_new StraightShooter, bind_new(Bullet, 2, 56), false, 0, 1}
            {p : 1, shooter : bind_new AimStraightShooter, bind_new(AimBullet, 2, 65), true, true}
            {p : 1, shooter : bind_new AimStraightShooter, bind_new(AimBullet, 2, 65), false, true}
            {p : 1, shooter : bind_new ShotShooter, bind_new(AimBullet, 2, 65)}
        ]
        
        scene.onenterframe = ->
            #スイープ
            for group in [players, enemies, player_bullets, enemy_bullets]
                for m in group.childNodes
                    if m?._died
                        m.group.removeChild(m)
                    
                    if m? and (m instanceof Enemy)# or m instanceof Bullet)
                        m.ry += 2
            
            group_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]]
            for group_set in group_sets
                for first in group_set[0].childNodes
                    for second in group_set[1].childNodes
                        if first.hit_check(second)
                            first.attack(second)
            
            if game.frame % (game.fps * rand(1, 3)) == 0
                for i in [0..rand(1, 2)]
                    pos = positions.probability_choise()
                    
                    p = pos.pos
                    e = new Enemy(p[0], p[1])
                    
                    mover = pos.mover
                    if mover?
                        e.mover = mover(e)
                    else
                        e.mover = movers.probability_choise().mover(e)
                    
                    e.shooter = shooters.probability_choise().shooter(e, 3)
            
            #十字キーによる移動
            v = 2
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