import React, { Component } from "react";
import Camera from 'react-native-camera';
import { View } from "react-native";
import { Relocator } from "../components";
export class GossAppWalkLayout extends Component {
    constructor() {
        super();
        this.captureTimeout = null;
        this.state = { log: "" };
    }
    componentDidMount() {
        if (this.camera != null) {
            this.camera.getFOV()
                .then((devices) => {
                this.setState({ frameOfView: devices.Back });
            });
        }
    }
    componentWillUnMount() {
        clearInterval(this.captureTimeout);
    }
    render() {
        return (<View style={{ flex: 1, backgroundColor: "blue", height: 500 }}>
        <Camera ref={(camera) => this.camera = camera} style={{ flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center' }}>
          <Relocator horizontalFrameOfView={this.state.frameOfView}></Relocator>
        </Camera>
      </View>);
    }
}
export default GossAppWalkLayout;
