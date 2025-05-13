from src.ingescape import IngescapeDelegate 
from src.plane import Navigator


if __name__ == "__main__":
    igs = IngescapeDelegate()
    nav = Navigator(igs)

    #start Navigator server
    nav.start_server()
