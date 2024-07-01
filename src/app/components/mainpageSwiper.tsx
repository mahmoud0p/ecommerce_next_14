'use client';
import Image from "next/image";
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import Mobile from "../assets/phone.png";
import Laptop from "../assets/laptop.png";
import Camera from "../assets/camera.png";

import { Swiper  , SwiperSlide} from "swiper/react";
import {Pagination  , Autoplay , EffectFade } from "swiper/modules"
import { memo } from "react";
 function MainSwiper() {
  const images = [Mobile, Laptop, Camera];

  return (
    <Swiper
      modules={[Pagination, Autoplay, EffectFade]}
      pagination={{
        dynamicBullets: true,
        clickable: true
      }}
      effect="fade"
      loop
      autoplay={{
        delay: 3500
      }}
      className="lg:w-1/2 xs:w-3/4 w-full rounded-3xl h-full overflow-hidden shadow-lg dark:shadow-black flex items-center justify-center"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index} className="h-full w-full flex items-center justify-center">
          <Image
            placeholder="blur"
            priority={true}
            src={image}
            alt={`image-${index}`}
            className="object-cover w-full h-full"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default memo(MainSwiper)