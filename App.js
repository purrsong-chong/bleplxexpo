import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64'

class ConnectToLavviebot extends Component {

}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.manager = new BleManager();
    // Commands = new Connect();
  }
  state = {
    deviceId: '',
    deviceName: '',
    error: '',
    status: '',
    service_uuid: '',
    uart_rx_uuid: '',
    uart_tx_uuid: '',
    tx_characteristic: {},
    command_packet: '',
    base64_command: '',
    response_received: ''
  }
  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.setState({
        deviceId: '',
        deviceName: '',
        error: '',
        status: '',
        service_uuid: '',
        uart_rx_uuid: '',
        uart_tx_uuid: '',
        tx_characteristic: {},
        command_packet: '',
        base64_command: '',
        response_received: ''
      });
      if (error) {
          // Handle error (scanning will be stopped automatically)
          this.setState({ error: 'error' });
          return
      }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
      if (device.name === 'LavvieBot_A66C') {
        this.setState({ status: 'success', deviceId: device.id, deviceName: device.name });

        this.manager.stopDeviceScan();
        return device.connect()
          .then((device) => { return device.discoverAllServicesAndCharacteristics(); })
          .then((device) => { return device.services(); })
          .then((service) => {
            this.setState({ service_uuid: service[0].uuid });
            return service[0].characteristics();
          })
          .then((characteristic) => {
            // characteristic[1].monitor((characteristic) => {}, null);
            // console.log(base64.decode(base64.encode('\x03\x01\x00\x04')) === '\x03\x01\x00\x04' ? '11' : '1');
            let commandData = '';
            // 'ZZZZZZZZZZZZZZZZ';
            let commandPacket = '\x01' + '\x00' + commandData + '\x01';
            let base64Command = base64.encode(commandPacket);
            let packetByteArray = '';
            for (let index in commandPacket) {
              packetByteArray += commandPacket[index].charCodeAt() + ', ';
            }
            console.log(packetByteArray);
            this.setState({
              tx_characteristic: characteristic[1],
              uart_rx_uuid: characteristic[0].uuid,
              uart_tx_uuid: characteristic[1].uuid,
              command_packet : packetByteArray,
              base64_command: base64Command
            });

            return characteristic[0].writeWithResponse(base64Command);
          })
          .then((onfulfilled) => {
            this.setState({ transmit_status: 'success' });
            return this.state.tx_characteristic.read(null);
          })
          .then((characteristic) => {
            // for (var i = 0; i < base64.decode(characteristic.value).length; i++) {
            //   console.log(base64.decode(characteristic.value)[i].charCodeAt());
            // }
            let responseByteArray = '';
            for (let index in base64.decode(characteristic.value)) {
              responseByteArray += base64.decode(characteristic.value)[index].charCodeAt() + ', ';
            }
            this.setState({ response_received: responseByteArray });
            console.log(this.state.response_received);
            return this.manager.cancelDeviceConnection(this.state.deviceId);
          })
          .catch((error)=> {
            this.setState({ error: JSON.stringify(error) });
            if (this.state.deviceId) {
              return this.manager.cancelDeviceConnection(this.state.deviceId)
                .then((device) => { return; })
            }
          });
      }
      // if (device.name === 'LavvieBot_A66C' ) {
      //   this.setState({ status: 'success', deviceId: device.id, deviceName: device.name});
      //
      //     // Stop scanning as it's not necessary if you are scanning for one device.
      //     this.manager.stopDeviceScan();
      //     device.connect()
      //     .then((device) => {
      //       device.discoverAllServicesAndCharacteristics()
      //       .then((device) => {
      //         device.services()
      //         .then((service) => {
      //           this.setState({ service_uuid: service[0].uuid });
      //           service[0].characteristics()
      //           .then((characteristic) => {
      //             this.setState({ uart_rx_uuid: characteristic[0].uuid, uart_tx_uuid: characteristic[1].uuid });
      //             let commandData = '\x03' + '\x10' + 'ZZZZZZZZZZZZZZZZ' + '\xB3';
      //             let hex64 = base64.encode(commandData);
      //             this.setState({ dataPacket : hex64, requested_data: commandData });
      //
      //             //using base64, transfer data to lavviebot
      //             characteristic[0].writeWithResponse(hex64)
      //               .then((onfulfilled) => {
      //               })
      //               .catch((error) => {
      //                 this.setState({ error : JSON.stringify(error) });
      //               })
      //           })
      //           .catch((error) => {
      //             this.setState({ error : JSON.stringify(error) });
      //           });
      //         })
      //         .catch((error) => {
      //           this.setState({ error : JSON.stringify(error) });
      //         })
      //       })
      //       .catch((error) => {
      //         this.setState({ error : JSON.stringify(error) });
      //       })
      //     })
      //     .catch((error) => {
      //       this.setState({ error : JSON.stringify(error) });
      //     });
      // // }// device name: LavvieBot_CCF9
      // }
    });
  }

  ConnectionNotify(props) {
    if (props.isConnected) {
      return <Text style={{fontSize: 30, color: 'green'}}>Connected</Text>;
    }
    else {
      return null;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.scanAndConnect.bind(this)}><Text style={{ color: 'cyan', fontSize: 150 }}>SCAN</Text></TouchableOpacity>
        <Text>deviceId: {this.state.deviceId}</Text>
        <Text>deviceName: {this.state.deviceName}</Text>
        <Text>error: {this.state.error}</Text>
        <Text>requset status: {this.state.status}</Text>
        <Text>service uuid: {this.state.service_uuid}</Text>
        <Text>UartRX uuid: {this.state.uart_rx_uuid}</Text>
        <Text>UartTX uuid: {this.state.uart_tx_uuid}</Text>
        <Text>requested data: {this.state.command_packet}</Text>
        <Text>response received: {this.state.response_received}</Text>
        <this.ConnectionNotify isConnected={this.state.service_uuid} />
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
