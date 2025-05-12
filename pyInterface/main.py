from src.ingescape import IngescapeDelegate 
from src.plane import Navigator

igs = IngescapeDelegate()
nav = Navigator(igs)

nav.start_server()

