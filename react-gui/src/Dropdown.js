import React, { useState } from 'react';

const Dropdown = ({ options, callback }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);

    const toggleDropdown = () => setIsOpen(!isOpen);
    
    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false); // Close dropdown after selection
        callback(option);
    };

    return (
        <div className="flex flex-col items-center">
            <div onClick={toggleDropdown} className="border border-black rounded-md px-4 py-1 text-md">
                {selected[0] + " ↓"}
            </div>
            {isOpen && (
                <ul className="mt-9" style={{ border: '1px solid #ccc', listStyleType: 'none', padding: '0', position: 'absolute', backgroundColor: 'white' }}>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleSelect(option)} style={{ padding: '6px', cursor: 'pointer' }}>
                            {option[0]}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
