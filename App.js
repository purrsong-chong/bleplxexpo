import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

class ConnectToLavviebot extends Component {}

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
    response_received: '',
    received_characteristics: ''
  };
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
        return;
      }
      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (device.name !== null && device.name.substring(0, 9) === 'LavvieBot') {
        // DEVICE NAME .startswith 'lavviebot'으로 할건지?
        //LavvieBot_CCF9
        this.setState({ status: 'success', deviceId: device.id, deviceName: device.name });

        this.manager.stopDeviceScan();
        device
          .connect()
          .then(device => {
            device
              .discoverAllServicesAndCharacteristics()
              .then(device => {
                device
                  .services()
                  .then(service => {
                    this.setState({ service_uuid: service[0].uuid });
                    service[0]
                      .characteristics()
                      .then(characteristic => {
                        let commandData = '';
                        // 'ZZZZZZZZZZZZZZZZ';
                        let commandPacket = '\x01' + '\x00' + commandData + '\x01';
                        let base64Command = base64.encode(commandPacket);
                        let packetByteArray = '';
                        for (let index in commandPacket) {
                          packetByteArray += commandPacket[index].charCodeAt() + ', ';
                        }
                        this.setState({
                          tx_characteristic: characteristic[1],
                          uart_rx_uuid: characteristic[0].uuid,
                          uart_tx_uuid: characteristic[1].uuid,
                          command_packet: packetByteArray,
                          base64_command: base64Command
                        });
                        characteristic[0]
                          .writeWithResponse(base64Command)
                          .then(r_characteristics => {
                            this.setState({ transmit_status: 'success' });
                            this.manager.cancelDeviceConnection(this.state.deviceId);

                            // this.state.tx_characteristic
                            //   .read(null)
                            //   .then(characteristic => {
                            //     let responseByteArray = '';
                            //     for (let index in base64.decode(characteristic.value)) {
                            //       responseByteArray += base64.decode(characteristic.value)[index].charCodeAt() + ', ';
                            //     }
                            //     this.setState({ response_received: responseByteArray });
                            //   })
                            //   .catch(err => {
                            //     this.setState({ error: JSON.stringify(err).concat(':tx_characteristic.read(null)') });
                            //   });
                          })
                          .catch(err => {
                            this.setState({ error: JSON.stringify(err).concat(':writeWithResponse') });
                          });
                      })
                      .catch(err => {
                        this.setState({ error: JSON.stringify(err).concat(':characteristics') });
                      });
                  })
                  .catch(err => {
                    this.setState({ error: JSON.stringify(err).concat(':services') });
                  });
              })
              .catch(err => {
                this.setState({ error: JSON.stringify(err).concat(':discoverAllServicesAndCharacteristics') });
              });
          })
          .catch(err => {
            this.setState({ error: JSON.stringify(err).concat(':connect') });
          });
      }
    });
  }

  ConnectionNotify(props) {
    if (props.isConnected) {
      return <Text style={{ fontSize: 30, color: 'green' }}>Connected</Text>;
    } else {
      return null;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.scanAndConnect.bind(this)}>
          <Text style={{ color: 'cyan', fontSize: 120 }}>SCAN</Text>
        </TouchableOpacity>
        <Text>deviceInfo: {this.state.deviceInfo}</Text>
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
        <Text>received_characteristics: {this.state.received_characteristics}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
