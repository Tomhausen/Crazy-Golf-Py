//  guided
namespace SpriteKind {
    export const path = SpriteKind.create()
}

//  /guided
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
//  aim_image = image.create(150, 150) guided
//  aim_image.fill_rect(74, 0, 2, 75, 15) guided
//  aim_sprite = sprites.create(aim_image) guided
let aim_sprite = sprites.create(assets.image`ball`)
//  guided
aim_sprite.setFlag(SpriteFlag.GhostThroughWalls, true)
aim_sprite.setFlag(SpriteFlag.Invisible, true)
//  /guided
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
//  guided
function path() {
    let dot_sprite: Sprite;
    let direction = transformSprites.getRotation(aim_sprite)
    direction = spriteutils.degreesToRadians(direction)
    let x_vector = Math.sin(direction)
    let y_vector = -Math.cos(direction)
    aim_sprite.setPosition(ball.x, ball.y)
    let dot = image.create(2, 2)
    dot.fill(15)
    for (let path_length = 0; path_length < 20; path_length++) {
        dot_sprite = sprites.create(dot, SpriteKind.path)
        dot_sprite.setPosition(aim_sprite.x, aim_sprite.y)
        for (let step_length = 0; step_length < shot_power / 5; step_length++) {
            aim_sprite.x += x_vector
            if (tiles.tileAtLocationIsWall(aim_sprite.tilemapLocation())) {
                aim_sprite.x -= x_vector
                x_vector *= -1
            }
            
            aim_sprite.y += y_vector
            if (tiles.tileAtLocationIsWall(aim_sprite.tilemapLocation())) {
                aim_sprite.y -= y_vector
                y_vector *= -1
            }
            
        }
    }
}

//  /guided
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
    
    if (sprites.allOfKind(SpriteKind.path).length > 0) {
        sprites.destroyAllSpritesOfKind(SpriteKind.path)
    }
    
    is_moving = Math.abs(ball.vx) > 5 || Math.abs(ball.vy) > 5
    if (is_moving) {
        //  aim_sprite.set_flag(SpriteFlag.INVISIBLE, True)
        ball.sayText("")
    } else {
        ball.setVelocity(0, 0)
        //  aim_sprite.set_flag(SpriteFlag.INVISIBLE, False)
        aim()
        ball.sayText(shot_power)
        //  guided
        path()
    }
    
    //  /guided
    ball.vx *= friction
    ball.vy *= friction
})
