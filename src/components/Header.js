import React from 'react';
import Link from 'next/link'
const Header = () => {
    return ( 
        
        <div>
            <Link href="/">
                <a>Home</a>
            </Link>
            <Link href="/run/[:cmd]">
                <a>Command</a>
            </Link>
        </div> 
    );
}
 
export default Header;