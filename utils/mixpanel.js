import mixpanel from 'mixpanel-browser';
import config from '../config';

let useMixpanel = true;
let mixpanelMock;

if (config.mixpanelKey && config.mixpanelHost) {
  mixpanel.init(config.mixpanelKey, { api_host: config.mixpanelHost }, '');
} else {
  useMixpanel = false;
  mixpanelMock = {
    identify: () => {},
    people: { set_once: () => {}, set: () => {} },
    track: () => {},
  };
}

export default useMixpanel ? mixpanel : mixpanelMock;
