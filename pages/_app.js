import PropTypes from 'prop-types';
import 'swiper/swiper-bundle.css';
import Page from '../components/Page';
import wrapper from '../redux/store';
import ServicesProvider from '../services/ServicesProvider';
import SdkService from '../services/SdkService';
import NotificationService from '../services/NotificationService';
import BalanceService from '../services/BalanceService';

const sdkService = new SdkService();
const notificationService = new NotificationService();
const balanceService = new BalanceService();

const MyApp = ({ Component, pageProps }) => (
  <ServicesProvider
    services={{
      sdkService,
      notificationService,
      balanceService,
    }}
  >
    <Page>
      <Component {...pageProps} />
    </Page>
  </ServicesProvider>
);

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default wrapper.withRedux(MyApp);
