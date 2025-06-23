-- Load socket library
local socket = require("socket")

-- Set position datarefs (read-only)
dataref("local_x", "sim/flightmodel/position/latitude", "readonly")
dataref("local_y", "sim/flightmodel/position/longitude", "readonly")
dataref("heading",  "sim/flightmodel/position/true_psi", "readonly")
dataref("GS",  "sim/flightmodel/position/groundspeed", "readonly")
dataref("DTK",  "sim/cockpit2/tcas/targets/position/hpath", "readonly")
dataref("TRK",  "sim/cockpit2/gauges/indicators/ground_track_mag_pilot", "readonly")
dataref("N1",  "sim/cockpit2/engine/indicators/N1_percent", "readonly")
dataref("N2",  "sim/cockpit2/engine/indicators/N2_percent", "readonly")
dataref("EGT",  "sim/flightmodel2/engines/EGT_deg_C", "readonly")
dataref("DIFF_PSI",  "sim/cockpit/pressure/cabin_pressure_differential_psi", "readonly")
dataref("ALT_FT",  "sim/cockpit2/oxygen/indicators/pilot_felt_altitude_ft", "readonly")
dataref("OIL_PSI",  "sim/flightmodel/engine/ENGN_oil_press_psi", "readonly")
dataref("OIL_C",  "sim/cockpit2/engine/indicators/oil_temperature_deg_C", "readonly")
-- dataref("FLAPS",  "sim/flightmodel2/controls/flap_handle_deploy_ratio", "readonly")
dataref("FLAPS",  "sim/aircraft/limits/red_hi_bat_amp", "readonly")
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
    local gs = (GS)
    local dtk = DTK
    local trk = TRK
    local n1 = N1
    local n2 = N2
    local egt = EGT
    local diff_psi = DIFF_PSI
    local alt_ft = ALT_FT
    local oil_psi = OIL_PSI
    local oil_c = OIL_C
    local flaps = FLAPS

    -- Format the message as "X,Y,Z"
    local message = string.format("%.7f,%.7f,%.7f,%.0f,%.0f,%.0f,%.1f,%.1f,%.0f,%.1f,%.0f,%.0f,%.0f,%.7f",
                                  x,
                                  y, 
                                  z, 
                                  (gs*1.94384449), -- ground speed m/s to knots conversion
                                  dtk,
                                  trk,
                                  n1, n2,
                                  egt,
                                  diff_psi,
                                  alt_ft,
                                  oil_psi,
                                  oil_c,
                                  flaps * 35) 

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
        local gs = (GS)
        local dtk = DTK
        local trk = TRK
        local n1 = N1
        local n2 = N2
        local egt = EGT
        local diff_psi = DIFF_PSI
        local alt_ft = ALT_FT
        local oil_psi = OIL_PSI
        local oil_c = OIL_C
        local flaps = FLAPS

    local message = string.format("%.7f,%.7f,%.7f,%.0f,%.0f,%.0f,%.1f,%.1f,%.0f,%.1f,%.0f,%.0f,%.0f,%.7f",
                                  x,
                                  y, 
                                  z, 
                                  (gs*1.94384449), -- ground speed m/s to knots conversion
                                  dtk,
                                  trk,
                                  n1, n2,
                                  egt,
                                  diff_psi,
                                  alt_ft,
                                  oil_psi,
                                  oil_c, 
                                  flaps * 35) 

        -- Send the message via UDP
        udp:send(message)
    end
end
