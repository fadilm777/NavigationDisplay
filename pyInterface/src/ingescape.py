import ingescape as igs
import sys

class IngescapeDelegate:

    def __init__(self) -> None:

        self.altitude = None
        self.latitude = None
        self.longitude = None

        device = "Wi-Fi"
        port = 5670

        igs.agent_set_name("gps agent")
        igs.definition_set_version("1.0")
        igs.log_set_console(True)
        igs.log_set_console_level(igs.LOG_INFO)
        igs.set_command_line(sys.executable + " " + " ".join(sys.argv))

        if device is None:
            list_devices = igs.net_devices_list()
            list_addresses = igs.net_addresses_list()
            if len(list_devices) == 1:
                device = list_devices[0]
                igs.info(f"Using {device} as the default network device (only one available).")
            elif len(list_devices) == 2 and ("127.0.0.1" in list_addresses):
                device = next(d for d, a in zip(list_devices, list_addresses) if a != "127.0.0.1")
                igs.info(f"Using {device} as the default network device (non-loopback).")
            else:
                if not list_devices:
                    igs.error("No network device found: aborting.")
                    sys.exit(1)
                else:
                    igs.error("Multiple network devices found. Please specify one using the --device option.")
                    print("Available network devices:")
                    for d in list_devices:
                        print("    ", d)
                    sys.exit(1)

        # Create inputs
        igs.input_create("altitude", igs.INTEGER_T, None)
        igs.input_create("latitude", igs.DOUBLE_T, None)
        igs.input_create("longitude", igs.DOUBLE_T, None)

        # Observe inputs
        igs.observe_input("altitude", self.altitude_input_callback, None)
        igs.observe_input("latitude", self.latitude_input_callback, None)
        igs.observe_input("longitude", self.longitude_input_callback, None)
        
        # Start agent
        igs.start_with_device(device, port)


    def altitude_input_callback(self, io_type, name, value_type, value, my_data):
        self.altitude = value  

    def latitude_input_callback(self, io_type, name, value_type, value, my_data):
        self.latitude = value 

    def longitude_input_callback(self, io_type, name, value_type, value, my_data):
        self.longitude = value  

class MockIngescapeDelegate:
    """Mock ingescape delegate for debugging"""

    def __init__(self, latitude: float, longitude: float, altitude:float) -> None:
        self.altitude = altitude
        self.latitude = latitude
        self.longitude = longitude

    def setAltitude(self, altitude: float):
        self.altitude = altitude

    def setLongitude(self, longitude: float):
        self.longitude = longitude

    def setLatitude(self, latitude: float):
        self.latitude = latitude
