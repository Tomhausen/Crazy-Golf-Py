# guided
@namespace
class SpriteKind:
    path = SpriteKind.create()
# /guided

# variables
friction = 0.98
is_moving = False
shot_power = 50

# sprites
ball = sprites.create(assets.image("ball"), SpriteKind.projectile)
scene.camera_follow_sprite(ball)
ball.set_bounce_on_wall(True)
ball.scale = 2/3
ball.z = 5
hole = sprites.create(assets.image("hole"), SpriteKind.player)

# aim sprite
# aim_image = image.create(150, 150) guided
# aim_image.fill_rect(74, 0, 2, 75, 15) guided
# aim_sprite = sprites.create(aim_image) guided
aim_sprite = sprites.create(assets.image("ball"))
# guided
aim_sprite.set_flag(SpriteFlag.GHOST_THROUGH_WALLS, True)
aim_sprite.set_flag(SpriteFlag.INVISIBLE, True)
# /guided

def path_move_x(column, row):
    column += 1
    for i in range(-1, 2):
        tile = tiles.get_tile_location(column, row + i)
        tiles.set_tile_at(tile, assets.tile("path"))
    return column

def path_move_y(column, row):
    row += (randint(0, 1) * 2) - 1
    row = Math.constrain(row, 2, grid.num_rows() - 3)
    for i in range(-1, 2):
        tile = tiles.get_tile_location(column + i, row)
        tiles.set_tile_at(tile, assets.tile("path"))
    return row

def generate_path():
    column = 0
    row = randint(2, grid.num_rows() - 3)
    tiles.place_on_tile(ball, tiles.get_tile_location(column, row))
    for i in range(-1, 2):
        tile = tiles.get_tile_location(column, row + i)
        tiles.set_tile_at(tile, assets.tile("path"))
    column = path_move_x(column, row)
    while column < (grid.num_columns() - 1):
        if randint(1, 2) == 1:
            column = path_move_x(column, row)
        else:
            row = path_move_y(column, row)
    tile = tiles.get_tile_location(column, row)
    tiles.set_tile_at(tile, assets.tile("hole"))
    tiles.place_on_tile(hole, tile)
    tilesAdvanced.set_wall_on_tiles_of_type(assets.tile("rough"), True)
    
def setup_level():
    tiles.set_current_tilemap(assets.tilemap("level"))
    info.change_score_by(1000)
    generate_path()
    transformSprites.rotate_sprite(aim_sprite, 90)
setup_level()

def pot(ball, hole):
    if spriteutils.distance_between(ball, hole) < 7:
        ball.set_velocity(0, 0)
        setup_level()
sprites.on_overlap(SpriteKind.projectile, SpriteKind.player, pot)

def hit():
    if not is_moving:
        direction = transformSprites.get_rotation(aim_sprite)
        direction = spriteutils.degrees_to_radians(direction)
        ball.vx = Math.sin(direction) * shot_power * 4
        ball.vy = Math.cos(direction) * -shot_power * 4
        info.change_score_by(-100)
controller.A.on_event(ControllerButtonEvent.PRESSED, hit)

# guided
def path():
    direction = transformSprites.get_rotation(aim_sprite)
    direction = spriteutils.degrees_to_radians(direction)
    x_vector = Math.sin(direction)
    y_vector = -Math.cos(direction)
    aim_sprite.set_position(ball.x, ball.y)
    dot = image.create(2, 2)
    dot.fill(15)
    for path_length in range(20):
        dot_sprite = sprites.create(dot, SpriteKind.path)
        dot_sprite.set_position(aim_sprite.x, aim_sprite.y)
        for step_length in range(shot_power / 5):
            aim_sprite.x += x_vector
            if tiles.tile_at_location_is_wall(aim_sprite.tilemap_location()):
                aim_sprite.x -= x_vector
                x_vector *= -1
            aim_sprite.y += y_vector
            if tiles.tile_at_location_is_wall(aim_sprite.tilemap_location()):
                aim_sprite.y -= y_vector
                y_vector *= -1
# /guided

def aim():
    global shot_power
    aim_sprite.set_position(ball.x, ball.y)
    if controller.left.is_pressed():
        transformSprites.change_rotation(aim_sprite, -1)
    elif controller.right.is_pressed():
        transformSprites.change_rotation(aim_sprite, 1)
    if controller.up.is_pressed():
        shot_power += 1
    elif controller.down.is_pressed():
        shot_power -= 1
    shot_power = Math.constrain(shot_power, 1, 100)

def tick():
    global is_moving
    if len(sprites.all_of_kind(SpriteKind.path)) > 0:
        sprites.destroy_all_sprites_of_kind(SpriteKind.path)
    is_moving = Math.abs(ball.vx) > 5 or Math.abs(ball.vy) > 5
    if is_moving:
        # aim_sprite.set_flag(SpriteFlag.INVISIBLE, True)
        ball.say_text("")
    else:
        ball.set_velocity(0, 0)
        # aim_sprite.set_flag(SpriteFlag.INVISIBLE, False)
        aim()
        ball.say_text(shot_power)
        # guided
        path()
        # /guided
    ball.vx *= friction
    ball.vy *= friction
game.on_update(tick)
