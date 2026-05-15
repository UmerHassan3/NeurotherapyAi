import { useState } from 'react';

export default function Threapy() {
    const [selectedTherapy, setSelectedTherapy] = useState(null);

    const therapies = [
        {
            id: 1,
            name: 'Cognitive Behavioral Therapy',
            description: 'A structured form of psychological therapy that helps identify and change negative thought patterns.',
            duration: '45-60 min',
            price: 80
        },
        {
            id: 2,
            name: 'Neurofeedback Therapy',
            description: 'A non-invasive method that trains the brain to produce healthier brainwave patterns.',
            duration: '45-60 min',
            price: 100
        },
        {
            id: 3,
            name: 'Mindfulness Therapy',
            description: 'Focuses on being present and fully engaged in the current moment.',
            duration: '30-45 min',
            price: 60
        },
        {
            id: 4,
            name: 'Group Therapy',
            description: 'Therapeutic sessions conducted with multiple participants sharing similar experiences.',
            duration: '60-90 min',
            price: 40
        }
    ];

    const handleSelect = (therapy) => {
        setSelectedTherapy(therapy);
    };

    const handleBook = () => {
        console.log('Booking therapy:', selectedTherapy);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Our Therapies</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {therapies.map(therapy => (
                    <div 
                        key={therapy.id}
                        className={`p-6 border rounded-lg cursor-pointer transition ${
                            selectedTherapy?.id === therapy.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelect(therapy)}
                    >
                        <h2 className="text-xl font-semibold mb-2">{therapy.name}</h2>
                        <p className="text-gray-600 mb-4">{therapy.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Duration: {therapy.duration}</span>
                            <span className="text-lg font-bold">${therapy.price}/session</span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTherapy && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleBook}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600"
                    >
                        Book {selectedTherapy.name}
                    </button>
                </div>
            )}
        </div>
    );
}