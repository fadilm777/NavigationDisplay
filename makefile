.PHONY: setup

setup:
	@echo "Starting ingescape agent to send telemetry"
	@powershell Start-Process -FilePath "pyInterface/venv/Scripts/python" -ArgumentList "pyInterface/xplaneAgent/xplane_agent_FLyWithLua.py" -WindowStyle Hidden 
	@echo "Starting ingescape agent to recieve telemetry"
	@powershell Start-Process -FilePath "pyInterface/venv/Scripts/python" -ArgumentList "pyInterface/main.py" -WindowStyle Hidden 
	@powershell sleep 2
	@echo "Starting frontend server to serve map files in browser"
	@powershell live-server frontend




