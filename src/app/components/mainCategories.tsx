'use client';
import { memo } from 'react';
import Image from 'next/image';
import Mobile from "../assets/mobilec.png";
import Laptop from "../assets/laptopc.png";
import Watch from "../assets/watch.png";
import Tshirt from "../assets/tshirt.png";
import Camera from "../assets/camerac.png";
import Shoes from "../assets/shoes.png";

const categories = [
  { url: Mobile, name: "mobile", id: 0 },
  { url: Laptop, name: "laptop", id: 1 },
  { url: Watch, name: "watch", id: 2 },
  { url: Tshirt, name: "tshirt", id: 3 },
  { url: Camera, name: "camera", id: 4 },
  { url: Shoes, name: "shoes", id: 5 }
];

const MainCategories = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full h-1/2 overflow-hidden p-4">
      {categories.map((category) => (
        <div
          className="cursor-pointer group flex flex-col items-center justify-center h-40 sm:h-48 md:h-56 lg:h-64"
          key={category.id}
        >
          <Image
            src={category.url}
            alt={`image ${category.name}`}
            placeholder="blur"
            decoding="async"
            className="group-hover:scale-110 transition-transform duration-200 ease-in-out object-contain h-3/4"
            priority={category.id === 0} 
          />
          <p className="dark:text-white text-center mt-2 xl:text-xl lg:text-md text-sm capitalize">
            {category.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default memo(MainCategories);
