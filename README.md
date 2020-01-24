# bleplxexpo
BLE TRANSMISSION(ROUTER INFO)

경민님께서 정리해주신 코드를 조금 다듬에서 정리 했습니다.
react-native-ble-plx를 이용하여 lavviebot에 라우터 정보를 넘겨주는 코드 입니다.

앱에서 적용시,

1) 우선 앱에서 router ssid, password를 받아서 state레벨에 저장하고 있어야 합니다.
2) commandData라는 속성에 ssid와 password를 넣어서 base64 encode하여 전송해야 합니다.(line 69 참고)

라우터 정보가 라비봇에 잘 넘어갔는지 확인은 펌웨어 쪽에서 확인 해봐야 할 것 같습니다.
