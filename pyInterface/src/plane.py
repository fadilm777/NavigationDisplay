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
        while True:

            locationMessage = {
                "request": {
                    "method": "PUT",
                    "type": "location"
                },
                "body": {
                    "latitude": self.ingescapeDelegate.latitude,
                    "longitude": self.ingescapeDelegate.longitude,
                    "altitude": self.ingescapeDelegate.altitude,
                    "bearing": self.ingescapeDelegate.bearing
                }
            }
            await websocket.send(json.dumps(locationMessage)) # send location

            navInfoMessage = {
                "request": {
                    "method": "PUT",
                    "type": "navInfo"
                },
                "body": {
                    "GS": self.ingescapeDelegate.GS
                }
            }
            await websocket.send(json.dumps(navInfoMessage)) # send navigation info

    def start_server(self, port=8325):
        """This function should be called to start server"""
        asyncio.run(self._server(port))
