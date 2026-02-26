import React, { useState } from "react";
import first from "../assets/Frame01.png";
import second from "../assets/jewels.png";

const FirstSection = () => {
  return (
    <>
      <section className="max-w-screen-2xl mx-auto my-[64px]">
        <div className="mx-4">
          <div className="flex mb-[34px] flex-col h-full text-start text-white">
            <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">Specially Crafted For You</h1>
            <p className="text-gray-400 lg:text-xl text-sm font-light">Crafted with intention - Designed around you</p>
          </div>

          {/* Desktop */}
          <div
            className="hidden lg:flex items-center pl-[9rem] mx-auto"
            style={{
              backgroundImage: `url(${first})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "auto",
              height: "434px",
              opacity: 1,
            }}
          >
            <div className="flex items-center justify-between gap-24">
              <img className="w-full h-[600px]" src={second} alt="" />
              <div className="text-white max-w-xl space-y-4">
                <h1 className="text-white lg:text-4xl text-2xl font-normal">Get a Custom-Crafted Masterpiece</h1>
                <p className="text-white lg:text-xl text-sm font-light">
                  Experience the beauty of a piece designed entirely around you,
                  from the first sketch to the final setting, thoughtfully crafted
                  to reflect your personality, your milestones, and the brilliance
                  you carry every day.
                </p>
                <button className="py-3 px-7 rounded-lg border hover:bg-primary duration-300 border-white">
                  Get One Now
                </button>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet */}
          <div className="lg:hidden flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${first})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Jewels image centered on top */}
            <div className="flex justify-center pt-6">
              <img
                src={second}
                alt=""
                className="w-[200px] md:w-[280px] object-contain"
              />
            </div>

            {/* Text content below */}
            <div className="text-white px-6 pb-8 pt-4 space-y-4">
              <h1 className="text-white text-2xl md:text-3xl font-normal">
                Get a Custom-Crafted Masterpiece
              </h1>
              <p className="text-white/80 text-sm md:text-base font-light">
                Experience the beauty of a piece designed entirely around you,
                from the first sketch to the final setting, thoughtfully crafted
                to reflect your personality, your milestones, and the brilliance
                you carry every day.
              </p>
              <button className="py-3 px-7 rounded-lg border hover:bg-primary duration-300 border-white">
                Get One Now
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default FirstSection;