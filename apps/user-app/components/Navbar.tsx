import React from 'react'
import { FloatingNav } from './ui/floating-navbar'

 const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];
 
const Navbar = () => {
  return (
    <div>
        <FloatingNav navItems={navItems} />
    </div>
  )
}

export default Navbar
