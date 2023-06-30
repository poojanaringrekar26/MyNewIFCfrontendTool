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