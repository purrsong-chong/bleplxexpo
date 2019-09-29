import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64'

export default class App extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
  }
  state = {
    deviceId: '',
    error: '',
    status: '',
    service_uuid: '',
    characteristic_uuid: '',
    transmit_status: ''
  }
  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
            // Handle error (scanning will be stopped automatically)
            return
        }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        if (device.name === 'LavvieBot_CCF9' ) {
          this.setState({ status: 'success', deviceId: device.id});
            
            // Stop scanning as it's not necessary if you are scanning for one device.
            this.manager.stopDeviceScan();
            device.connect()
            .then((device) => {
              device.discoverAllServicesAndCharacteristics()
              .then((device) => {
                device.services()
                .then((service) => {
                  this.setState({ service_uuid: service[0].uuid });
                  service[0].characteristics()
                  .then((charecteristic) => {
                    this.setState({ characteristic_uuid: charecteristic[0].uuid });
                    let router = {
                      ip: 'iptime', 
                      password: 123456
                    };
                    let routerString = JSON.stringify(router);
                    let router_base64 = base64.encode(routerString);
                    //using base64, transfer data to lavviebot
                    charecteristic[0].writeWithResponse(router_base64)
                    .then((onfulfilled) => {
                      this.setState({ transmit_status: 'success' });
                    })
                    .catch((error) => {
                      this.setState({ error });
                    })
                  })
                  .catch((error) => {
                    this.setState({ error });
                  });
                })
                .catch((error) => {
                  this.setState({ error });
                })
              })
              .catch((error) => {
                this.setState({ error });
              })
            })
            .catch((error) => {
              this.setState({ error });
            }); 
        }// device name: LavvieBot_CCF9
    });
}
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.scanAndConnect.bind(this)}><Text style={{ color: 'cyan' }}>SCAN</Text></TouchableOpacity>
        <Text>deviceId: {this.state.deviceId}</Text>
        <Text>error: {this.state.error}</Text>
        <Text>status: {this.state.status}</Text>
        <Text>service_uuid: {this.state.service_uuid}</Text>
        <Text>characteristic_uuid: {this.state.characteristic_uuid}</Text>
        <Text>transmit status: {this.state.transmit_status}</Text>
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
