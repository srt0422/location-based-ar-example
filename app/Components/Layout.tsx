import React, {Component} from "react";
import {Container, Header, Left, Button, Icon, Content, Body, Title, Right} from "native-base";
import Camera from 'react-native-camera';
// import { Col, Row, Grid } from 'react-native-easy-grid';
import {View, Text} from "react-native";
import {Relocator} from "../components";

export class GossAppWalkLayout extends Component<any, any>{

public camera: Camera;
public frameOfView;

private captureTimeout = null;

  constructor(){
      super();

      this.state = {log: ""};
  }

  public componentDidMount() {
    if(this.camera != null) {

      this.camera.getFOV()
                  .then((devices)=>{
                    this.setState({frameOfView: devices.Back});
                  });
    }
  }

  public componentWillUnMount(){
    clearInterval(this.captureTimeout);
  }

  public render(){
    return (
      <View style={{flex: 1, backgroundColor: "blue",height: 500}}>
        <Camera ref={(camera) => this.camera = camera}
        style={{flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'}}>
          <Relocator horizontalFrameOfView={this.state.frameOfView}></Relocator>
        </Camera>
      </View>
    );
  }
}
export default GossAppWalkLayout;
