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
                            A messenger clone to chat between users and with a bot (Simsimi bot model).
                        </p>
                    </div>
                </div>
            )}
            <div className="max-w-md p-6 bg-white rounded-lg shadow-lg mt-16">
                <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>Notes:</h3>
                <p className="text-gray-600">
                    To use ChatMate with Safari browser, you need to enable third-party cookies.
                    <br />
                    Follow these steps:
                </p>
                <ol className="list-decimal pl-6 mt-2 text-gray-600">
                    <li>Go to Safari &gt; Preferences</li>
                    <li>Select the Privacy tab</li>
                    <li>Uncheck "Prevent cross-site tracking"</li>
                </ol>
            </div>
        </div>
    );
};

export default Intro;
