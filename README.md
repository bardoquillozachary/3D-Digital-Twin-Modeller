# IIoT Digital Twin Builder

A web-based 3D editor for building and configuring Industrial Internet of Things (IIoT) Digital Twins. This application allows users to import 3D models, attach interactive MQTT-enabled components (like data displays and interactive buttons), and save these configurations locally for future use.

## Features

* **3D Scene Editing:** Built with Three.js. Includes tools to spawn walls, doors, and import custom `.glb`/`.gltf` 3D models.
* **Object Inspector:** Translate, rotate, and scale objects with precision. Includes quick-snap rotation buttons and toggleable grid snapping (press `G` or hold `Shift`).
* **IoT Components:** Attach multiple interactive components to a single 3D model:
  * **Displays:** Visualize incoming MQTT data using a "Simple Text" overlay or an "Advanced Flowmeter" animated bar.
  * **Buttons:** Create clickable 3D buttons that publish custom payloads to MQTT topics.
* **Local Model Storage:** Uploaded 3D models are saved locally on the server via `multer`.
* **Model Variants:** Save customized models (with their attached displays/buttons and MQTT topics) as new "variants" that can be quickly loaded from the sidebar later.
* **3D Previews:** The "Saved Models" sidebar dynamically renders live 3D rotating previews of your saved `.glb` files using Google's `<model-viewer>`.
* **Scene Export:** Export your entire arranged digital twin scene (including all models, walls, and IoT settings) to a single JSON configuration file.
* **First-Person Camera:** Navigate the 3D space freely using `W` `A` `S` `D` or the arrow keys.

## Prerequisites

* Node.js (v14 or higher recommended)
* An active MQTT broker (the app defaults to `ws://broker.emqx.io:8083/mqtt` for testing purposes).

## Installation

1. Clone or download this repository.
2. Open a terminal in the project root directory.
3. Install the required Node.js dependencies:

```bash
npm install express multer
```

## Running the Application

1. Start the backend server:

```bash
node server.js
```

2. The server will automatically create `public/uploads` and `public/configs` directories if they do not exist.
3. Open your web browser and navigate to:

```text
http://localhost:3000
```

## How to Use

### 1. Importing and Configuring a Model
1. Click **Import .GLB Model** to upload a 3D asset to the scene. It will automatically be saved to your local `uploads` folder.
2. Click on the spawned 3D model to open the **Object Inspector**.
3. Under the **IoT Settings** panel, click **+ Add Display** or **+ Add Button**.
4. Assign an **MQTT Topic** for the component to listen to (or publish to).
5. Use the provided X, Y, Z coordinate inputs to offset, tilt, and scale the floating LCD component so it aligns perfectly with the surface of your 3D model.

### 2. Saving a Model Variant
If you've configured a generic machine with a specific display and MQTT topic, you can save it for later:
1. Ensure your model is selected.
2. Click **Save as New Model Variant**.
3. Enter a name (e.g., `Boiler_Sensor_1`).
4. The server will duplicate the base `.glb` file and pair it with a `.json` config file containing your exact IoT settings.

### 3. Loading Saved Models
1. Expand the **📁 Saved Models ▼** menu in the left toolbar.
2. You will see 3D previews of all previously imported models and variants.
3. Click a preview card to instantly drop it into your scene with all previous IoT configurations automatically applied!

### 4. Interacting via MQTT
* **Data In:** Any incoming MQTT messages on a display component's topic will automatically update the 3D canvas (e.g., changing the flowmeter level).
* **Data Out:** Clicking directly on a 3D Button component in the scene will publish its configured payload to the specified MQTT topic.

## Project Structure

* `server.js` - The Node.js Express server. Handles serving static files and API endpoints for model uploads and config saves.
* `public/index.html` - The frontend web application containing all Three.js rendering, UI, and MQTT logic.
* `public/uploads/` - Directory where uploaded `.glb`/`.gltf` base models and duplicated variants are stored.
* `public/configs/` - Directory where the JSON configurations (IoT topics, component positions) for each model variant are stored.