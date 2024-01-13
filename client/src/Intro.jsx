import React from 'react';
import { useMediaQuery } from 'react-responsive';

const Intro = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <div className={`flex flex-col justify-center items-center h-screen ${isMobile ? '' : 'ml-24'}`}>
            {!isMobile && (
                <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <div className={`mb-2 text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                        <h2 className="font-bold">Welcome to ChatMate!</h2>
                        <p className="text-gray-600">
                            A messenger clone for chatting with other users and a bot (Simsimi bot model).
                        </p>
                    </div>
                </div>
            )}
            <div className={`max-w-md p-6 bg-white rounded-lg shadow-lg ${isMobile ? 'mt-16' : 'mt-16'}`}>
                <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>Notes:</h3>
                <ol className="list-disc pl-4 text-gray-600">
                    <li>The free version of Render server will sleep after 30 minutes of inactivity. It will take 1-2 minutes to wake up. </li>
                    <li>In order to use ChatMate, you may need to install moesif cors extension to enable 3rd party cookies. </li>
                    <li>If you are using Safari browser, you need to follow these steps:</li>
                </ol>
                <ol className="list-decimal pl-6 text-gray-600">
                    <li>(Mac) Go to Safari &gt; Preferences</li>
                    <li>(Iphone) Open Settings &gt; Safari</li>
                    <li>Select the Privacy tab</li>
                    <li>Uncheck "Prevent cross-site tracking"</li>
                </ol>
            </div>
        </div>
    );
};

export default Intro;
