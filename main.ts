//  variables
let friction = 0.98
let is_moving = false
let shot_power = 50
//  sprites
let ball = sprites.create(assets.image`ball`, SpriteKind.Projectile)
scene.cameraFollowSprite(ball)
ball.setBounceOnWall(true)
ball.scale = 2 / 3
ball.z = 5
let hole = sprites.create(assets.image`hole`, SpriteKind.Player)
//  aim sprite
let aim_image = image.create(150, 150)
aim_image.fillRect(74, 0, 2, 75, 15)
let aim_sprite = sprites.create(aim_image)
function path_move_x(column: number, row: number): number {
    let tile: tiles.Location;
    column += 1
    for (let i = -1; i < 2; i++) {
        tile = tiles.getTileLocation(column, row + i)
        tiles.setTileAt(tile, assets.tile`path`)
    }
    return column
}

function path_move_y(column: number, row: number): number {
    let tile: tiles.Location;
    row += randint(0, 1) * 2 - 1
    row = Math.constrain(row, 2, grid.numRows() - 3)
    for (let i = -1; i < 2; i++) {
        tile = tiles.getTileLocation(column + i, row)
        tiles.setTileAt(tile, assets.tile`path`)
    }
    return row
}

function generate_path() {
    let tile: tiles.Location;
    let column = 0
    let row = randint(2, grid.numRows() - 3)
    tiles.placeOnTile(ball, tiles.getTileLocation(column, row))
    for (let i = -1; i < 2; i++) {
        tile = tiles.getTileLocation(column, row + i)
        tiles.setTileAt(tile, assets.tile`path`)
    }
    column = path_move_x(column, row)
    while (column < grid.numColumns() - 1) {
        if (randint(1, 2) == 1) {
            column = path_move_x(column, row)
        } else {
            row = path_move_y(column, row)
        }
        
    }
    tile = tiles.getTileLocation(column, row)
    tiles.setTileAt(tile, assets.tile`hole`)
    tiles.placeOnTile(hole, tile)
    tilesAdvanced.setWallOnTilesOfType(assets.tile`rough`, true)
}

function setup_level() {
    tiles.setCurrentTilemap(assets.tilemap`level`)
    info.changeScoreBy(1000)
    generate_path()
    transformSprites.rotateSprite(aim_sprite, 90)
}

setup_level()
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Player, function pot(ball: Sprite, hole: Sprite) {
    if (spriteutils.distanceBetween(ball, hole) < 7) {
        ball.setVelocity(0, 0)
        setup_level()
    }
    
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function hit() {
    let direction: number;
    if (!is_moving) {
        direction = transformSprites.getRotation(aim_sprite)
        direction = spriteutils.degreesToRadians(direction)
        ball.vx = Math.sin(direction) * shot_power * 4
        ball.vy = Math.cos(direction) * -shot_power * 4
        info.changeScoreBy(-100)
    }
    
})
function aim() {
    
    aim_sprite.setPosition(ball.x, ball.y)
    if (controller.left.isPressed()) {
        transformSprites.changeRotation(aim_sprite, -1)
    } else if (controller.right.isPressed()) {
        transformSprites.changeRotation(aim_sprite, 1)
    }
    
    if (controller.up.isPressed()) {
        shot_power += 1
    } else if (controller.down.isPressed()) {
        shot_power -= 1
    }
    
    shot_power = Math.constrain(shot_power, 1, 100)
}

game.onUpdate(function tick() {
    
    is_moving = Math.abs(ball.vx) > 5 || Math.abs(ball.vy) > 5
    if (is_moving) {
        aim_sprite.setFlag(SpriteFlag.Invisible, true)
        ball.sayText("")
    } else {
        ball.setVelocity(0, 0)
        aim_sprite.setFlag(SpriteFlag.Invisible, false)
        aim()
        ball.sayText(shot_power)
    }
    
    ball.vx *= friction
    ball.vy *= friction
})
