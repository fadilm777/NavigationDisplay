-- Load socket library
local socket = require("socket")

-- Set position datarefs (read-only)
dataref("local_x", "sim/flightmodel/position/latitude", "readonly")
dataref("local_y", "sim/flightmodel/position/longitude", "readonly")
dataref("local_z", "sim/flightmodel/position/local_z", "readonly")
dataref("heading",  "sim/flightmodel/position/true_psi", "readonly")

-- UDP configuration
local udp_ip = "127.0.0.1"  -- Target IP (localhost)
local udp_port = 5005       -- Target port

-- Create a UDP socket
local udp = assert(socket.udp())
assert(udp:setpeername(udp_ip, udp_port))

-- Function to send position data
function send_position_data()
    -- Get current position
    local x = local_x
    local y = local_y
    local z = heading

    -- Format the message as "X,Y,Z"
    local message = string.format("%.7f,%.7f,%.7f", x, y, z)

    -- Send the message via UDP
    udp:send(message)
end

-- Schedule send_position_data to run every frame
do_every_frame("send_position_data()")

-- ImGui Interface for manual start/stop control
if not SUPPORTS_FLOATING_WINDOWS then
    logMsg("ImGui not supported by your FlyWithLua version")
    return
end

udp_wnd = float_wnd_create(300, 100, 1, true)
float_wnd_set_position(udp_wnd, 100, 100)
float_wnd_set_title(udp_wnd, "UDP Position Sender")
float_wnd_set_imgui_builder(udp_wnd, "udp_on_build")
float_wnd_set_onclose(udp_wnd, "closed_udp_window")

udp_sending_enabled = true  -- Default to sending position data

function udp_on_build(udp_wnd, x, y)
    imgui.TextUnformatted("UDP Position Data Sender")
    
    if udp_sending_enabled then
        if imgui.Button("Stop Sending Data") then
            udp_sending_enabled = false
            logMsg("UDP data sending stopped.")
        end
    else
        if imgui.Button("Start Sending Data") then
            udp_sending_enabled = true
            logMsg("UDP data sending started.")
        end
    end

    imgui.TextUnformatted(string.format("Data sending is %s", udp_sending_enabled and "Enabled" or "Disabled"))
end

function closed_udp_window(wnd)
    udp_sending_enabled = false
    logMsg("UDP window closed, data sending stopped.")
end

-- Modify send_position_data to respect udp_sending_enabled
function send_position_data()
    if udp_sending_enabled then
        -- Get current position
        local x = local_x
        local y = local_y
        local z = heading

        -- Format the message as "X,Y,Z"
        local message = string.format("%.7f,%.7f,%.7f", x, y, z)

        -- Send the message via UDP
        udp:send(message)
    end
end
