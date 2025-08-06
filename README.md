# Cirrus SF50 Navigation Display Replacement for X-Plane 11
This project is a software system designed to replace the **Navigation Display** of the **Cirrus Vision SF50** aircraft in **X-Plane 11**. The custom navigation display is served via a modern web browser that closely mimics the behaviour of the built-in display, powered by real-time data streamed from the simulator

## Features
- Live updates using **Websockets** for smooth and accurate aircraft data.
- Powered by a **Python backend** with **Ingescape** integration.
- Front-end built with **HTML, CSS and Javascript**.

## How it works
1. The **backend** launches an **Ingescape agent** that listens to aircraft data via input points.
2. Data is streamed to the frontend using **Websockets**
3. The frontend, running on `localhost:8080`, updates the navigation display in real time.

## Prerequisites
Before running the software, install the following:
1. [Python 3+](https://www.python.org/downloads/)
2. [Node.js + npm](https://nodejs.org/en) (used to install `live-server`)
3. [GNU Make](https://www.gnu.org/software/make/)
4. [Ingescape](https://ingescape.com/get/)
5. [FlyWithLua Plugin for X-plane](https://forums.x-plane.org/files/file/38445-flywithlua-ng-next-generation-edition-for-x-plane-11-win-lin-mac/)

### Lua Script Setup
After installing **FlyWithLua**, copy the custom Lua script from this repo (`FlyWithLua/send_data_udp.lua`) to your FlyWithLua Scripts directory (`Xplane 11/Resources/plugins/FlyWithLua/Scripts`)

## Installation and Run Instructions for Windows
1. Clone the repository
   ```
   git clone https://github.com/fadilm777/NavigationDisplay.git
   cd NavigationDisplay
   ```
2. Set Up Python Environment
   ```
   cd pyInterface
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
   Refer to this [documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-7.5) by microsoft to enable execution of scripts on your machine if disabled.

3. Install `live-server` Globally
   ```
   npm install -g live-server
   ```
4. Add the api key link to mapstyle.json
   - Log into [maptiler](https://www.maptiler.com/) and [publish](https://docs.maptiler.com/guides/map-design/how-to-publish-a-map/) a standard map of your liking.
   - Copy the _vector style_ api link
   - paste the link on _line 11 in the_ `url` _section_ into `frontend/mapstyle.json`
     
     ```
     "url": "YOUR_API_LINK",
     ```
5. Run the software
   From the root directory of this repo:
   ```
   make
   ```
   This will start the backend Python server and launch the frontend in a browser window pointing to `http://localhost:8080`.
   If the browser window does not open automatically, navigate manually to `http://localhost:8080`.
6. Configuration in Ingescape Circle
   - Launch Ingescape Circle.
   - Connect Ingescape Circle to Ethernet|Port:5670.
   - Connect the output points from _xplane_position_agent_ to the input points of _gps agent_.
   - The map should now mirror the aircraft's navigation display in real-time.

## Contributions
Feel free to fork the repo if you'd like to improve the software, add features or fix bugs.
