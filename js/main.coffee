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
    to_angle(mat2.rx - mat1.rx, mat2.ry - mat1.ry)

to_vec = (angle) ->
    [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)]

add = (node) ->
    game.currentScene.addChild(node)

remove = (node) ->
    game.currentScene.removeChild(node)

isInWindow = (material) ->
    0 <= material.rx < game.width and 0 <= material.ry < game.height

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
    
    damage: (material) ->
        @hp -= material.power
        @hp = 0 if @hp <= 0
    
    attack: (material) ->
        material.damage(@)
        @damage(material)
    
    @property 'rx',
        get: -> @x + @width / 2
        set: (x) -> @x = x - @width / 2
    
    @property 'ry',
        get: -> @y + @height / 2
        set: (y) -> @y = y - @height / 2
    
    ondying: ->
    
    hit_check: (material) ->
        rdist = Math.pow(@rx - material.rx, 2) + Math.pow(@ry - material.ry, 2)
        dist = Math.pow(@rradius + material.rradius, 2)
        (rdist <= dist)
    
    onenterframe: ->
        @rx += @vx
        @ry += @vy
    
    update_rotation: ->
        @rotation = if @vx == 0 and @vy == 0 then 180 else to_angle(@vx, @vy) / Math.PI * 180

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
        
        if game.frame % (game.fps / 10) == 0
            for i in [-2..2]
                new Bullet(48, @rx + (@width / 4) * i, @ry - @height / 2, 0, -10, player_bullets)
    
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
        
    onenterframe: ->
        super
        
        @update_rotation()
        
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
        @hp = 0 unless isInWindow(@)

class AimStraightMover extends Mover
    constructor: (@parent, @v, @fixed) ->
        @set_velocity() if @fixed

    do: ->
        @set_velocity() unless @fixed

    set_velocity: ->
        [@parent.vx, @parent.vy] = normalize(player.rx - @parent.rx, player.ry - @parent.ry).map ((v) -> v * @v), @
        
class Shooter
    constructor: ->
        @level = 0
    do: ->

class StraightShooter extends Shooter
    constructor: (@parent, @way, @space, @vx, @vy) ->
    
    do: ->
        angle = to_angle(@xv, @vy) + (if @way % 2 == 0 then @space / 2 else @space) * Math.floor(@way / 2)
        for i in [1..@way]
            [vx, vy] = to_vec(angle).map (e) -> e * 6
            new Bullet(56, @parent.rx, @parent.ry, vx, vy, enemy_bullets)
            angle -= @space

class AimStraightShooter extends Shooter
    constructor: (@parent, @way, @space, @fixed) ->
        @px = player.rx
        @py = player.ry
        @fixed_angle = make_init_angle() if @fixed
    
    do: ->
        angle = make_init_angle() unless @fixed
        for i in [1..@way]
            #ここどうすんねんΣ(-o-)
            [vx, vy] = to_vec(angle).map (e) -> e * 6
            new Bullet(56, @parent.rx, @parent.ry, vx, vy, enemy_bullets)
            angle -= @space
    
    make_init_angle: ->
        to_angle(@px - @parent.rx, @py - @parent.ry) + (if @way % 2 == 0 then @space / 2 else @space) * Math.floor(@way / 2)

class ShotShooter extends Shooter
    constructor: (@parent, @space) ->
    
    do: ->
        angle = 0
        for i in [1..(Math.PI * 2 / @space)]
            
            [vx, vy] = to_vec(angle).map (e) -> e * 2
            new Bullet(56, @parent.rx, @parent.ry, vx, vy, enemy_bullets)
            angle -= @space * Math.random() * 2
    

class Bullet extends Material
    constructor: (frame, x, y, vx, vy, group) ->
        super(BULLET_IMG, frame, 16, 16, 1, group)
        @rx = x
        @ry = y
        
        @vx = vx
        @vy = vy
        
    onenterframe: ->
        super 
        @update_rotation()
        #@group.removeChild(@) unless isInWindow(@)
        @hp = 0 unless isInWindow(@)
        
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
        
        e = new Enemy(game.width / 3, game.height / 3)
        e.shooter = new ShotShooter(e, Math.PI / 30)
        e.mover = new StraightMover(e, 0, -2)
        
        scene.onenterframe = ->
            #スイープ
            for group in [players, enemies, player_bullets, enemy_bullets]
                for m in group.childNodes
                    if m?.hp <= 0
                        m.ondying()
                        m.group.removeChild(m)
                    
                    if m? and m instanceof Enemy
                        m.ry += 2
            
            group_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]]
            for group_set in group_sets
                for first in group_set[0].childNodes
                    for second in group_set[1].childNodes
                        if first.hit_check(second)
                            first.attack(second)
            
            #敵が出てくる場所
            w = game.width
            h = game.height
            positions = [
                ([x * w / 5, 0] for x in [0..5])...,
                [0, h / 4],
                [w, h / 4]
            ]
            if game.frame % (game.fps * rand(1, 3)) == 0
                for i in [0..rand(1, 2)]
                    p = positions[rand(0, positions.length)]
                    e = new Enemy(p[0], p[1])
                    #e.shooter = new StraightShooter(e, 6, Math.PI / 60, 0, 1)
                    e.shooter = new ShotShooter(e, Math.PI / 10)
                    #e.mover = new AimStraightMover(e, 4, true)
        
        bex = bey = 0
        scene.ontouchstart = (e) ->
            bex = e.x
            bey = e.y
        
        scene.ontouchmove = (e) ->
            player.rx += e.x - bex
            player.ry += e.y - bey
            intoWindow(player)
            
            bex = e.x
            bey = e.y
        
    game.start()