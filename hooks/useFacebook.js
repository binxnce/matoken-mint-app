import { useEffect } from 'react';

const useFacebook = () => {
  useEffect(() => {
    window.fbAsyncInit = function() {
      FB.init({
        appId: '1693164117499244',
        xfbml: true,
        autoLogAppEvents: true,
        version: 'v7.0',
      });
      FB.AppEvents.logPageView();
    };

    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(window.document, 'script', 'facebook-jssdk');
  }, []);
};

export default useFacebook;
