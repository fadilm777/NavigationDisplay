import socket
import ingescape as igs
import signal
import time
from echo import *
#from coordinates_converter import local_to_global

# UDP configuration
UDP_IP = "127.0.0.1"  # IP to bind to
UDP_PORT = 5005       # Port to bind to



# Ingescape configuration
port = 5670
agent_name = "xplane_position_agent"
device = "Ethernet"  # Automatically selects network device if not provided
is_interrupted = False
verbose = False


# Signal handler for graceful exit
def signal_handler(signal_received, frame):
    global is_interrupted
    print("\nInterrupted by signal:", signal_received)
    is_interrupted = True

# Callback for agent events (optional, modify as needed)
def on_agent_event_callback(event, uuid, name, event_data, my_data):
    igs.info(f"Agent event: {return_event_type_as_str(event)}")

# UDP listening function
def start_udp_listener(sock):
    while not is_interrupted:
        try:
            data, _ = sock.recvfrom(1024)
            decoded_data = data.decode().strip()
            x, y, z, GS, DTK, TRK, N1, N2, EGT, DIFF_PSI = map(float, decoded_data.split(","))

            latitude, longitude, heading, ground_speed, dtk, trk, n1, n2, egt, diff_psi = x,y,z,GS,DTK,TRK,N1,N2,EGT,DIFF_PSI
            
            # Update Ingescape outputs
            igs.output_set_double("latitude", latitude)
            igs.output_set_double("longitude", longitude)
            igs.output_set_double("heading", heading)
            igs.output_set_double("GS", ground_speed)
            igs.output_set_double("DTK", dtk)
            igs.output_set_double("TRK", trk)
            igs.output_set_double("N1", n1)
            igs.output_set_double("N2", n2)
            igs.output_set_double("EGT", egt)
            igs.output_set_double("DIFF_PSI", diff_psi)
            
        except Exception as e:
            print("Error while receiving or processing data:", e)

if __name__ == "__main__":
    # Catch SIGINT handler before starting the agent
    signal.signal(signal.SIGINT, signal_handler)

    # Initialize Ingescape
    igs.agent_set_name(agent_name)
    igs.definition_set_version("1.0")
    igs.log_set_console(True)
    igs.log_set_console_level(igs.LOG_INFO)

    # Define outputs
    igs.output_create("latitude", igs.DOUBLE_T, None)
    igs.output_create("longitude", igs.DOUBLE_T, None)
    igs.output_create("heading", igs.DOUBLE_T, None)
    igs.output_create("GS", igs.DOUBLE_T, None)
    igs.output_create("DTK", igs.DOUBLE_T, None)
    igs.output_create("TRK", igs.DOUBLE_T, None)
    igs.output_create("N1", igs.DOUBLE_T, None)
    igs.output_create("N2", igs.DOUBLE_T, None)
    igs.output_create("EGT", igs.DOUBLE_T, None)
    igs.output_create("DIFF_PSI", igs.DOUBLE_T, None)

    # Start Ingescape agent
    igs.start_with_device(device, port)

    # Create and bind UDP socket
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.bind((UDP_IP, UDP_PORT))
    print(f"Listening for UDP data on {UDP_IP}:{UDP_PORT}...")

    # Run UDP listener in the main thread
    try:
        start_udp_listener(udp_sock)
    except KeyboardInterrupt:
        print("Shutting down UDP listener.")
    finally:
        udp_sock.close()

    # Stop Ingescape when interrupted
    if igs.is_started():
        igs.stop()
