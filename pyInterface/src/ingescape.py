import ingescape as igs
import sys

class IngescapeDelegate:

    def __init__(self) -> None:

        self.aircraft_location = {
            "altitude": None,
            "latitude": None,
            "longitude": None,
            "heading": None,
        }

        self.aircraft_nav = {
            "GS": None,
            "DTK": None,
            "TRK": None,
            "N1": None,
            "N2": None,
            "EGT": None,
            "DIFF PSI": None,
            "ALT FT": None,
            "OIL PSI": None,
            "OIL C": None
        }

        device = "Ethernet" 
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

        for location_item in self.aircraft_location:
            igs.input_create(location_item, igs.DOUBLE_T, None)
            igs.observe_input(location_item, self.input_callback, None)

        for nav_item in self.aircraft_nav:
            igs.input_create(nav_item, igs.DOUBLE_T, None)
            igs.observe_input(nav_item, self.input_callback, None)

        # Start agent
        igs.start_with_device(device, port)


    def input_callback(self, *args):
        name = args[1]
        value = args[3]

        if name in self.aircraft_location:
            self.aircraft_location[name] = value

        if name in self.aircraft_nav:
            if name == "ALT FT":
                self.aircraft_nav[name] = (value // 50) * 50
            else:
                self.aircraft_nav[name] = value
