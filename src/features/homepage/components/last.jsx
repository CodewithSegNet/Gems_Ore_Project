import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
const First = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113287/gems_ore/first.svg";
const Second = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113288/gems_ore/second.svg";
const Third = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113291/gems_ore/third.svg";
const Fourth = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113293/gems_ore/fouth.svg";



const LastSection = () => {
  
  return (
    <section className="max-w-screen-2xl mx-auto my-[50px] md:my-[104px]">
      <div className="flex flex-col md:flex-row items-center mx-4 justify-center gap-4 md:gap-24">

<div className="flex flex-col lg:flex-row items-center gap-4">
    <img src={First} alt="" />
    <p>Free Shipping Within Abuja (FCT)</p>
</div>

<div className="flex flex-col lg:flex-row items-center gap-4">
    <img src={Second} alt="" />
    <p>Speed of Light Delivery</p>
</div>

<div className="flex flex-col lg:flex-row  items-center gap-4">
    <img src={Third} alt="" />
    <p>100% Secure Payments</p>
</div>

<div className="flex flex-col lg:flex-row items-center gap-4">
    <img src={Fourth} alt="" />
    <p>Walk-in Store</p>
</div>


        </div>
    </section>
  );
};

export default LastSection;