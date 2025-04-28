// src/components/logo.tsx
import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="150" // Adjusted width for better display
      height="50" // Adjusted height for better display
      viewBox="0 0 300 100" // Adjusted viewBox based on content
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Shield Icon */}
      <path
        d="M20 48.3333C20 38.478 27.478 31 36.3333 31H63.6667C72.522 31 80 38.478 80 48.3333V60C80 78.1667 66.1667 89 50 89C33.8333 89 20 78.1667 20 60V48.3333Z"
        fill="#EFEFEF" // Shield inner color
        stroke="#B91C1C" // Shield border color (Red-700)
        strokeWidth="4"
      />
      <path
        d="M38 58L48 68L66 50"
        stroke="#B91C1C" // Checkmark color (Red-700)
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text: Roshan VM */}
      <text
        x="95" // Adjusted position
        y="60" // Adjusted position
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="36"
        fontWeight="bold"
        fill="#B91C1C" // Text color (Red-700)
      >
        Roshan VM
      </text>

      {/* Text: Vulnerability Management */}
      <text
        x="95" // Adjusted position
        y="85" // Adjusted position
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fill="#B91C1C" // Text color (Red-700)
      >
        Vulnerability Management
      </text>

      {/* White dot inside 'o' */}
       <circle cx="163" cy="53" r="6" fill="white" />
    </svg>
  );
};
