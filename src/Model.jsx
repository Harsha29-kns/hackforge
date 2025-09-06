import React from 'react';

const Modal = ({ children, isLoading }) => {
    if (!children) return null;

    return (
        // This is the dark overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            
            {/* This is the key change:
              - If isLoading is true, we show the children (your GIF) without a background.
              - Otherwise, we show the children inside the original white box.
            */}
            {isLoading ? (
                <div>
                    {children}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg text-center w-11/12 md:w-1/3">
                    {children}
                </div>
            )}

        </div>
    );
};

export default Modal;