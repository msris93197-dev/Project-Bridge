import React from 'react';
import Graph1 from './graph1';
import Graph2 from './graph2';
import Graph3 from './graph3';
import Graph4 from './graph4';
import Graph5 from './graph5';
import Graph6 from './graph6';

import "./admin_home.css"
function AdminHome() {
  return (
    <>
    <div id='graphs_dashboard'>
    <div style={{ width: '100%' }}>
        <h5></h5>
        <Graph6  />
      </div>
    <div id="graph_bg">
        <h5>Projects per Department</h5>
      <Graph1  />
    </div>
    <div id="graph_bg">
        <h5>Avg Requests per Department</h5>
      <Graph2  />
    </div>
    <div id="graph_bg">
        <h5>Project Type Distribution</h5>
      <Graph3  />
    </div>
    <div id="graph_bg">
        <h5>Project Types Distribution per Department</h5>
      <Graph4  />
    </div>
    <div id="graph_bg">
        <h5>Project Slots</h5>
      <Graph5  />
    </div>
    </div>
    
    </>

  );
}

export default AdminHome;
