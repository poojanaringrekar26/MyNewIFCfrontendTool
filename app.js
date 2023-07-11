import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

///////////////////////////////////////////////////////////////////////
// CREATE THE VIEWER

const container = document.getElementById('viewer-container');
const viewerColor = new Color('#E2F0D9');
const viewer = new IfcViewerAPI({ container, backgroundColor: viewerColor });
viewer.grid.setGrid();
viewer.axes.setAxes();

///////////////////////////////////////////////////////////////////////
// CREATE THE LOAD IFC BUTTON

const inputButton = document.getElementById("load-ifc-button");
inputButton.addEventListener("change", async () => {
    const ifcFile = inputButton.files[0];
    const ifcURL = URL.createObjectURL(ifcFile);
    const model = await viewer.IFC.loadIfcUrl(ifcURL);
    // Create shadows
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
  }
);

///////////////////////////////////////////////////////////////////////
// CREATE INTERACTION WITH THE MODEL

window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

window.onclick = async () => await viewer.IFC.selector.pickIfcItem();

viewer.clipper.active=true;

window.onkeydown = (event) => {
    if(event.code === 'KeyP') {
        viewer.clipper.createPlane();
    }
    else if(event.code === 'KeyO') {
        viewer.clipper.deletePlane();
    }
};

///////////////////////////////////////////////////////////////////////
// COMUNICA

import { QueryEngine } from '@comunica/query-sparql'

export async function queryComunica() {
  const myEngine = new QueryEngine();
  const query = document.getElementById("SPARQL-input").value
  const graphs = document.getElementById("GRAPH-input").value.split(',')
  const bindingsStream = await myEngine.queryBindings(query, {
    sources: 'https://raw.githubusercontent.com/AlexDonkers/ofo/main/SWJ_Resources/OpenFlat/OpenFlat_Donkers.ttl',
  });
  const bindings = await bindingsStream.toArray();
  console.log("Results"+bindings)

  // Plot in results box

}
window.queryComunica = queryComunica;

  // Plot in results box
  //clear result box
  document.getElementById("results-box-content").innerHTML = "";
  //start table component
  let tableContent = "<table>" 

  tableContent +="<tr>"
  const headers = bindings[0].entries._root.entries
  for (var y = 0; y<headers.length; y++) {
    tableContent += "<th>"+headers[y][0]+"</th>"
  }
  tableContent +="</tr>"

  for (var i = 0; i<bindings.length; i++) {
    const binding1 = bindings[i]
    const results = binding1.entries._root.entries

    //create table rows
    tableContent += "<tr>"
    for (var x = 0; x<results.length; x++) {
      if (results[x][1].termType === "Literal") {
        console.log(results[x][0] +": "+ results[x][1].value)
        
        tableContent += "<td>"+results[x][1].value+"</td>"
      }
      if (results[x][1].termType !== "Literal") {
        console.log(results[x][0] +": "+ results[x][1].value.split("#", 2)[1])
        tableContent += "<td><a target='_blank' href='"+results[x][1].value+"'>"+results[x][1].value.split("#", 2)[1]+"</a></td>"
      }
    }
    tableContent += "</tr>"
  } 
  //end
  tableContent += "</table>" 

  //add table to results box
  document.getElementById("results-box-content").innerHTML = tableContentno


///////////////////////////////////////////////////////////////////////
// MAPBOX GIS LOCATION

import { Matrix4, Vector3, Camera, Scene, DirectionalLight, WebGLRenderer, GLTFLoader
} from "three";



mapboxgl.accessToken = 'pk.eyJ1IjoiMTZkZWFkcG9vbDI2IiwiYSI6ImNsam1yZXN2bzA0MDEzcXFtNW51dTNkdzQifQ.Y0BKZGONYFTx879QVrB4AApk.eyJ1IjoiMTZkZWFkcG9vbDI2IiwiYSI6ImNsam1yZXN2bzA0MDEzcXFtNW51dTNkdzQifQ.Y0BKZGONYFTx879QVrB4AA';
const map = new mapboxgl.Map({
container: 'load-ifc-button',
// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
style: 'mapbox://styles/mapbox/light-v11',
zoom: 18,
center: [148.9819, -35.3981],
pitch: 60,
antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
});
 
// parameters to ensure the model is georeferenced correctly on the map
const modelOrigin = [148.9819, -35.39847];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, 0, 0];
 
const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
modelOrigin,
modelAltitude
);
 
// transformation parameters to position, rotate and scale the 3D model onto the map
const modelTransform = {
translateX: modelAsMercatorCoordinate.x,
translateY: modelAsMercatorCoordinate.y,
translateZ: modelAsMercatorCoordinate.z,
rotateX: modelRotate[0],
rotateY: modelRotate[1],
rotateZ: modelRotate[2],
/* Since the 3D model is in real world meters, a scale transform needs to be
* applied since the CustomLayerInterface expects units in MercatorCoordinates.
*/
scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};
 
 
// configuration of the custom layer for a 3D model per the CustomLayerInterface
const customLayer = {
id: '3d-model',
type: 'custom',
renderingMode: '3d',
onAdd: function (map, gl) {
this.camera = new Camera();
this.scene = new Scene();
 
// create two three.js lights to illuminate the model
const directionalLight = new DirectionalLight(0xffffff);
directionalLight.position.set(0, -70, 100).normalize();
this.scene.add(directionalLight);
 
const directionalLight2 = new DirectionalLight(0xffffff);
directionalLight2.position.set(0, 70, 100).normalize();
this.scene.add(directionalLight2);
 
// use the three.js GLTF loader to add the 3D model to the three.js scene
const loader = new GLTFLoader();
loader.load(
'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
(gltf) => {
this.scene.add(gltf.scene);
}
);
this.map = map;
 
// use the Mapbox GL JS map canvas for three.js
this.renderer = new WebGLRenderer({
canvas: map.getCanvas(),
context: gl,
antialias: true
});
 
this.renderer.autoClear = false;
},
render: function (gl, matrix) {
const rotationX = new Matrix4().makeRotationAxis(
new Vector3(1, 0, 0),
modelTransform.rotateX
);
const rotationY = new Matrix4().makeRotationAxis(
new Vector3(0, 1, 0),
modelTransform.rotateY
);
const rotationZ = new Matrix4().makeRotationAxis(
new Vector3(0, 0, 1),
modelTransform.rotateZ
);
 
const m = new Matrix4().fromArray(matrix);
const l = new Matrix4()
.makeTranslation(
modelTransform.translateX,
modelTransform.translateY,
modelTransform.translateZ
)
.scale(
new Vector3(
modelTransform.scale,
-modelTransform.scale,
modelTransform.scale
)
)
.multiply(rotationX)
.multiply(rotationY)
.multiply(rotationZ);
 
this.camera.projectionMatrix = m.multiply(l);
this.renderer.resetState();
this.renderer.render(this.scene, this.camera);
this.map.triggerRepaint();
}
};
 
map.on('style.load', () => {
map.addLayer(customLayer, 'waterway-label');
});



//////////////////////////////////////////////////////////////////////
// SPLIT THE CURRENT SCREEN


