from pynput import keyboard
from src.ingescape import MockIngescapeDelegate
from src.plane import Navigator
import threading 

igs = MockIngescapeDelegate(latitude=45.473595, longitude=-73.747288, altitude=0)
nav = Navigator(igs)

def locationUpdater(key):

    global igs

    try:
        if key.char == 'q':
            return False  # Stop listener
    except AttributeError:
        pass
    if key == keyboard.Key.up:
        igs.latitude += 0.000018
    if key == keyboard.Key.down:
        igs.latitude -= 0.000018
    if key == keyboard.Key.left:
        igs.longitude += 0.000018
    if key == keyboard.Key.right:
        igs.longitude -= 0.000018

listener = keyboard.Listener(on_press=locationUpdater)
thread = threading.Thread(target=listener.start)
thread.start()
nav.start_server()
