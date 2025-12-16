import React from 'react';

export default function Footer() {
  return (
    <div className=" flex justify-between items-center flex-wrap gap-4 px-4 py-1 text-[#718096] text-xs ">
      <div>© 2025 Powered by Quantum AI Global. All Rights Reserved.</div>
      <div className="flex gap-4 flex-wrap ">
        <a>Home Page</a>
        <a>License</a>
        <a>Terms of Use</a>
        <a>Privacy Policy</a>
      </div>
    </div>
  );
}
