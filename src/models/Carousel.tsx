import React, { useState, useEffect } from 'react';

interface CarouselProps {
    images: string[];
    texts: string[]; 
    interval?: number; // in milliseconds
}

const Carousel: React.FC<CarouselProps> = ({ images, texts, interval = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            (prevIndex - 1 + images.length) % images.length
        );
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [interval]);

    return (
        <div className="carousel flex flex-col items-center">
            <div className="carousel-images relative flex justify-center items-center w-full h-[125px]">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Slide ${index}`}
                        className={`carousel-image ${
                            index === currentIndex ? 'active' : ''
                        }`}
                        style={{
                            display: index === currentIndex ? 'block' : 'none',
                            width: '142px', // Largeur fixe
                            height: '142px', // Hauteur fixe
                            margin: '0 auto', // Centre horizontalement
                        }}
                    />
                ))}
            </div>
            <p className="carousel-text text-center mt-4 text-gray-600">
                {texts[currentIndex]}
            </p>
            {/* Navigation avec des cercles */}
        <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-4 h-4 rounded-full border-2 ${
                        index === currentIndex ? 'border-[#FFD700] bg-[#FFD700]' : 'border-[#FFC107]'
                    }`}
                />
            ))}
        </div>
    </div>
    );
}

export default Carousel;