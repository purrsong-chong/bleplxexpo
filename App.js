import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BleManager, Characteristic } from 'react-native-ble-plx';

export default class App extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
  }
  state = {
    list: '',
    error: ''
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
          this.setState({ list: 'success'});
            
            // Stop scanning as it's not necessary if you are scanning for one device.
            this.manager.stopDeviceScan();
            device.connect()
            .then((device) => {
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
              this.setState({ list: device.id });
               // Do work on device with services and characteristics
            })
            .catch((error) => {
              this.setState({ error });
            });
            // Proceed with connection.
        }
    });
}
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <TouchableOpacity onPress={this.scanAndConnect.bind(this)}><Text>SCAN</Text></TouchableOpacity>
        <Text>{this.state.list}</Text>
        <Text>{this.state.error}</Text>
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
