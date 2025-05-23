import asyncio
import json
from websockets.asyncio.server import serve

from src.ingescape import IngescapeDelegate

class Navigator:
    """Navigator class to handle aircraft data communication"""

    def __init__(self, ingescapeDelegate: IngescapeDelegate) -> None:
        self.ingescapeDelegate = ingescapeDelegate

    async def _server(self, port):
        server = await serve(self._connection_handler, "localhost", port) # start websocket server
        print("Websocket server started")
        print(f"Sending aircraft data from localhost:{port}")
        await server.serve_forever() # run server forever

    async def _connection_handler(self, websocket):
        aircraft_data = self.ingescapeDelegate.aircraft_data

        while True:

            locationMessage = {
                "request": {
                    "method": "PUT",
                    "type": "location"
                },
                "body": {
                    "latitude": aircraft_data["latitude"],
                    "longitude": aircraft_data["longitude"],
                    "altitude": aircraft_data["altitude"],
                    "bearing": aircraft_data["heading"]
                }
            }
            await websocket.send(json.dumps(locationMessage)) # send location

            navInfoMessage = {
                "request": {
                    "method": "PUT",
                    "type": "navInfo"
                },
                "body": {
                    "GS": aircraft_data["GS"],
                    "DTK": aircraft_data["DTK"],
                    "TRK": aircraft_data["TRK"],
                }
            }
            await websocket.send(json.dumps(navInfoMessage)) # send navigation info

    def start_server(self, port=8325):
        """This function should be called to start server"""
        asyncio.run(self._server(port))
