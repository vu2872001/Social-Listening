import { useEffect } from 'react';

function App() {
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                // This is App ID
                appId: '189583720076123',
                cookie: true,
                xfbml: true,
                version: 'v14.0',
            });

            window.FB.AppEvents.logPageView();

            window.FB.getLoginStatus(function (response) {
                console.log(response);
            });
        };

        (function (d, s, id) {
            var js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');
    });

    const onLoginClick = () => {
        window.FB.login(
            function (response) {
                console.log(response);
            },
            {
                config_id: '3408294016088035', // configuration ID goes here

            }
        );
    };

    return (
        <div className='app'>
            <div>
                <button onClick={onLoginClick}>Login with Facebook</button>
            </div>
        </div>
    );
}

export default App;
