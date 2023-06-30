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
    sources: graphs,
  });
  const bindings = await bindingsStream.toArray();
  console.log("Results"+bindings)

  // Plot in results box

}
window.queryComunica = queryComunica;