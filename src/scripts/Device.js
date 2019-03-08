import device from 'ua-device-type';

const deviceType = device(window.navigator.userAgent);

export default deviceType;
