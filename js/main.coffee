enchant()

ASSETS = [
    PLAYER_IMG = 'player.png', 
    BULLET_IMG = 'icon0.png'
    ]

game = null

fighters = null
bullets = null

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
        
        fighters.addChild(@)
    
    onenterframe: ->
        if game.frame % (game.fps / 10) == 0
            new Bullet(@x, @y)
    
class Bullet extends Sprite
    constructor: (x, y) ->
        super(16, 16)
        @image = game.assets[BULLET_IMG]
        @frame = 48
        @x = x
        @y = y
        
        bullets.addChild(@)
    
    onenterframe: ->
        @y += -10
        bullets.removeChild(@) unless isInWindow(@)

window.onload = ->
    game = new Game(400, 600)
    game.fps = 60
    game.preload(ASSETS)
    
    game.onload = ->
        scene = game.rootScene
        scene.backgroundColor = '#ffffff'
        
        bullets = new Group
        add(bullets)
        fighters = new Group
        add(fighters)
        
        player = new Player
        
        bex = bey = 0
        scene.addEventListener Event.TOUCH_START, (e) ->
            bex = e.x
            bey = e.y
        
        scene.addEventListener Event.TOUCH_MOVE, (e) ->
            player.x += e.x - bex
            player.y += e.y - bey
            intoWindow(player)
            
            bex = e.x
            bey = e.y
        
    game.start()