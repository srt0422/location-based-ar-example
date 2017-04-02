import React, { Component } from "react";
import { DeviceAngles, RNLocation as Location } from 'NativeModules';
import { DeviceEventEmitter, View, Text, Dimensions } from "react-native";
import math, { sin, cos, unit } from "mathjs";
DeviceAngles.setDeviceMotionUpdateInterval(0.1);
Location.startUpdatingHeading();
DeviceAngles.startMotionUpdates();

let tempLocation;

let tempHeading = 219;

export class Relocator extends Component {

    public watchId;
    public position;
    public log;
    public absolutePosition;

    public constructor() {
        super();

        this.state = {};
    }

    public render() {
        if (this.readyForRender()) {

            if (this.itemIsVisible()) {
                return (
                    <View style={{position:"absolute", left:0, top:0, right:0, bottom: 0}}>

                        <View style={{
                            position: "absolute",
                            height: 50,
                            width: 50,
                            backgroundColor: "blue",
                            left: this.position.x,
                            top: this.position.y }}><Text>here</Text></View>
                    </View>
                );
            }
        }

        return <View style={{ width: 320, height: 100, backgroundColor: "red" }}><Text>No Location Info</Text></View>;
    }
    // <View style={{backgroundColor:"red", height: 100, width: 320, position: "absolute", bottom: 0, left: 0}}>
    //     <View>
    //         <Text>Left: {this.position.x}</Text>
    //     </View>
    //     <View>
    //         <Text>Top: {this.position.y}</Text>
    //     </View>
    // </View>
    public componentWillMount() {

        DeviceEventEmitter.addListener('AnglesData', (data) => {

            let updateAttitude = false;

            if (this.state.motionAttitude == null) {
                updateAttitude = true;
            }
            else {
                for (let angle in this.state.motionAttitude) {
                    let angleDifference = this.state.motionAttitude[angle] - data[angle];
                    if (math.abs(angleDifference) >= 1) {
                        updateAttitude = true;
                        break;
                    }
                }
            }

            if (updateAttitude) {
                this.setState({ motionAttitude: {...data});
            }
        });

        DeviceEventEmitter.addListener('headingUpdated', (data) => {
            this.setState({ deviceHeading: data.heading });
        });

        this.watchId = navigator.geolocation.watchPosition((deviceLocation) => {
            this.setState({ deviceLocation: {...deviceLocation.coords}});
        });
}

    public componentWillUpdate() {

        if(this.readyForRender())
        {
            if(!tempLocation && this.state.deviceLocation){
                tempLocation = {
                    latitude: this.state.deviceLocation.latitude - .0001,
                    longitude: this.state.deviceLocation.longitude - .0001
                };
            }

             this.updatePosition();
        }
    }

    public componentWillUnMount() {
        DeviceAngles.stopMotionUpdates();
        DeviceEventEmitter.removeListener("AnglesData");
        DeviceEventEmitter.removeListener("headingUpdated");
        navigator.geolocation.clearWatch(this.watchId);
    }

    public updatePosition() {
        this.position = {
            x: this.calculateHorizontalPosition(),
            y: this.calculateVerticalPosition()
        };
    }

    public calculateVerticalPosition() {

        const {height} = Dimensions.get("window");

        let headingDifference = this.state.motionAttitude.yaw - 90;

        return height - ((height * headingDifference) / this.calculateVerticalFrameOfView());
    }

    public calculateVerticalFrameOfView() {

        const {width, height} = Dimensions.get("window");

        const divisor = math.gcd(width, height);
        const verticalAspect = height/divisor;
        const horizontalAzpect = width/divisor;

        return (verticalAspect / horizontalAzpect) * this.props.horizontalFrameOfView;
    }

    public calculateHorizontalPosition() {

        const { width } = Dimensions.get('window');

        let headingDifference = this.state.deviceHeading - tempHeading;

        return width - ((width * headingDifference) / this.props.horizontalFrameOfView);
    }

    public readyForRender(){
        return this.state.motionAttitude != null && this.state.deviceHeading != null;
    }

    public itemIsVisible() {

        let headingDifference = this.state.deviceHeading - tempHeading;

        return headingDifference <= (this.props.horizontalFrameOfView) && this.position;
    }

    public convertSpericalToCartesianCoordinates(radius, theta, phi) {
        let phiDeg = unit(phi, "rad").toNumber("deg");
        let thetaDeg = unit(theta, "rad").toNumber("deg");
        let x = radius * sin(phiDeg) * sin(thetaDeg);
        let y = radius * cos(phiDeg);
        let z = radius * sin(phiDeg) * cos(thetaDeg);
        return { x, y, z };
    }

    public calculateDistanceBetweenGeoCoordinates(originCoord, destinationCoord) {
        let lat1 = originCoord.latitude;
        let lat2 = destinationCoord.latitude;
        let lon1 = originCoord.longitude;
        let lon2 = destinationCoord.longitude;
        var R = 6371e3;
        var φ1 = unit(lat1, "deg").toNumber("rad");
        var φ2 = unit(lat2, "deg").toNumber("rad");
        var Δφ = unit(lat2 - lat1, "deg").toNumber("rad");
        var Δλ = unit(lon2 - lon1, "deg").toNumber("rad");
        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

export default Relocator;
