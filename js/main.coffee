enchant()

ASSETS = [
    PLAYER_IMG = 'player.png', 
    BULLET_IMG = 'icon0.png'
    ]

game = null

players = null
enemies = null

player_bullets = null
enemy_bullets = null

add = (inst) ->
    game.currentScene.addChild(inst)

remove = (inst) ->
    inst.onremove?()
    game.currentScene.removeChild(inst)

isInWindow = (node) ->
    0 <= node.x < game.width and 0 <= node.y < game.height

intoWindow = (node) ->
    node.x = 0 if node.x < 0
    t = game.width - 1 - node.width
    node.x = t if node.x > t
    
    node.y = 0 if node.y < 0
    t = game.height - 1 - node.height
    node.y = t if node.y > t

class Player extends Sprite
    constructor: ->
        super(32, 32)
        @image = game.assets[PLAYER_IMG]
        @frame = 27
        @scale(2, 2)
        @x = game.width / 2
        @y = game.height / 2
        
        players.addChild(@)
    
    onenterframe: ->
        if game.frame % (game.fps / 10) == 0
            new Bullet(@x, @y, player_bullets)
            
class Enemy extends Sprite
    constructor: (x, y) ->
        super(32, 32)
        @image = game.assets[PLAYER_IMG]
        @frame = 27
        @scale(2, -2)
        @x = x
        @y = y
        
        enemies.addChild(@)

class Bullet extends Sprite
    constructor: (x, y, @group) ->
        super(16, 16)
        @image = game.assets[BULLET_IMG]
        @frame = 48
        @x = x
        @y = y
        
        @group.addChild(@)
    
    onenterframe: ->
        @y += -10
        @group.removeChild(@) unless isInWindow(@)

window.onload = ->
    game = new Game(400, 600)
    game.fps = 60
    game.preload(ASSETS)
    
    game.onload = ->
        scene = game.rootScene
        scene.backgroundColor = '#ffffff'
        
        player_bullets = new Group
        add(player_bullets)
        enemy_bullets = new Group
        add(enemy_bullets)
        
        players = new Group
        add(players)
        enemies = new Group
        add(enemies)
        
        player = new Player
        
        new Enemy(game.width / 2, game.height / 3)
        
        scene.onenterframe = ->
            char_sets = [[player_bullets, enemies], [enemy_bullets, players], [enemies, players]]
            for char_set in char_sets
                for first in char_set[0].childNodes
                    for second in char_set[1].childNodes
                        if first.intersect(second)
                            alert('hit!')
        
        bex = bey = 0
        scene.ontouchstart = (e) ->
            bex = e.x
            bey = e.y
        
        scene.ontouchmove = (e) ->
            player.x += e.x - bex
            player.y += e.y - bey
            intoWindow(player)
            
            bex = e.x
            bey = e.y
        
    game.start()