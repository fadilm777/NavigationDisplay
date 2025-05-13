import asyncio
import json
from websockets.asyncio.server import serve

from src.ingescape import IngescapeDelegate

class Navigator:
    """Navigator class to handle aircraft data communication"""

    def __init__(self, ingescapeDelegate: IngescapeDelegate) -> None:
        self.ingescapeDelegate = ingescapeDelegate

    async def _server(self):
        server = await serve(self._connection_handler, "localhost", 8325) # start websocket server
        print("Websocket server started")
        print("Sending aircraft data from localhost:8325")
        await server.serve_forever() # run server forever

    async def _connection_handler(self, websocket):
        while True:

            message = {
                "request": {
                    "method": "PUT",
                    "type": "location"
                },
                "body": {
                    "latitude": self.ingescapeDelegate.latitude,
                    "longitude": self.ingescapeDelegate.longitude,
                    "altitude": self.ingescapeDelegate.altitude
                }
            }

            await websocket.send(json.dumps(message)) # send message

    def start_server(self):
        """This function should be called to start server"""
        asyncio.run(self._server())
