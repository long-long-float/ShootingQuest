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

p = ->
    ret = []
    for v in arguments
        console.log v
        ret.push(v)
    if ret.length == 1 then ret[0] else ret

normalize = (x, y) ->
    len = Math.sqrt(x * x + y * y)
    [x / len, y / len]

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
        #p "#{rdist} : #{dist}"
        (rdist <= dist)

class Player extends Material
    constructor: ->
        super(PLAYER_IMG, 27, 32, 32, 4, players)
        @scale(2, 2)
        @rx = game.width / 2
        @ry = game.height / 2
        
        @core = new Material(BULLET_IMG, 20, 16, 16, 0, game.currentScene)
        @core.scale(@rradius * 2 / @core.width, @rradius * 2 / @core.height)
        @core.rx = @rx
        @core.ry = @ry
        
    onenterframe: ->
        @core.rx = @rx
        @core.ry = @ry
        
        if game.frame % (game.fps / 10) == 0
            for i in [-2..2]
                new Bullet(48, @rx + (@width / 4) * i, @ry - @height / 2, 0, -10, player_bullets)
    
    ondying: ->
        remove(@core)
        
            
class Enemy extends Material
    constructor: (x, y) ->
        super(PLAYER_IMG, 27, 32, 32, 16, enemies)
        @scale(2, -2)
        @rx = x
        @ry = y
        
        @hp = 10
        
        @mover = new Mover
        @shooter = new Shooter
        
    onenterframe: ->
        if game.frame % (game.fps / 5) == 0
            @shooter.do(@)
        
        @mover.do(@)

class Mover
    do: ->

class StraightMover extends Mover
    constructor: (@vx, @vy)->
    
    do: (material)->
        material.rx += @vx
        material.ry += @vy
        @hp = 0 unless isInWindow(@)

class AimPlayerMover extends Mover
    constructor: (@v) ->
    
    do: (material) ->
        [vx, vy] = normalize(material.rx - player.rx, material.ry - player.ry)
        p "#{vx}, #{vy}"
        material.rx += vx * @v
        material.ry += vy * @v

class Shooter
    do: ->

class RadialShooter extends Shooter
    constructor: (@density) ->
    
    do: (material) ->
        angle = material.age
        for i in [1..@density]
            vx = Math.cos(angle) * 2
            vy = Math.sin(angle) * 2
            new Bullet(56, material.rx, material.ry, vx, vy, enemy_bullets)
            angle += Math.PI * 2 / @density

class Bullet extends Material
    constructor: (frame, x, y, @vx, @vy, group) ->
        super(BULLET_IMG, frame, 16, 16, 4, group)
        @rx = x
        @ry = y
        
        angle = Math.atan(@vx, @vy) / Math.PI * 180
        angle = 180 - angle if @vy > 0
        @rotate(angle)
    
    onenterframe: ->
        @rx += @vx
        @ry += @vy
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
        
        scene.onenterframe = ->
            #スイープ
            for set in [player_bullets, enemy_bullets, players, enemies]
                for m in set.childNodes
                    if m?.hp <= 0
                        m.ondying()
                        m.group.removeChild(m)
            
            char_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]]
            for char_set in char_sets
                for first in char_set[0].childNodes
                    for second in char_set[1].childNodes
                        if first.hit_check(second)
                            first.attack(second)
            
            if game.frame % (game.fps * 1) == 0
                e = new Enemy(0, 0)
                e.shooter = new RadialShooter(10)
                e.mover = new StraightMover(2, 2)
                
                e = new Enemy(game.width, 0)
                e.shooter = new RadialShooter(20)
                e.mover = new AimPlayerMover(-2, 2)
        
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