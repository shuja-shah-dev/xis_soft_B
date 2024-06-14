import React from 'react';
import { Link } from 'react-router-dom';

function Footer({ image }) {
  return (
    <div className=" pb-[40px] "   style={{ fontFamily: 'Gilroy' }}>
      <div
        className="border-dashed border border-[#876EE6] w-[80%] m-auto rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(2.700000047683716px)',
        }}
      >
        <h2
          className="text-center text-white text-[32px] font-semibold my-[20px]"

        >
          Connect the Nodes to Get your Results
        </h2>
        <Link
          className="mb-10 text-white text-xl ml-[40px] top-8 absolute"
          to="/"
        >
          BACK
        </Link>
        {image && (
          <div className="">
            <img
              src={image}
              alt="Detected"
              width={400}
              className="h-[600px] m-auto my-[30px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Footer;
