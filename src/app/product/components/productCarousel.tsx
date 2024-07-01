import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { useEffect, useRef, useState } from "react";
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
import 'swiper/css/zoom';

import { Thumbs, FreeMode , EffectFade , Zoom } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";
import path from "path";

export default function ProductCarousel({ images }: { images: { id: string, url: string }[] }) {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [imageSelected, setImageSelected] = useState(0);
    const swiperRef = useRef<SwiperType | null>(null);

    useEffect(() => {
        if (swiperRef.current) {
            setImageSelected(swiperRef.current.activeIndex);
        }
    }, []);

    return (
        <div className="flex md:flex-row flex-col-reverse gap-3 h-screen">
            <Swiper
                modules={[Thumbs, FreeMode]}
                onSwiper={setThumbsSwiper}
                watchSlidesProgress={true}
                spaceBetween={10}
                slidesPerView={5}
                grabCursor={true}
                breakpoints={{
                    768 : {
                        direction:"vertical"
                    } , 
                    0:{
                        direction:"horizontal"
                    }

                }}
                freeMode={true}
                className="w-[70%] md:w-[10%] h-[10%] md:h-[60%] py-5"
            >
                {images.map((image, i) => (
                    <SwiperSlide
                        key={image.id}
                        onClick={() => {
                            setImageSelected(i);
                            if (swiperRef.current) {
                                swiperRef.current.slideTo(i);
                            }
                        }}
                        className={`flex justify-center items-center cursor-pointer bg-white  ${imageSelected === i ? "border-2 dark:border-blue-500 rounded-lg" : "opacity-60"}`}
                    >
                        {image?.url &&<Image
                            width={100}
                            height={100}
                            alt="product image"
                            className={` object-contain w-3/4 h-full`}
                            src={`/uploads/${path.basename(image.url)}`}
                        />}
                    </SwiperSlide>
                ))}
            </Swiper>

            <Swiper
                modules={[Thumbs, FreeMode ,EffectFade ]}
                thumbs={{ swiper: thumbsSwiper }}
                freeMode={false}
                watchSlidesProgress={true}
                spaceBetween={10}
                effect="fade"
                grabCursor={true}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    if (thumbsSwiper) {
                        swiper.thumbs.swiper = thumbsSwiper;
                    }
                }}
                onSlideChange={(swiper) => setImageSelected(swiper.activeIndex)}
                className="flex-1 shadow-md dark:border-zinc-900 border-2 border-slate-100 rounded-3xl dark:shadow-black h-full"
            >
                {images.map((image, i) => (
                    <SwiperSlide
                        key={image.id}
                        className=" h-full w-full flex justify-center items-center rounded-3xl bg-white"
                    >
                        <Image
                            width={800}
                            height={800}
                            alt="product image"
                            className="object-contain w-[95%] h-full"
                            src={image.url}
                            priority={i === 0}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
